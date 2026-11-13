from typing import List, Optional
from pydantic import BaseModel, Field


class CitationItem(BaseModel):
    citation_id: str
    investigation_acronym: str
    psi_id: str
    document_title: str
    doi: Optional[str] = None
    source_url: Optional[str] = None
    page_number: Optional[int] = None
    section_name: Optional[str] = None
    excerpt: str
    verification_status: str = "Verified Source"


class AssistantQueryRequest(BaseModel):
    query: str = Field(..., min_length=5, description="Scientific research question")
    investigation_id_filter: Optional[str] = Field(
        default=None, description="Optional restriction to a specific investigation UUID, PSI ID, or acronym"
    )
    max_citations: int = Field(default=3, ge=1, le=10)


class AssistantQueryResponse(BaseModel):
    query: str
    answer: str
    citations: List[CitationItem]
    scientific_uncertainty_note: Optional[str] = None
    has_sufficient_evidence: bool = True
    ai_provider: str
    model_name: str
    is_mock_provider: bool = False
    prompt_version: str = "1.1.0"
