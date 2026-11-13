from pydantic import BaseModel, Field


class CitationItem(BaseModel):
    citation_id: str
    investigation_acronym: str
    psi_id: str
    document_title: str
    doi: str | None = None
    source_url: str | None = None
    page_number: int | None = None
    section_name: str | None = None
    excerpt: str
    verification_status: str = "Verified Source"  # Verified Source | Secondary Reference | Unverified
    chunk_id: str | None = None


class AssistantQueryRequest(BaseModel):
    query: str = Field(..., min_length=5, description="Scientific research question")
    investigation_id_filter: str | None = Field(
        default=None, description="Optional restriction to a specific investigation UUID"
    )
    max_citations: int = Field(default=3, ge=1, le=10)


class AssistantQueryResponse(BaseModel):
    query: str
    answer: str
    citations: list[CitationItem]
    scientific_uncertainty_note: str | None = None
    has_sufficient_evidence: bool = True
    ai_provider: str
    model_name: str
    is_mock_provider: bool = False
    prompt_version: str = "1.1.0"
