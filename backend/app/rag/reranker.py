
from app.models.evidence_chunk import EvidenceChunk


class ScientificReranker:
    """
    Reranks retrieved evidence passages based on domain terminology,
    experimental measurement presence, and citation clarity.
    """

    @staticmethod
    def rerank(
        query: str,
        retrieved_items: list[tuple[EvidenceChunk, float]],
    ) -> list[tuple[EvidenceChunk, float]]:
        reranked = []
        clean_query = query.lower().replace("-", " ")
        q_terms = {t.strip("?,.;:!\"'") for t in clean_query.split() if len(t) > 2}

        for chunk, base_score in retrieved_items:
            score = base_score
            text_lower = chunk.chunk_text.lower()
            doc = chunk.document
            inv = doc.investigation if doc else None

            # Boost if chunk contains quantitative units
            if any(u in text_lower for u in ["cm/s", "kpa", "mm", "%", "m2", "deg c"]):
                score += 0.08

            # Boost if investigation acronym matches query
            if inv and inv.acronym and inv.acronym.lower() in q_terms:
                score += 0.15

            # Boost if section header matches
            if chunk.section_name and any(t in chunk.section_name.lower() for t in q_terms):
                score += 0.05

            reranked.append((chunk, round(min(1.0, score), 4)))

        reranked.sort(key=lambda x: x[1], reverse=True)
        return reranked
