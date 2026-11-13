import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.models.evidence_chunk import EvidenceChunk
from app.rag.embeddings import BaseEmbeddingProvider, get_embedding_provider
from app.rag.generator import GeminiProviderError, sanitize_secret


class EmbeddingBackfillService:
    """
    Controlled, resumable re-embedding & backfill service for EvidenceChunk records.
    Identifies chunks with missing embeddings, 'mock' embeddings, or mismatched model/dimension,
    processes them in batches, and updates embedding provenance metadata safely.
    """

    @staticmethod
    def compute_content_hash(text: str) -> str:
        return hashlib.sha256((text or "").strip().encode("utf-8")).hexdigest()

    @classmethod
    def needs_reembedding(
        cls,
        chunk: EvidenceChunk,
        target_provider: str,
        target_model: str,
        target_dimension: int,
    ) -> bool:
        if not chunk.embedding or not isinstance(chunk.embedding, list):
            return True
        if len(chunk.embedding) != target_dimension:
            return True
        if chunk.embedding_dimension != target_dimension:
            return True
        if (chunk.embedding_provider or "").lower() != target_provider.lower():
            return True
        if (chunk.embedding_model or "").lower() != target_model.lower():
            return True
        expected_hash = cls.compute_content_hash(chunk.chunk_text)
        if chunk.content_hash and chunk.content_hash != expected_hash:
            return True
        return False

    @classmethod
    async def backfill_chunks(
        cls,
        session: AsyncSession,
        embedder: Optional[BaseEmbeddingProvider] = None,
        batch_size: int = 10,
        limit: Optional[int] = None,
        require_live_provider: bool = False,
    ) -> Dict[str, Any]:
        """
        Scans EvidenceChunk rows and re-embeds those missing valid target embeddings in batches.
        Can be safely interrupted and resumed because each completed batch is committed immediately.
        """
        active_embedder = embedder or get_embedding_provider(strict=require_live_provider)
        if require_live_provider and active_embedder.is_mock:
            raise GeminiProviderError(
                message="Live Gemini embedding provider required for backfill, but mock provider is active.",
                error_category="MISSING_API_KEY",
                http_status=401,
                retryable=False,
            )

        res = await session.execute(select(EvidenceChunk).order_by(EvidenceChunk.id))
        all_chunks: List[EvidenceChunk] = list(res.scalars().all())

        candidates: List[EvidenceChunk] = []
        skipped_count = 0
        for chunk in all_chunks:
            if not chunk.chunk_text or not chunk.chunk_text.strip():
                skipped_count += 1
                continue
            if cls.needs_reembedding(
                chunk=chunk,
                target_provider=active_embedder.provider_name,
                target_model=active_embedder.model_name,
                target_dimension=active_embedder.dimension,
            ):
                candidates.append(chunk)
            else:
                skipped_count += 1

        if limit is not None and limit > 0:
            candidates = candidates[:limit]

        updated_count = 0
        failed_count = 0
        errors: List[str] = []

        effective_batch = max(1, batch_size)
        for start_idx in range(0, len(candidates), effective_batch):
            batch = candidates[start_idx : start_idx + effective_batch]
            texts = [c.chunk_text for c in batch]
            try:
                vectors = await active_embedder.embed_documents(texts)
                now_utc = datetime.now(timezone.utc)
                for chunk_obj, vec in zip(batch, vectors):
                    chunk_obj.embedding = vec
                    chunk_obj.embedding_provider = active_embedder.provider_name
                    chunk_obj.embedding_model = active_embedder.model_name
                    chunk_obj.embedding_dimension = active_embedder.dimension
                    chunk_obj.embedded_at = now_utc
                    chunk_obj.content_hash = cls.compute_content_hash(chunk_obj.chunk_text)
                    updated_count += 1
                await session.commit()
            except Exception as exc:
                await session.rollback()
                failed_count += len(batch)
                clean_err = sanitize_secret(str(exc))
                logger.warning(f"Embedding backfill batch at offset {start_idx} failed: {clean_err}")
                errors.append(clean_err)

        return {
            "total_chunks_scanned": len(all_chunks),
            "candidates_identified": len(candidates),
            "updated_count": updated_count,
            "skipped_up_to_date_count": skipped_count,
            "failed_count": failed_count,
            "target_provider": active_embedder.provider_name,
            "target_model": active_embedder.model_name,
            "target_dimension": active_embedder.dimension,
            "is_mock_provider": active_embedder.is_mock,
            "errors": errors,
        }
