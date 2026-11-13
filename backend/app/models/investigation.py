from typing import List, Optional, Dict, Any
from sqlalchemy import String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, generate_uuid


class Investigation(Base, TimestampMixin):
    __tablename__ = "investigations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    psi_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    acronym: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    research_area: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    objectives: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    doi: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    metadata_payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # Relationships
    experimental_runs: Mapped[List["ExperimentalRun"]] = relationship(
        "ExperimentalRun", back_populates="investigation", cascade="all, delete-orphan", lazy="selectin"
    )
    research_documents: Mapped[List["ResearchDocument"]] = relationship(
        "ResearchDocument", back_populates="investigation", cascade="all, delete-orphan", lazy="selectin"
    )
    data_sources: Mapped[List["DataSource"]] = relationship(
        "DataSource", back_populates="investigation", cascade="all, delete-orphan", lazy="selectin"
    )
