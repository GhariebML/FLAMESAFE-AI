"""Ensure 768-dimensional Gemini embedding metadata and composite index on evidence_chunks

Revision ID: 004_update_embedding_dimension_768
Revises: 003_multi_agent_dataset_engine
Create Date: 2026-11-13 22:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "004_update_embedding_dimension_768"
down_revision: Union[str, None] = "003_multi_agent_dataset_engine"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # Add composite index for fast filtering of chunks needing Gemini re-embedding/backfill
    op.create_index(
        "ix_evidence_chunks_embedding_provenance",
        "evidence_chunks",
        ["embedding_provider", "embedding_model", "embedding_dimension"],
        unique=False,
    )

    # Normalize any legacy rows missing embedding_dimension where mock vectors were stored
    op.execute(
        sa.text(
            "UPDATE evidence_chunks "
            "SET embedding_provider = COALESCE(embedding_provider, 'mock'), "
            "    embedding_dimension = COALESCE(embedding_dimension, 768) "
            "WHERE embedding IS NOT NULL AND (embedding_provider IS NULL OR embedding_dimension IS NULL)"
        )
    )


def downgrade() -> None:
    op.drop_index("ix_evidence_chunks_embedding_provenance", table_name="evidence_chunks")
