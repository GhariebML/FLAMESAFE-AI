"""Add Multi-Agent System and Dynamic Dataset Engine tables

Revision ID: 003_multi_agent_dataset_engine
Revises: 002_add_embedding_metadata
Create Date: 2026-11-13
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "003_multi_agent_dataset_engine"
down_revision: Union[str, None] = "002_add_embedding_metadata"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "research_requests",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("thread_id", sa.String(64), nullable=False, index=True),
        sa.Column("user_question", sa.Text(), nullable=False),
        sa.Column("status", sa.String(40), nullable=False, index=True),
        sa.Column("require_approval", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("approval_status", sa.String(40), nullable=False, server_default="NOT_REQUIRED"),
        sa.Column("research_intent", sa.JSON(), nullable=True),
        sa.Column("existing_data_coverage", sa.JSON(), nullable=True),
        sa.Column("discovered_investigations", sa.JSON(), nullable=True),
        sa.Column("candidate_files", sa.JSON(), nullable=True),
        sa.Column("selected_files", sa.JSON(), nullable=True),
        sa.Column("acquisition_summary", sa.JSON(), nullable=True),
        sa.Column("validation_summary", sa.JSON(), nullable=True),
        sa.Column("dataset_id", sa.String(36), nullable=True, index=True),
        sa.Column("dataset_version_id", sa.String(36), nullable=True),
        sa.Column("indexing_status", sa.String(40), nullable=False, server_default="PENDING"),
        sa.Column("final_answer", sa.Text(), nullable=True),
        sa.Column("final_report", sa.JSON(), nullable=True),
        sa.Column("error_log", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "agent_runs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("request_id", sa.String(36), sa.ForeignKey("research_requests.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("thread_id", sa.String(64), nullable=False, index=True),
        sa.Column("agent_id", sa.String(32), nullable=False, index=True),
        sa.Column("agent_name", sa.String(120), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("input_summary", sa.JSON(), nullable=True),
        sa.Column("output_summary", sa.JSON(), nullable=True),
        sa.Column("tools_invoked", sa.JSON(), nullable=True),
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("error_category", sa.String(64), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "agent_checkpoints",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("request_id", sa.String(36), sa.ForeignKey("research_requests.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("thread_id", sa.String(64), nullable=False, index=True),
        sa.Column("step_name", sa.String(80), nullable=False),
        sa.Column("workflow_state", sa.JSON(), nullable=False),
        sa.Column("checkpoint_version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "workflow_events",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("request_id", sa.String(36), sa.ForeignKey("research_requests.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("thread_id", sa.String(64), nullable=False, index=True),
        sa.Column("from_state", sa.String(40), nullable=True),
        sa.Column("to_state", sa.String(40), nullable=False),
        sa.Column("agent_id", sa.String(32), nullable=True),
        sa.Column("event_type", sa.String(50), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "psi_investigation_catalog",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("psi_id", sa.String(50), unique=True, nullable=False, index=True),
        sa.Column("acronym", sa.String(50), nullable=False, index=True),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("research_area", sa.String(160), nullable=False, index=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("facility", sa.String(160), nullable=True),
        sa.Column("gravity_regime", sa.String(80), nullable=False),
        sa.Column("fuel_types", sa.JSON(), nullable=True),
        sa.Column("doi", sa.String(120), nullable=True),
        sa.Column("source_url", sa.String(500), nullable=False),
        sa.Column("available_categories", sa.JSON(), nullable=True),
        sa.Column("accessibility_status", sa.String(50), nullable=False),
        sa.Column("last_verified_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "psi_file_catalog",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("file_identifier", sa.String(80), unique=True, nullable=False, index=True),
        sa.Column("psi_investigation_id", sa.String(50), nullable=False, index=True),
        sa.Column("investigation_acronym", sa.String(50), nullable=False, index=True),
        sa.Column("file_name", sa.String(255), nullable=False),
        sa.Column("file_category", sa.String(60), nullable=False, index=True),
        sa.Column("file_type", sa.String(24), nullable=False),
        sa.Column("mime_type", sa.String(80), nullable=False),
        sa.Column("file_size_bytes", sa.Integer(), nullable=True),
        sa.Column("source_url", sa.String(500), nullable=False),
        sa.Column("doi", sa.String(120), nullable=True),
        sa.Column("content_coverage", sa.JSON(), nullable=True),
        sa.Column("provenance_info", sa.JSON(), nullable=True),
        sa.Column("accessibility", sa.String(40), nullable=False),
        sa.Column("requires_user_handoff", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("last_verified_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "acquisition_jobs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("request_id", sa.String(36), nullable=True, index=True),
        sa.Column("file_identifier", sa.String(80), nullable=False, index=True),
        sa.Column("investigation_acronym", sa.String(50), nullable=False),
        sa.Column("source_url", sa.String(500), nullable=False),
        sa.Column("status", sa.String(40), nullable=False, index=True),
        sa.Column("http_status", sa.Integer(), nullable=True),
        sa.Column("content_type", sa.String(80), nullable=True),
        sa.Column("bytes_downloaded", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("sha256_hash", sa.String(64), nullable=True, index=True),
        sa.Column("storage_uri", sa.String(500), nullable=True),
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("handoff_instructions", sa.Text(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "file_assets",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("file_identifier", sa.String(80), nullable=False, index=True),
        sa.Column("investigation_acronym", sa.String(50), nullable=False, index=True),
        sa.Column("file_name", sa.String(255), nullable=False),
        sa.Column("storage_backend", sa.String(40), nullable=False),
        sa.Column("storage_uri", sa.String(500), nullable=False),
        sa.Column("sha256_hash", sa.String(64), unique=True, nullable=False, index=True),
        sa.Column("file_size_bytes", sa.Integer(), nullable=False),
        sa.Column("mime_type", sa.String(80), nullable=False),
        sa.Column("source_url", sa.String(500), nullable=False),
        sa.Column("file_version", sa.String(32), nullable=False),
        sa.Column("metadata_payload", sa.JSON(), nullable=True),
        sa.Column("downloaded_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "dataset_jobs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("request_id", sa.String(36), nullable=True, index=True),
        sa.Column("dataset_id", sa.String(36), nullable=True, index=True),
        sa.Column("dataset_version_id", sa.String(36), nullable=True),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("records_extracted", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("records_validated", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("records_quarantined", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("warnings_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "datasets",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("dataset_key", sa.String(120), unique=True, nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("research_objective", sa.Text(), nullable=False),
        sa.Column("research_query", sa.Text(), nullable=False),
        sa.Column("schema_version", sa.String(32), nullable=False),
        sa.Column("latest_version_number", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("source_investigation_ids", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "dataset_versions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("dataset_id", sa.String(36), sa.ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("version_tag", sa.String(32), nullable=False),
        sa.Column("schema_version", sa.String(32), nullable=False),
        sa.Column("content_fingerprint", sa.String(64), nullable=False, index=True),
        sa.Column("source_investigation_ids", sa.JSON(), nullable=False),
        sa.Column("original_file_ids", sa.JSON(), nullable=False),
        sa.Column("source_document_ids", sa.JSON(), nullable=False),
        sa.Column("record_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("measurement_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("validation_status", sa.String(40), nullable=False),
        sa.Column("processing_config", sa.JSON(), nullable=False),
        sa.Column("unit_conversions", sa.JSON(), nullable=False),
        sa.Column("file_hashes", sa.JSON(), nullable=False),
        sa.Column("provenance_manifest", sa.JSON(), nullable=False),
        sa.Column("export_uris", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "dataset_items",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("dataset_version_id", sa.String(36), sa.ForeignKey("dataset_versions.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("investigation_id", sa.String(36), nullable=False, index=True),
        sa.Column("investigation_acronym", sa.String(50), nullable=False, index=True),
        sa.Column("experimental_run_id", sa.String(36), nullable=True),
        sa.Column("run_name", sa.String(160), nullable=False),
        sa.Column("parameter_name", sa.String(120), nullable=False, index=True),
        sa.Column("original_value", sa.Float(), nullable=True),
        sa.Column("original_unit", sa.String(40), nullable=False),
        sa.Column("normalized_value", sa.Float(), nullable=True),
        sa.Column("normalized_unit", sa.String(40), nullable=False),
        sa.Column("conversion_formula", sa.String(120), nullable=False),
        sa.Column("uncertainty", sa.Float(), nullable=True),
        sa.Column("fuel_type", sa.String(120), nullable=False),
        sa.Column("gravity_regime", sa.String(80), nullable=False),
        sa.Column("oxygen_pct", sa.Float(), nullable=True),
        sa.Column("pressure_kpa", sa.Float(), nullable=True),
        sa.Column("airflow_cm_s", sa.Float(), nullable=True),
        sa.Column("source_document_id", sa.String(36), nullable=True),
        sa.Column("source_doi", sa.String(120), nullable=True),
        sa.Column("source_url", sa.String(500), nullable=True),
        sa.Column("page_number", sa.Integer(), nullable=True),
        sa.Column("section_name", sa.String(160), nullable=True),
        sa.Column("extraction_method", sa.String(80), nullable=False),
        sa.Column("evidence_classification", sa.String(50), nullable=False),
        sa.Column("validation_status", sa.String(40), nullable=False),
        sa.Column("validation_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "dataset_validation_reports",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("dataset_version_id", sa.String(36), sa.ForeignKey("dataset_versions.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("overall_status", sa.String(40), nullable=False),
        sa.Column("total_records", sa.Integer(), nullable=False),
        sa.Column("passed_count", sa.Integer(), nullable=False),
        sa.Column("warning_count", sa.Integer(), nullable=False),
        sa.Column("quarantined_count", sa.Integer(), nullable=False),
        sa.Column("rejected_count", sa.Integer(), nullable=False),
        sa.Column("provenance_coverage_pct", sa.Float(), nullable=False),
        sa.Column("null_handling_verified", sa.Boolean(), nullable=False),
        sa.Column("unit_checks_summary", sa.JSON(), nullable=False),
        sa.Column("quarantined_items", sa.JSON(), nullable=False),
        sa.Column("warnings", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "dataset_approvals",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("request_id", sa.String(36), sa.ForeignKey("research_requests.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("action_type", sa.String(60), nullable=False),
        sa.Column("selected_files", sa.JSON(), nullable=False),
        sa.Column("estimated_size_bytes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("decision", sa.String(40), nullable=False),
        sa.Column("decided_by", sa.String(120), nullable=True),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("decided_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("dataset_approvals")
    op.drop_table("dataset_validation_reports")
    op.drop_table("dataset_items")
    op.drop_table("dataset_versions")
    op.drop_table("datasets")
    op.drop_table("dataset_jobs")
    op.drop_table("file_assets")
    op.drop_table("acquisition_jobs")
    op.drop_table("psi_file_catalog")
    op.drop_table("psi_investigation_catalog")
    op.drop_table("workflow_events")
    op.drop_table("agent_checkpoints")
    op.drop_table("agent_runs")
    op.drop_table("research_requests")
