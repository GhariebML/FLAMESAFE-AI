from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.ranking_service import RankingService
from app.schemas.ranking import RankingRequest, RankingResponse
from app.schemas.common import APIResponseEnvelope

router = APIRouter(tags=["Ranking"])


@router.post("/rank", response_model=APIResponseEnvelope[RankingResponse], status_code=status.HTTP_200_OK)
async def rank_investigations(
    payload: RankingRequest,
    db: AsyncSession = Depends(get_db),
):
    """Module 4: Scientific Relevance Ranking based on multi-factor weighted scoring."""
    service = RankingService(db)
    ranking_data = await service.rank_investigations(payload)
    return APIResponseEnvelope(
        success=True,
        message=f"Ranked {len(ranking_data.results)} investigations according to scientific relevance criteria",
        data=ranking_data,
    )
