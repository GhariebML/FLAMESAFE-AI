import math
from typing import List, Tuple, Optional
from app.models.evidence_chunk import EvidenceChunk
from app.rag.embeddings import get_embedding_provider
from app.core.config import settings


class EvidenceRetriever:
    """Retrieves relevant scientific text chunks based on semantic similarity."""

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

    @classmethod
    async def retrieve(
        cls,
        query: str,
        candidates: List[EvidenceChunk],
        top_k: int = 5,
        threshold: float = 0.3,
        investigation_id_filter: Optional[str] = None,
    ) -> List[Tuple[EvidenceChunk, float]]:
        if not candidates:
            return []

        embedder = get_embedding_provider()
        query_vec = await embedder.embed_query(query)
        scored: List[Tuple[EvidenceChunk, float]] = []

        q_terms = [t for t in query.lower().split() if len(t) > 3]

        for chunk in candidates:
            # Apply optional investigation filter
            if investigation_id_filter:
                doc = chunk.document
                if doc and str(doc.investigation_id) != investigation_id_filter:
                    continue

            # Calculate score using cosine if chunk.embedding exists, else lexical overlap + mock embedding
            sim = 0.0
            if chunk.embedding and len(chunk.embedding) == len(query_vec):
                sim = cls._cosine_similarity(query_vec, chunk.embedding)
            else:
                # Fallback to text term matching + pseudo embedding
                chunk_vec = await embedder.embed_query(chunk.chunk_text)
                sim = cls._cosine_similarity(query_vec, chunk_vec)

            # Boost if query terms appear in text
            chunk_lower = chunk.chunk_text.lower()
            keyword_bonus = sum(0.1 for t in q_terms if t in chunk_lower)
            final_score = min(1.0, sim * 0.7 + min(0.3, keyword_bonus))

            if final_score >= threshold:
                scored.append((chunk, round(final_score, 4)))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
