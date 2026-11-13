from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.comparison_service import ComparisonService
from app.schemas.comparison import ComparisonRequest, ComparisonResponse
from app.schemas.common import APIResponseEnvelope

router = APIRouter(tags=["Comparison"])


@router.post("/compare", response_model=APIResponseEnvelope[ComparisonResponse], status_code=status.HTTP_200_OK)
async def compare_investigations(
    payload: ComparisonRequest,
    db: AsyncSession = Depends(get_db),
):
    """Module 3: Scientific Investigation Comparison workspace."""
    service = ComparisonService(db)
    comparison_data = await service.compare_investigations(payload)
    return APIResponseEnvelope(
        success=True,
        message=f"Comparison generated across {len(comparison_data.investigations)} investigations",
        data=comparison_data,
    )
