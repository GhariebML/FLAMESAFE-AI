from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.investigation_repo import InvestigationRepository
from app.schemas.ranking import RankingRequest, RankingResponse, RankedInvestigationItem
from app.ranking.scoring import RelevanceScorer


class RankingService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = InvestigationRepository(session)

    async def rank_investigations(self, req: RankingRequest) -> RankingResponse:
        investigations, _ = await self.repo.list_investigations(limit=100)

        results: List[RankedInvestigationItem] = []
        for inv in investigations:
            item = RelevanceScorer.calculate_score(
                investigation=inv,
                query=req.query,
                target_environment=req.target_environment,
                fuel_category=req.fuel_category,
                weights=req.weights,
            )
            results.append(item)

        results.sort(key=lambda x: x.relevance_score, reverse=True)

        return RankingResponse(
            query=req.query,
            target_environment=req.target_environment,
            applied_weights=req.weights or RelevanceScorer.DEFAULT_WEIGHTS,
            results=results,
        )
