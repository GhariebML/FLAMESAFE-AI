from typing import List, Optional
from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, generate_uuid, utc_now


class ResearchDocument(Base):
    __tablename__ = "research_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    investigation_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    document_type: Mapped[str] = mapped_column(String(64), nullable=False)
    doi: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    file_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    investigation: Mapped["Investigation"] = relationship("Investigation", back_populates="research_documents")
    evidence_chunks: Mapped[List["EvidenceChunk"]] = relationship(
        "EvidenceChunk", back_populates="document", cascade="all, delete-orphan", lazy="selectin"
    )
