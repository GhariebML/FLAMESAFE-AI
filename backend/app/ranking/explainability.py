from typing import List
from app.schemas.ranking import RankedInvestigationItem


class RankingExplainability:
    """Provides transparent, human-readable rationales for relevance ranking."""

    @staticmethod
    def generate_detailed_summary(results: List[RankedInvestigationItem]) -> str:
        if not results:
            return "No investigations found matching the provided query parameters."

        top_match = results[0]
        summary = (
            f"Top ranked investigation is {top_match.acronym} ('{top_match.title}') "
            f"with a relevance score of {top_match.relevance_score}/100. "
            f"Primary strengths: {', '.join(top_match.matched_factors[:3])}."
        )
        if top_match.missing_factors:
            summary += f" Noted data gaps: {', '.join(top_match.missing_factors[:2])}."
        return summary
