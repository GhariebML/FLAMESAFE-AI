"""Add embedding provenance and content_hash to evidence_chunks

Revision ID: 002_add_embedding_metadata
Revises: 001_initial_schema
Create Date: 2026-11-13 16:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "002_add_embedding_metadata"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("evidence_chunks", sa.Column("content_hash", sa.String(64), nullable=True))
    op.add_column("evidence_chunks", sa.Column("embedding_provider", sa.String(32), nullable=True))
    op.add_column("evidence_chunks", sa.Column("embedding_model", sa.String(64), nullable=True))
    op.add_column("evidence_chunks", sa.Column("embedding_dimension", sa.Integer(), nullable=True))
    op.add_column("evidence_chunks", sa.Column("embedded_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_evidence_chunks_content_hash", "evidence_chunks", ["content_hash"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_evidence_chunks_content_hash", table_name="evidence_chunks")
    op.drop_column("evidence_chunks", "embedded_at")
    op.drop_column("evidence_chunks", "embedding_dimension")
    op.drop_column("evidence_chunks", "embedding_model")
    op.drop_column("evidence_chunks", "embedding_provider")
    op.drop_column("evidence_chunks", "content_hash")
