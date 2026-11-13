from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.scenario_service import ScenarioService
from app.schemas.scenario import ScenarioRequest, ScenarioAnalysisResponse
from app.schemas.common import APIResponseEnvelope

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])


@router.post("/analyze", response_model=APIResponseEnvelope[ScenarioAnalysisResponse], status_code=status.HTTP_200_OK)
async def analyze_mission_scenario(
    payload: ScenarioRequest,
    db: AsyncSession = Depends(get_db),
):
    """Module 5: Mission Scenario Analyzer evaluating exploration fire safety regimes and research gaps."""
    service = ScenarioService(db)
    analysis = await service.analyze_scenario(payload)
    return APIResponseEnvelope(
        success=True,
        message=f"Scenario analysis completed for environment: {analysis.target_environment}",
        data=analysis,
    )
