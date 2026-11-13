import math
from typing import List, Tuple, Optional
from app.models.evidence_chunk import EvidenceChunk
from app.rag.embeddings import get_embedding_provider


class EvidenceRetriever:
    """
    Retrieves relevant scientific text chunks using hybrid semantic cosine similarity
    and domain keyword overlap, while strictly enforcing embedding dimension and model compatibility.
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

    @classmethod
    async def retrieve(
        cls,
        query: str,
        candidates: List[EvidenceChunk],
        top_k: int = 5,
        threshold: float = 0.25,
        investigation_id_filter: Optional[str] = None,
    ) -> List[Tuple[EvidenceChunk, float]]:
        if not candidates:
            return []

        embedder = get_embedding_provider()
        query_vec = await embedder.embed_query(query)
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

        for chunk in candidates:
            if investigation_id_filter:
                doc = chunk.document
                inv = doc.investigation if doc else None
                f_val = investigation_id_filter.lower()
                if doc and str(doc.investigation_id).lower() != f_val:
                    if not inv or (inv.psi_id.lower() != f_val and inv.acronym.lower() != f_val):
                        continue

            # Enforce vector dimension & model compatibility — never mix incompatible embedding models
            has_compatible_vector = (
                chunk.embedding is not None
                and len(chunk.embedding) == len(query_vec)
                and (chunk.embedding_dimension in (None, embedder.dimension))
                and (chunk.embedding_model in (None, embedder.model_name))
            )

            if has_compatible_vector and chunk.embedding:
                sim = cls._cosine_similarity(query_vec, chunk.embedding)
            else:
                chunk_vec = await embedder.embed_query(chunk.chunk_text)
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
            if embedder.is_mock and keyword_hits == 0:
                continue

            keyword_bonus = min(0.45, keyword_hits * 0.12)
            final_score = min(1.0, max(0.0, sim * 0.65) + keyword_bonus)

            if final_score >= threshold:
                scored.append((chunk, round(final_score, 4)))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
