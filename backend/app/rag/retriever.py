import math
from typing import Dict, List, Optional, Tuple

from app.core.config import settings
from app.core.logging import logger
from app.models.evidence_chunk import EvidenceChunk
from app.rag.embeddings import BaseEmbeddingProvider, MockEmbeddingProvider, get_embedding_provider
from app.rag.generator import GeminiProviderError


class EvidenceRetriever:
    """
    Retrieves relevant scientific text chunks using hybrid semantic cosine similarity
    and domain keyword overlap, while strictly enforcing embedding dimension, provider, and model compatibility.
    Never mixes mock SHA-256 vectors with live Gemini vectors.
    """

    @staticmethod
    def _cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return dot / (norm_a * norm_b)

    @staticmethod
    def is_chunk_vector_compatible(chunk: EvidenceChunk, embedder: BaseEmbeddingProvider, query_dim: int) -> bool:
        """
        Verifies that a stored chunk vector matches the active embedding provider, model, and dimension.
        Strictly prevents comparing mock vectors against Gemini vectors (or vice-versa).
        """
        if not chunk.embedding or not isinstance(chunk.embedding, list):
            return False
        if len(chunk.embedding) != query_dim or chunk.embedding_dimension != embedder.dimension:
            return False

        chunk_provider = str(chunk.embedding_provider or "").lower().strip()
        chunk_model = str(chunk.embedding_model or "").lower().strip()
        chunk_is_mock = (
            chunk_provider == "mock"
            or "mock" in chunk_model
            or "sha256" in chunk_model
        )
        if chunk_is_mock != embedder.is_mock:
            return False

        if not embedder.is_mock:
            if chunk_provider != embedder.provider_name.lower():
                return False
            if chunk_model != embedder.model_name.lower():
                return False

        return True

    @classmethod
    async def retrieve(
        cls,
        query: str,
        candidates: List[EvidenceChunk],
        top_k: int = 5,
        threshold: float = 0.25,
        investigation_id_filter: Optional[str] = None,
        embedder: Optional[BaseEmbeddingProvider] = None,
    ) -> List[Tuple[EvidenceChunk, float]]:
        if not candidates or not query or not query.strip():
            return []

        active_embedder = embedder or get_embedding_provider()
        try:
            query_vec = await active_embedder.embed_query(query)
        except GeminiProviderError as err:
            if not settings.AI_FALLBACK_TO_MOCK:
                raise
            logger.warning(
                f"Gemini query embedding failed ({err.message}); switching retrieval to isolated MockEmbeddingProvider."
            )
            active_embedder = MockEmbeddingProvider(dimension=active_embedder.dimension)
            query_vec = await active_embedder.embed_query(query)

        filtered_candidates: List[EvidenceChunk] = []
        for chunk in candidates:
            if investigation_id_filter:
                doc = chunk.document
                inv = doc.investigation if doc else None
                f_val = investigation_id_filter.lower()
                if doc and str(doc.investigation_id).lower() != f_val:
                    if not inv or (inv.psi_id.lower() != f_val and inv.acronym.lower() != f_val):
                        continue
            filtered_candidates.append(chunk)

        if not filtered_candidates:
            return []

        # Batch-embed any candidate chunks whose stored vectors do not match active_embedder
        incompatible_chunks: List[EvidenceChunk] = [
            c for c in filtered_candidates if not cls.is_chunk_vector_compatible(c, active_embedder, len(query_vec))
        ]
        computed_vectors: Dict[int, List[float]] = {}

        if incompatible_chunks:
            try:
                batch_vecs = await active_embedder.embed_documents([c.chunk_text for c in incompatible_chunks])
                for c_obj, vec in zip(incompatible_chunks, batch_vecs):
                    computed_vectors[id(c_obj)] = vec
            except GeminiProviderError:
                if not settings.AI_FALLBACK_TO_MOCK:
                    raise
                mock_emb = MockEmbeddingProvider(dimension=active_embedder.dimension)
                active_embedder = mock_emb
                query_vec = await mock_emb.embed_query(query)
                batch_vecs = await mock_emb.embed_documents([c.chunk_text for c in filtered_candidates])
                for c_obj, vec in zip(filtered_candidates, batch_vecs):
                    computed_vectors[id(c_obj)] = vec

        scored: List[Tuple[EvidenceChunk, float]] = []

        stopwords = {
            "the", "and", "for", "with", "that", "this", "from", "are", "was",
            "were", "have", "has", "how", "what", "when", "where", "which",
            "does", "did", "can", "will", "next", "year", "into", "about",
            "over", "under", "between", "observed", "show", "data",
        }
        q_terms = [
            t.strip("?,.:;()[]")
            for t in query.lower().split()
            if len(t.strip("?,.:;()[]")) > 2 and t.strip("?,.:;()[]") not in stopwords
        ]

        for chunk in filtered_candidates:
            if id(chunk) in computed_vectors:
                chunk_vec = computed_vectors[id(chunk)]
            elif chunk.embedding:
                chunk_vec = chunk.embedding
            else:
                chunk_vec = await active_embedder.embed_query(chunk.chunk_text)

            sim = cls._cosine_similarity(query_vec, chunk_vec)

            chunk_lower = chunk.chunk_text.lower()
            sec_lower = (chunk.section_name or "").lower()
            doc = chunk.document
            inv_acronym = (doc.investigation.acronym.lower() if (doc and doc.investigation) else "")

            keyword_hits = sum(
                1 for t in q_terms
                if t in chunk_lower or t in sec_lower or (inv_acronym and t == inv_acronym)
            )
            # In mock SHA-256 embedding mode, require at least one meaningful term match to prevent out-of-domain hallucinations
            if active_embedder.is_mock and keyword_hits == 0:
                continue

            keyword_bonus = min(0.45, keyword_hits * 0.12)
            final_score = min(1.0, max(0.0, sim * 0.65) + keyword_bonus)

            if final_score >= threshold:
                scored.append((chunk, round(final_score, 4)))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
