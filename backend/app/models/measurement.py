from typing import Optional
from sqlalchemy import String, Float, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, generate_uuid, utc_now


class Measurement(Base):
    __tablename__ = "measurements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    run_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("experimental_runs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    metric_name: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    metric_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    unit: Mapped[str] = mapped_column(String(32), nullable=False)
    measurement_time: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # elapsed seconds
    source_document_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    run: Mapped["ExperimentalRun"] = relationship("ExperimentalRun", back_populates="measurements")
