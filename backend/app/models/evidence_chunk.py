from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.config import settings
from app.models.base import Base, generate_uuid, utc_now

if TYPE_CHECKING:
    from app.models.research_document import ResearchDocument

logger = logging.getLogger(__name__)

# Fixed database schema dimension for pgvector storage
EMBEDDING_SCHEMA_DIMENSION: int = 768

if settings.EMBEDDING_DIMENSION != EMBEDDING_SCHEMA_DIMENSION:
    logger.warning(
        f"Configured EMBEDDING_DIMENSION ({settings.EMBEDDING_DIMENSION}) differs from "
        f"database schema dimension ({EMBEDDING_SCHEMA_DIMENSION})."
    )


class EvidenceChunk(Base):
    __tablename__ = "evidence_chunks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    document_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("research_documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    section_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    content_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    embedding: Mapped[list[float] | None] = mapped_column(
        Vector(EMBEDDING_SCHEMA_DIMENSION).with_variant(JSON, "sqlite"),
        nullable=True,
    )
    embedding_provider: Mapped[str | None] = mapped_column(String(32), nullable=True)
    embedding_model: Mapped[str | None] = mapped_column(String(64), nullable=True)
    embedding_dimension: Mapped[int | None] = mapped_column(Integer, nullable=True)
    embedded_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_payload: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    document: Mapped[ResearchDocument] = relationship("ResearchDocument", back_populates="evidence_chunks")
