from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.investigation_service import InvestigationService
from app.schemas.overview import MissionOverviewResponse
from app.schemas.common import APIResponseEnvelope

router = APIRouter(tags=["Overview"])


@router.get("/overview", response_model=APIResponseEnvelope[MissionOverviewResponse], status_code=status.HTTP_200_OK)
async def get_mission_overview(db: AsyncSession = Depends(get_db)):
    """Module 1: Mission Intelligence Dashboard overview metrics."""
    service = InvestigationService(db)
    overview_data = await service.get_overview()
    return APIResponseEnvelope(
        success=True,
        message="Mission overview metrics retrieved successfully",
        data=overview_data,
    )
