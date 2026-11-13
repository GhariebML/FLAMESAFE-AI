from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Integer, ForeignKey, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, generate_uuid, utc_now


class EvidenceChunk(Base):
    __tablename__ = "evidence_chunks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    document_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("research_documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    section_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    embedding: Mapped[Optional[List[float]]] = mapped_column(JSON, nullable=True)
    metadata_payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    document: Mapped["ResearchDocument"] = relationship("ResearchDocument", back_populates="evidence_chunks")
