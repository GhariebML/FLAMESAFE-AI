from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ResearchIntentSchema(BaseModel):
    intent_type: str = Field(
        default="scientific_comparison",
        description="scientific_comparison | dataset_construction | flammability_analysis | smoke_detection | gap_analysis",
    )
    research_domain: str = Field(default="combustion_science")
    fuel_type: str = Field(default="all")
    gravity_regime: str = Field(default="microgravity")
    target_investigations: List[str] = Field(default_factory=list)
    variables_of_interest: List[str] = Field(
        default_factory=lambda: ["oxygen_concentration", "flame_spread_rate", "airflow_velocity"]
    )
    research_objectives: List[str] = Field(
        default_factory=lambda: ["compare_experimental_conditions", "analyze_material_flammability"]
    )
    required_file_types: List[str] = Field(
        default_factory=lambda: ["experimental_tables", "analyzed_data", "research_papers"]
    )
    required_outputs: List[str] = Field(
        default_factory=lambda: ["curated_dataset", "comparison", "scientific_report"]
    )
    ambiguities_detected: List[str] = Field(default_factory=list)
    search_strategy: str = Field(default="hybrid_local_and_psi_catalog")


class ExistingDataCoverageSchema(BaseModel):
    classification: str = Field(
        ...,
        description="FULLY_AVAILABLE | PARTIALLY_AVAILABLE | REQUIRES_INDEXING | REQUIRES_NEW_DATA | INSUFFICIENT_EVIDENCE",
    )
    matched_investigations: List[str] = Field(default_factory=list)
    existing_datasets_matched: List[str] = Field(default_factory=list)
    documents_available_count: int = 0
    evidence_chunks_count: int = 0
    embeddings_ready: bool = True
    missing_investigations: List[str] = Field(default_factory=list)
    missing_variables: List[str] = Field(default_factory=list)
    reuse_recommendation: str


class PSICatalogEntrySchema(BaseModel):
    investigation_id: str
    psi_id: str
    acronym: str
    title: str
    research_area: str
    description: str
    facility: Optional[str] = None
    gravity_regime: str = "Microgravity (~0g)"
    fuel_types: List[str] = Field(default_factory=list)
    doi: Optional[str] = None
    source_url: str
    available_document_categories: List[str] = Field(default_factory=list)
    accessibility_status: str = "VERIFIED_LOCAL_AND_PUBLIC_METADATA"
    relevance_score: float = 0.0
    last_verified_at: datetime


class FileSelectionBreakdownSchema(BaseModel):
    question_relevance_q: float = Field(..., ge=0.0, le=100.0)
    file_type_relevance_t: float = Field(..., ge=0.0, le=100.0)
    content_coverage_c: float = Field(..., ge=0.0, le=100.0)
    provenance_quality_p: float = Field(..., ge=0.0, le=100.0)
    accessibility_a: float = Field(..., ge=0.0, le=100.0)
    priority_score_f: float = Field(..., ge=0.0, le=100.0)


class PSIFileManifestItemSchema(BaseModel):
    file_identifier: str
    psi_investigation_id: str
    investigation_acronym: str
    file_name: str
    file_category: str
    file_type: str
    mime_type: str
    file_size_bytes: Optional[int] = None
    source_url: str
    doi: Optional[str] = None
    content_coverage: List[str] = Field(default_factory=list)
    provenance_info: Dict[str, Any] = Field(default_factory=dict)
    accessibility: str = "DIRECT_VERIFIED_SEED"
    requires_user_handoff: bool = False
    selected: bool = True
    score_breakdown: Optional[FileSelectionBreakdownSchema] = None
    selection_rationale: str = ""


class AcquisitionRequestSchema(BaseModel):
    request_id: Optional[str] = None
    file_identifiers: List[str] = Field(default_factory=list)


class AcquisitionJobSchema(BaseModel):
    id: str
    request_id: Optional[str] = None
    file_identifier: str
    investigation_acronym: str
    source_url: str
    status: str
    http_status: Optional[int] = None
    content_type: Optional[str] = None
    bytes_downloaded: int = 0
    sha256_hash: Optional[str] = None
    storage_uri: Optional[str] = None
    retry_count: int = 0
    handoff_instructions: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class DatasetItemSchema(BaseModel):
    id: str
    investigation_id: str
    investigation_acronym: str
    experimental_run_id: Optional[str] = None
    run_name: str
    parameter_name: str
    original_value: Optional[float] = None
    original_unit: str
    normalized_value: Optional[float] = None
    normalized_unit: str
    conversion_formula: str
    uncertainty: Optional[float] = None
    fuel_type: str
    gravity_regime: str
    oxygen_pct: Optional[float] = None
    pressure_kpa: Optional[float] = None
    airflow_cm_s: Optional[float] = None
    source_document_id: Optional[str] = None
    source_doi: Optional[str] = None
    source_url: Optional[str] = None
    page_number: Optional[int] = None
    section_name: Optional[str] = None
    extraction_method: str
    evidence_classification: str
    validation_status: str
    validation_notes: Optional[str] = None


class DatasetValidationReportSchema(BaseModel):
    id: str
    dataset_version_id: str
    overall_status: str
    total_records: int
    passed_count: int
    warning_count: int
    quarantined_count: int
    rejected_count: int
    provenance_coverage_pct: float
    null_handling_verified: bool
    unit_checks_summary: Dict[str, Any] = Field(default_factory=dict)
    quarantined_items: List[Dict[str, Any]] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    created_at: datetime


class DatasetVersionSchema(BaseModel):
    id: str
    dataset_id: str
    version_number: int
    version_tag: str
    schema_version: str
    content_fingerprint: str
    source_investigation_ids: List[str]
    original_file_ids: List[str]
    source_document_ids: List[str]
    record_count: int
    measurement_count: int
    validation_status: str
    processing_config: Dict[str, Any]
    unit_conversions: List[Dict[str, Any]]
    file_hashes: Dict[str, str]
    provenance_manifest: Dict[str, Any]
    export_uris: Optional[Dict[str, str]] = None
    created_at: datetime


class DatasetSummarySchema(BaseModel):
    id: str
    dataset_key: str
    name: str
    research_objective: str
    research_query: str
    schema_version: str
    latest_version_number: int
    source_investigation_ids: List[str]
    status: str
    created_at: datetime
    updated_at: datetime


class DatasetDetailResponse(DatasetSummarySchema):
    latest_version: Optional[DatasetVersionSchema] = None
    items: List[DatasetItemSchema] = Field(default_factory=list)
    quality_report: Optional[DatasetValidationReportSchema] = None


class AgentRunSchema(BaseModel):
    id: str
    agent_id: str
    agent_name: str
    status: str
    input_summary: Optional[Dict[str, Any]] = None
    output_summary: Optional[Dict[str, Any]] = None
    tools_invoked: List[str] = Field(default_factory=list)
    retry_count: int = 0
    error_category: Optional[str] = None
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None


class WorkflowEventSchema(BaseModel):
    id: str
    request_id: str
    thread_id: str
    from_state: Optional[str] = None
    to_state: str
    agent_id: Optional[str] = None
    event_type: str
    message: str
    payload: Optional[Dict[str, Any]] = None
    created_at: datetime


class ResearchRequestCreate(BaseModel):
    question: str = Field(..., min_length=5, description="Natural-language scientific research question")
    require_approval: bool = Field(
        default=False,
        description="If true, pauses workflow at AWAITING_APPROVAL before file acquisition & dataset construction",
    )
    force_psi_discovery: bool = Field(
        default=False,
        description="If true, runs NASA PSI catalog discovery even when local coverage is available",
    )


class ApprovalDecisionRequest(BaseModel):
    decision: str = Field(
        ...,
        description="APPROVE | REJECT | MODIFY_PLAN | RESUME_WORKFLOW",
    )
    selected_file_identifiers: Optional[List[str]] = None
    decided_by: str = Field(default="Lead Researcher")
    reason: Optional[str] = Field(default="Verified scientific relevance and file bounds.")


class ReviseIntentRequest(BaseModel):
    updated_question: Optional[str] = None
    fuel_type: Optional[str] = None
    gravity_regime: Optional[str] = None
    variables_of_interest: Optional[List[str]] = None
    require_approval: bool = False


class ResearchRequestDetailResponse(BaseModel):
    id: str
    thread_id: str
    user_question: str
    status: str
    require_approval: bool
    approval_status: str
    research_intent: Optional[ResearchIntentSchema] = None
    existing_data_coverage: Optional[ExistingDataCoverageSchema] = None
    discovered_investigations: List[PSICatalogEntrySchema] = Field(default_factory=list)
    candidate_files: List[PSIFileManifestItemSchema] = Field(default_factory=list)
    selected_files: List[PSIFileManifestItemSchema] = Field(default_factory=list)
    acquisition_summary: Optional[Dict[str, Any]] = None
    validation_summary: Optional[Dict[str, Any]] = None
    dataset_id: Optional[str] = None
    dataset_version_id: Optional[str] = None
    indexing_status: str
    final_answer: Optional[str] = None
    final_report: Optional[Dict[str, Any]] = None
    error_log: List[Dict[str, Any]] = Field(default_factory=list)
    agent_runs: List[AgentRunSchema] = Field(default_factory=list)
    workflow_events: List[WorkflowEventSchema] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
