from app.schemas.ranking import RankedInvestigationItem, RankingWeights


class RankingExplainability:
    """Provides transparent, human-readable rationales for relevance ranking."""

    @staticmethod
    def explain_factor_breakdown(
        item: RankedInvestigationItem,
        weights: RankingWeights | None = None,
    ) -> str:
        """Generates a detailed mathematical explanation of an investigation's relevance score."""
        fb = item.factor_breakdown
        w = weights or RankingWeights()

        d_pts = fb.domain_weighted if fb.domain_weighted is not None else round(w.domain_relevance * fb.domain_score, 2)
        f_pts = fb.fuel_weighted if fb.fuel_weighted is not None else round(w.fuel_compatibility * fb.fuel_score, 2)
        c_pts = fb.condition_weighted if fb.condition_weighted is not None else round(w.condition_compatibility * fb.condition_score, 2)
        m_pts = fb.mission_weighted if fb.mission_weighted is not None else round(w.mission_applicability * fb.mission_score, 2)
        q_pts = fb.quality_weighted if fb.quality_weighted is not None else round(w.metadata_quality * fb.quality_score, 2)

        explanation = (
            f"Overall Relevance: {item.relevance_score:.1f}/100. "
            f"Mathematical Composition: "
            f"Domain [{fb.domain_score:.1f} * {w.domain_relevance:.2f} = {d_pts:.1f} pts] + "
            f"Fuel [{fb.fuel_score:.1f} * {w.fuel_compatibility:.2f} = {f_pts:.1f} pts] + "
            f"Conditions [{fb.condition_score:.1f} * {w.condition_compatibility:.2f} = {c_pts:.1f} pts] + "
            f"Mission [{fb.mission_score:.1f} * {w.mission_applicability:.2f} = {m_pts:.1f} pts] + "
            f"Quality [{fb.quality_score:.1f} * {w.metadata_quality:.2f} = {q_pts:.1f} pts]."
        )
        if item.matched_factors:
            explanation += f" Confirmed criteria: {'; '.join(item.matched_factors[:3])}."
        if item.missing_factors:
            explanation += f" Identified gaps: {'; '.join(item.missing_factors[:2])}."
        return explanation

    @classmethod
    def generate_detailed_summary(
        cls,
        results: list[RankedInvestigationItem],
        query: str = "",
        weights: RankingWeights | None = None,
    ) -> str:
        """Synthesizes the overall ranking distribution and top matching recommendations."""
        if not results:
            return "No investigations found matching the provided query parameters."

        top_match = results[0]
        q_note = f" for inquiry '{query}'" if query else ""
        summary = (
            f"Ranked {len(results)} flight investigations{q_note}. "
            f"Top match is {top_match.acronym} ('{top_match.title}') "
            f"with a relevance score of {top_match.relevance_score}/100. "
            f"Primary strengths: {', '.join(top_match.matched_factors[:3])}."
        )
        if top_match.missing_factors:
            summary += f" Noted data gaps: {', '.join(top_match.missing_factors[:2])}."

        return summary

    @staticmethod
    def explain_comparison(
        item_a: RankedInvestigationItem,
        item_b: RankedInvestigationItem,
    ) -> str:
        """Explains why one investigation ranked higher than another."""
        diff = round(item_a.relevance_score - item_b.relevance_score, 2)
        if diff > 0:
            winner, loser = item_a, item_b
            rel = f"{winner.acronym} outranked {loser.acronym} by +{diff:.1f} points"
        elif diff < 0:
            winner, loser = item_b, item_a
            rel = f"{winner.acronym} outranked {loser.acronym} by +{abs(diff):.1f} points"
        else:
            return (
                f"{item_a.acronym} and {item_b.acronym} scored identically ({item_a.relevance_score}/100). "
                f"Tie broken by data completeness ({item_a.factor_breakdown.quality_score} vs {item_b.factor_breakdown.quality_score})."
            )

        fb_w, fb_l = winner.factor_breakdown, loser.factor_breakdown
        factors = [
            ("Domain", fb_w.domain_score - fb_l.domain_score),
            ("Fuel", fb_w.fuel_score - fb_l.fuel_score),
            ("Conditions", fb_w.condition_score - fb_l.condition_score),
            ("Mission", fb_w.mission_score - fb_l.mission_score),
            ("Quality", fb_w.quality_score - fb_l.quality_score),
        ]
        factors.sort(key=lambda x: x[1], reverse=True)
        top_diff = [f"{f[0]} (+{f[1]:.1f})" for f in factors if f[1] > 0]

        return f"{rel}. Main advantages: {', '.join(top_diff[:2]) if top_diff else 'overall balanced metadata'}."
