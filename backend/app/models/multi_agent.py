from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, generate_uuid, utc_now


class ResearchRequest(Base, TimestampMixin):
    __tablename__ = "research_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    thread_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False, default=generate_uuid)
    user_question: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(40), index=True, nullable=False, default="RECEIVED")
    require_approval: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    approval_status: Mapped[str] = mapped_column(String(40), default="NOT_REQUIRED", nullable=False)

    research_intent: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    existing_data_coverage: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    discovered_investigations: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    candidate_files: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    selected_files: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    acquisition_summary: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    validation_summary: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    dataset_id: Mapped[Optional[str]] = mapped_column(String(36), index=True, nullable=True)
    dataset_version_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    indexing_status: Mapped[str] = mapped_column(String(40), default="PENDING", nullable=False)

    final_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    final_report: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    error_log: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)

    agent_runs: Mapped[List["AgentRun"]] = relationship(
        "AgentRun", back_populates="request", cascade="all, delete-orphan", lazy="selectin"
    )
    workflow_events: Mapped[List["WorkflowEvent"]] = relationship(
        "WorkflowEvent", back_populates="request", cascade="all, delete-orphan", lazy="selectin"
    )
    approvals: Mapped[List["DatasetApproval"]] = relationship(
        "DatasetApproval", back_populates="request", cascade="all, delete-orphan", lazy="selectin"
    )


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    request_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("research_requests.id", ondelete="CASCADE"), index=True, nullable=False
    )
    thread_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    agent_id: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    agent_name: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="RUNNING")
    input_summary: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    output_summary: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    tools_invoked: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_category: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    request: Mapped["ResearchRequest"] = relationship("ResearchRequest", back_populates="agent_runs")


class AgentCheckpoint(Base):
    __tablename__ = "agent_checkpoints"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    request_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("research_requests.id", ondelete="CASCADE"), index=True, nullable=False
    )
    thread_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    step_name: Mapped[str] = mapped_column(String(80), nullable=False)
    workflow_state: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    checkpoint_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class WorkflowEvent(Base):
    __tablename__ = "workflow_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    request_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("research_requests.id", ondelete="CASCADE"), index=True, nullable=False
    )
    thread_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    from_state: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    to_state: Mapped[str] = mapped_column(String(40), nullable=False)
    agent_id: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    request: Mapped["ResearchRequest"] = relationship("ResearchRequest", back_populates="workflow_events")


class PSIInvestigationCatalog(Base):
    __tablename__ = "psi_investigation_catalog"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    psi_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    acronym: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    research_area: Mapped[str] = mapped_column(String(160), index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    facility: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    gravity_regime: Mapped[str] = mapped_column(String(80), default="Microgravity (~0g)", nullable=False)
    fuel_types: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    doi: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    source_url: Mapped[str] = mapped_column(String(500), nullable=False)
    available_categories: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    accessibility_status: Mapped[str] = mapped_column(
        String(50), default="VERIFIED_LOCAL_AND_PUBLIC_METADATA", nullable=False
    )
    last_verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class PSIFileCatalog(Base):
    __tablename__ = "psi_file_catalog"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    file_identifier: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    psi_investigation_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    investigation_acronym: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_category: Mapped[str] = mapped_column(String(60), index=True, nullable=False)
    file_type: Mapped[str] = mapped_column(String(24), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(80), nullable=False)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source_url: Mapped[str] = mapped_column(String(500), nullable=False)
    doi: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    content_coverage: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    provenance_info: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    accessibility: Mapped[str] = mapped_column(String(40), default="DIRECT_VERIFIED_SEED", nullable=False)
    requires_user_handoff: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class AcquisitionJob(Base):
    __tablename__ = "acquisition_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    request_id: Mapped[Optional[str]] = mapped_column(String(36), index=True, nullable=True)
    file_identifier: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    investigation_acronym: Mapped[str] = mapped_column(String(50), nullable=False)
    source_url: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(40), index=True, nullable=False, default="PENDING")
    http_status: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    content_type: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    bytes_downloaded: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sha256_hash: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)
    storage_uri: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    handoff_instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class FileAsset(Base):
    __tablename__ = "file_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    file_identifier: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    investigation_acronym: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_backend: Mapped[str] = mapped_column(String(40), default="local_vault", nullable=False)
    storage_uri: Mapped[str] = mapped_column(String(500), nullable=False)
    sha256_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(80), nullable=False)
    source_url: Mapped[str] = mapped_column(String(500), nullable=False)
    file_version: Mapped[str] = mapped_column(String(32), default="1.0.0", nullable=False)
    metadata_payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    downloaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class DatasetJob(Base):
    __tablename__ = "dataset_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    request_id: Mapped[Optional[str]] = mapped_column(String(36), index=True, nullable=True)
    dataset_id: Mapped[Optional[str]] = mapped_column(String(36), index=True, nullable=True)
    dataset_version_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="RUNNING", nullable=False)
    records_extracted: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_validated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_quarantined: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    warnings_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class Dataset(Base, TimestampMixin):
    __tablename__ = "datasets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    dataset_key: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    research_objective: Mapped[str] = mapped_column(Text, nullable=False)
    research_query: Mapped[str] = mapped_column(Text, nullable=False)
    schema_version: Mapped[str] = mapped_column(String(32), default="1.0.0", nullable=False)
    latest_version_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    source_investigation_ids: Mapped[List[str]] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(String(40), default="READY", nullable=False)

    versions: Mapped[List["DatasetVersion"]] = relationship(
        "DatasetVersion", back_populates="dataset", cascade="all, delete-orphan", lazy="selectin"
    )


class DatasetVersion(Base):
    __tablename__ = "dataset_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    dataset_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("datasets.id", ondelete="CASCADE"), index=True, nullable=False
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    version_tag: Mapped[str] = mapped_column(String(32), nullable=False, default="v1.0.0")
    schema_version: Mapped[str] = mapped_column(String(32), default="1.0.0", nullable=False)
    content_fingerprint: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    source_investigation_ids: Mapped[List[str]] = mapped_column(JSON, nullable=False)
    original_file_ids: Mapped[List[str]] = mapped_column(JSON, nullable=False)
    source_document_ids: Mapped[List[str]] = mapped_column(JSON, nullable=False)
    record_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    measurement_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    validation_status: Mapped[str] = mapped_column(String(40), default="PASSED", nullable=False)
    processing_config: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    unit_conversions: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, nullable=False)
    file_hashes: Mapped[Dict[str, str]] = mapped_column(JSON, nullable=False)
    provenance_manifest: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    export_uris: Mapped[Optional[Dict[str, str]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    dataset: Mapped["Dataset"] = relationship("Dataset", back_populates="versions")
    items: Mapped[List["DatasetItem"]] = relationship(
        "DatasetItem", back_populates="dataset_version", cascade="all, delete-orphan", lazy="selectin"
    )
    validation_reports: Mapped[List["DatasetValidationReport"]] = relationship(
        "DatasetValidationReport", back_populates="dataset_version", cascade="all, delete-orphan", lazy="selectin"
    )


class DatasetItem(Base):
    __tablename__ = "dataset_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    dataset_version_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("dataset_versions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    investigation_id: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    investigation_acronym: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    experimental_run_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    run_name: Mapped[str] = mapped_column(String(160), nullable=False)
    parameter_name: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    original_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    original_unit: Mapped[str] = mapped_column(String(40), nullable=False)
    normalized_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    normalized_unit: Mapped[str] = mapped_column(String(40), nullable=False)
    conversion_formula: Mapped[str] = mapped_column(String(120), default="identity (1:1)", nullable=False)
    uncertainty: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    fuel_type: Mapped[str] = mapped_column(String(120), nullable=False)
    gravity_regime: Mapped[str] = mapped_column(String(80), nullable=False)
    oxygen_pct: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    pressure_kpa: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    airflow_cm_s: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    source_document_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    source_doi: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    section_name: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    extraction_method: Mapped[str] = mapped_column(String(80), default="canonical_psi_table", nullable=False)
    evidence_classification: Mapped[str] = mapped_column(
        String(50), default="VERIFIED_EXPERIMENTAL_DATA", nullable=False
    )
    validation_status: Mapped[str] = mapped_column(String(40), default="PASSED", nullable=False)
    validation_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    dataset_version: Mapped["DatasetVersion"] = relationship("DatasetVersion", back_populates="items")


class DatasetValidationReport(Base):
    __tablename__ = "dataset_validation_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    dataset_version_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("dataset_versions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    overall_status: Mapped[str] = mapped_column(String(40), nullable=False, default="PASSED")
    total_records: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    passed_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    warning_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    quarantined_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rejected_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    provenance_coverage_pct: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    null_handling_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    unit_checks_summary: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    quarantined_items: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, nullable=False)
    warnings: Mapped[List[str]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    dataset_version: Mapped["DatasetVersion"] = relationship(
        "DatasetVersion", back_populates="validation_reports"
    )


class DatasetApproval(Base):
    __tablename__ = "dataset_approvals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    request_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("research_requests.id", ondelete="CASCADE"), index=True, nullable=False
    )
    action_type: Mapped[str] = mapped_column(String(60), nullable=False, default="FILE_ACQUISITION_PLAN")
    selected_files: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, nullable=False)
    estimated_size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    decision: Mapped[str] = mapped_column(String(40), nullable=False, default="PENDING")
    decided_by: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    decided_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    request: Mapped["ResearchRequest"] = relationship("ResearchRequest", back_populates="approvals")
