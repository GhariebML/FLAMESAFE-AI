from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.investigation_service import InvestigationService
from app.schemas.investigation import (
    InvestigationSummarySchema,
    InvestigationDetailSchema,
    InvestigationFilterParams,
)
from app.schemas.common import APIResponseEnvelope, PaginatedResponse

router = APIRouter(prefix="/investigations", tags=["Investigations"])


@router.get("", response_model=APIResponseEnvelope[PaginatedResponse[InvestigationSummarySchema]], status_code=status.HTTP_200_OK)
async def list_investigations(
    query: Optional[str] = Query(None, description="Search across title, acronym, PSI ID, or description"),
    research_area: Optional[str] = Query(None, description="Filter by scientific research area"),
    fuel_type: Optional[str] = Query(None, description="Filter by fuel category or fuel name"),
    gravity_regime: Optional[str] = Query(None, description="Filter by gravity regime"),
    acronym: Optional[str] = Query(None, description="Filter by acronym (e.g., BASS, SAFFIRE)"),
    sort_by: Optional[str] = Query(None, description="Sort order: acronym or title"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
):
    """Module 2: Investigation Explorer listing with multi-facet filters, sorting, and pagination."""
    filters = InvestigationFilterParams(
        query=query,
        research_area=research_area,
        fuel_type=fuel_type,
        gravity_regime=gravity_regime,
        acronym=acronym,
        sort_by=sort_by,
    )
    service = InvestigationService(db)
    items, total = await service.list_investigations(filters=filters, page=page, page_size=page_size)

    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    paginated_data = PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )

    return APIResponseEnvelope(
        success=True,
        message=f"Retrieved {len(items)} investigations",
        data=paginated_data,
    )


@router.get("/{investigation_id}", response_model=APIResponseEnvelope[InvestigationDetailSchema], status_code=status.HTTP_200_OK)
async def get_investigation(
    investigation_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Module 2: Get complete investigation profile with experimental runs, measurements, and evidence chunks."""
    service = InvestigationService(db)
    detail = await service.get_investigation_detail(investigation_id)
    return APIResponseEnvelope(
        success=True,
        message=f"Investigation '{detail.acronym}' profile retrieved successfully",
        data=detail,
    )
