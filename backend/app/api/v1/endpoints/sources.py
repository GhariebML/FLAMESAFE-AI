from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories.document_repo import DocumentRepository
from app.schemas.investigation import DataSourceSchema
from app.schemas.common import APIResponseEnvelope
from app.core.exceptions import SourceNotFoundError

router = APIRouter(prefix="/sources", tags=["Sources"])


@router.get("/{source_id}", response_model=APIResponseEnvelope[DataSourceSchema], status_code=status.HTTP_200_OK)
async def get_source_provenance(
    source_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve external provenance, access metadata, and DOI verification for a scientific data source."""
    repo = DocumentRepository(db)
    source = await repo.get_source_by_id(source_id)
    if not source:
        raise SourceNotFoundError(source_id)

    return APIResponseEnvelope(
        success=True,
        message=f"Data source '{source.source_name}' retrieved successfully",
        data=DataSourceSchema.model_validate(source),
    )
