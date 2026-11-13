"""NASA Physical Sciences Informatics (PSI) Connector API endpoints (/api/v1/psi)."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.connectors.psi.discovery import PSIDiscoveryService
from app.connectors.psi.file_manifest import PSIFileManifestService
from app.schemas.common import APIResponseEnvelope
from app.schemas.multi_agent import PSICatalogEntrySchema, PSIFileManifestItemSchema

router = APIRouter(prefix="/psi", tags=["NASA PSI Connector"])


@router.get(
    "/investigations/search",
    response_model=APIResponseEnvelope[list[PSICatalogEntrySchema]],
    status_code=status.HTTP_200_OK,
)
async def search_psi_investigations(
    query: str = Query("", description="Natural-language or keyword search across NASA PSI catalog"),
    fuel_type: Optional[str] = Query(None, description="Filter by fuel category or material"),
    research_domain: Optional[str] = Query(None, description="Filter by combustion domain"),
):
    """Searches the verified 11-campaign NASA PSI microgravity combustion catalog."""
    results = PSIDiscoveryService.search_investigations(
        query=query,
        fuel_type=fuel_type,
        research_domain=research_domain,
    )
    return APIResponseEnvelope(data=[PSICatalogEntrySchema(**item) for item in results])


@router.get(
    "/investigations/{investigation_id}",
    response_model=APIResponseEnvelope[PSICatalogEntrySchema],
    status_code=status.HTTP_200_OK,
)
async def get_psi_investigation(investigation_id: str):
    """Returns NASA PSI catalog metadata for a specific investigation ID, PSI ID, or acronym."""
    item = PSIDiscoveryService.get_investigation_by_id(investigation_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"NASA PSI investigation '{investigation_id}' not found.")
    return APIResponseEnvelope(data=PSICatalogEntrySchema(**item))


@router.get(
    "/investigations/{investigation_id}/files",
    response_model=APIResponseEnvelope[list[PSIFileManifestItemSchema]],
    status_code=status.HTTP_200_OK,
)
async def list_psi_investigation_files(
    investigation_id: str,
    question: str = Query("", description="Optional research question to compute F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A"),
):
    """Lists and scores file manifest entries for a NASA PSI investigation."""
    inv = PSIDiscoveryService.get_investigation_by_id(investigation_id)
    acronym = inv["acronym"] if inv else investigation_id
    scored = PSIFileManifestService.score_and_select_files(
        user_question=question or f"Analyze {acronym} experimental data",
        research_intent={"variables_of_interest": ["oxygen_concentration", "flame_spread_rate", "airflow_velocity"]},
        target_acronyms=[acronym],
    )
    return APIResponseEnvelope(data=[PSIFileManifestItemSchema(**f) for f in scored])


@router.get(
    "/files/{file_id}",
    response_model=APIResponseEnvelope[PSIFileManifestItemSchema],
    status_code=status.HTTP_200_OK,
)
async def get_psi_file_metadata(file_id: str):
    """Returns metadata and priority scoring for a single NASA PSI file manifest item."""
    raw = PSIFileManifestService.get_file_by_id(file_id)
    if not raw:
        raise HTTPException(status_code=404, detail=f"NASA PSI file '{file_id}' not found.")
    scored = PSIFileManifestService.score_and_select_files(
        user_question=raw["file_name"],
        research_intent={"variables_of_interest": raw.get("content_coverage", [])},
        target_acronyms=[raw["investigation_acronym"]],
    )
    matched = next((f for f in scored if f["file_identifier"].lower() == file_id.lower()), raw)
    return APIResponseEnvelope(data=PSIFileManifestItemSchema(**matched))
