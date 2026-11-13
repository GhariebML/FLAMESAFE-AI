from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories.document_repo import DocumentRepository
from app.schemas.investigation import (
    DataSourceSchema,
    EvidenceCatalogItemSchema,
    SourceCatalogResponse,
)
from app.schemas.common import APIResponseEnvelope
from app.core.exceptions import SourceNotFoundError

router = APIRouter(prefix="/sources", tags=["Sources & Evidence"])


@router.get("", response_model=APIResponseEnvelope[SourceCatalogResponse], status_code=status.HTTP_200_OK)
async def list_sources_and_evidence(
    investigation: Optional[str] = Query(None, description="Filter by investigation acronym or ID"),
    query: Optional[str] = Query(None, description="Filter evidence excerpts or document titles"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve complete provenance catalog of verified NASA sources, publications, and evidence excerpts."""
    repo = DocumentRepository(db)
    all_sources = await repo.list_all_sources()
    all_docs = await repo.list_all_documents()
    all_chunks = await repo.get_all_chunks()

    evidence_items = []
    inv_filter = investigation.lower() if investigation else None
    q_filter = query.lower() if query else None

    for c in all_chunks:
        doc = c.document
        inv = doc.investigation if doc else None
        acronym = inv.acronym if inv else "NASA-PSI"
        psi_id = inv.psi_id if inv else "PSI-UNKNOWN"
        inv_id = str(inv.id) if inv else ""
        doc_title = doc.title if doc else "NASA Publication"

        if inv_filter and inv_filter not in acronym.lower() and inv_filter != inv_id.lower():
            continue

        if q_filter:
            searchable = f"{c.chunk_text} {doc_title} {c.section_name or ''} {doc.doi or ''}".lower()
            if q_filter not in searchable:
                continue

        evidence_items.append(
            EvidenceCatalogItemSchema(
                chunk_id=str(c.id),
                document_id=str(c.document_id),
                document_title=doc_title,
                document_type=doc.document_type if doc else "Journal Article",
                investigation_id=inv_id,
                investigation_acronym=acronym,
                psi_id=psi_id,
                doi=doc.doi if doc else None,
                source_url=doc.source_url if doc else None,
                page_number=c.page_number,
                section_name=c.section_name,
                chunk_text=c.chunk_text,
                verification_status="Verified Source" if (doc and doc.doi) else "Secondary Reference",
                embedding_provider=c.embedding_provider,
                embedding_model=c.embedding_model,
            )
        )

    catalog = SourceCatalogResponse(
        total_sources=len(all_sources),
        total_documents=len(all_docs),
        total_evidence_chunks=len(evidence_items),
        sources=[DataSourceSchema.model_validate(s) for s in all_sources],
        evidence_items=evidence_items,
    )

    return APIResponseEnvelope(
        success=True,
        message=f"Retrieved {len(evidence_items)} evidence excerpts across {len(all_docs)} documents",
        data=catalog,
    )


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
