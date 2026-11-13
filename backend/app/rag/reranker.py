from typing import List, Tuple
from app.models.evidence_chunk import EvidenceChunk


class ScientificReranker:
    """
    Reranks retrieved evidence passages based on domain terminology,
    experimental measurement presence, and citation clarity.
    """

    @staticmethod
    def rerank(
        query: str,
        retrieved_items: List[Tuple[EvidenceChunk, float]],
    ) -> List[Tuple[EvidenceChunk, float]]:
        reranked = []
        q_terms = set(query.lower().split())

        for chunk, base_score in retrieved_items:
            score = base_score
            text_lower = chunk.chunk_text.lower()

            # Boost if chunk contains quantitative units
            if any(u in text_lower for u in ["cm/s", "kpa", "mm", "%", "m2", "deg c"]):
                score += 0.08

            # Boost if investigation acronym or section header matches
            if chunk.section_name and any(t in chunk.section_name.lower() for t in q_terms):
                score += 0.05

            reranked.append((chunk, round(min(1.0, score), 4)))

        reranked.sort(key=lambda x: x[1], reverse=True)
        return reranked
