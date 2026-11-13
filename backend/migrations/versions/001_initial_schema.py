"""Initial schema for FlameSafe AI

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-11-13 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Attempt to enable pgvector extension if PostgreSQL
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # 1. investigations table
    op.create_table(
        "investigations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("psi_id", sa.String(64), nullable=False, unique=True, index=True),
        sa.Column("acronym", sa.String(32), nullable=False, index=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("research_area", sa.String(128), nullable=False, index=True),
        sa.Column("objectives", sa.Text(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("doi", sa.String(128), nullable=True),
        sa.Column("source_url", sa.String(512), nullable=True),
        sa.Column("metadata_payload", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # 2. experimental_runs table
    op.create_table(
        "experimental_runs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("investigation_id", sa.String(36), sa.ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("run_code", sa.String(64), nullable=False, index=True),
        sa.Column("fuel_type", sa.String(64), nullable=False, index=True),
        sa.Column("fuel_name", sa.String(128), nullable=False),
        sa.Column("fuel_geometry", sa.String(128), nullable=True),
        sa.Column("gravity_regime", sa.String(64), nullable=False, index=True),
        sa.Column("oxygen_concentration", sa.Float(), nullable=True),
        sa.Column("pressure_value", sa.Float(), nullable=True),
        sa.Column("pressure_unit", sa.String(16), nullable=True),
        sa.Column("airflow_velocity", sa.Float(), nullable=True),
        sa.Column("airflow_unit", sa.String(16), nullable=True),
        sa.Column("suppressant", sa.String(128), nullable=True),
        sa.Column("sensor_types", sa.JSON(), nullable=True),
        sa.Column("experimental_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 3. measurements table
    op.create_table(
        "measurements",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("experimental_runs.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("metric_name", sa.String(128), nullable=False, index=True),
        sa.Column("metric_value", sa.Float(), nullable=True),
        sa.Column("unit", sa.String(32), nullable=False),
        sa.Column("measurement_time", sa.Float(), nullable=True),
        sa.Column("source_document_id", sa.String(36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 4. research_documents table
    op.create_table(
        "research_documents",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("investigation_id", sa.String(36), sa.ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("document_type", sa.String(64), nullable=False),
        sa.Column("doi", sa.String(128), nullable=True),
        sa.Column("source_url", sa.String(512), nullable=True),
        sa.Column("file_path", sa.String(512), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 5. evidence_chunks table
    op.create_table(
        "evidence_chunks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("document_id", sa.String(36), sa.ForeignKey("research_documents.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("chunk_text", sa.Text(), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=True),
        sa.Column("section_name", sa.String(128), nullable=True),
        sa.Column("embedding", sa.JSON(), nullable=True),  # JSON or vector storage
        sa.Column("metadata_payload", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 6. data_sources table
    op.create_table(
        "data_sources",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("investigation_id", sa.String(36), sa.ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("source_name", sa.String(128), nullable=False),
        sa.Column("source_url", sa.String(512), nullable=False),
        sa.Column("doi", sa.String(128), nullable=True),
        sa.Column("version", sa.String(32), nullable=True),
        sa.Column("accessed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("data_sources")
    op.drop_table("evidence_chunks")
    op.drop_table("research_documents")
    op.drop_table("measurements")
    op.drop_table("experimental_runs")
    op.drop_table("investigations")
