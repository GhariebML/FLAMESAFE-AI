from sqlalchemy.ext.asyncio import AsyncSession

from app.ranking.explainability import RankingExplainability
from app.ranking.scoring import RelevanceScorer
from app.repositories.investigation_repo import InvestigationRepository
from app.schemas.ranking import RankedInvestigationItem, RankingRequest, RankingResponse


class RankingService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = InvestigationRepository(session)

    async def rank_investigations(self, req: RankingRequest) -> RankingResponse:
        investigations, _ = await self.repo.list_investigations(limit=100)

        applied_weights = req.weights.normalized() if req.weights else RelevanceScorer.DEFAULT_WEIGHTS

        results: list[RankedInvestigationItem] = []
        for inv in investigations:
            item = RelevanceScorer.calculate_score(
                investigation=inv,
                query=req.query,
                target_environment=req.target_environment,
                fuel_category=req.fuel_category,
                weights=applied_weights,
            )
            results.append(item)

        # Strict deterministic sorting:
        # 1. relevance_score DESC
        # 2. metadata quality_score DESC
        # 3. supporting_evidence_count DESC
        # 4. acronym ASC (alphabetical tie-breaker)
        results.sort(
            key=lambda x: (
                -x.relevance_score,
                -x.factor_breakdown.quality_score,
                -x.supporting_evidence_count,
                x.acronym or "",
            )
        )

        detailed_summary = RankingExplainability.generate_detailed_summary(
            results=results,
            query=req.query,
            weights=applied_weights,
        )

        return RankingResponse(
            query=req.query,
            target_environment=req.target_environment,
            applied_weights=applied_weights,
            results=results,
            detailed_summary=detailed_summary,
        )
