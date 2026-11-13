from typing import List, Optional, Dict, Any
from sqlalchemy import String, Float, Text, JSON, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, generate_uuid, utc_now


class ExperimentalRun(Base):
    __tablename__ = "experimental_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    investigation_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    run_code: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    fuel_type: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    fuel_name: Mapped[str] = mapped_column(String(128), nullable=False)
    fuel_geometry: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    gravity_regime: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    oxygen_concentration: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    pressure_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    pressure_unit: Mapped[Optional[str]] = mapped_column(String(16), nullable=True, default="kPa")
    airflow_velocity: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    airflow_unit: Mapped[Optional[str]] = mapped_column(String(16), nullable=True, default="cm/s")
    suppressant: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    sensor_types: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    experimental_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    investigation: Mapped["Investigation"] = relationship("Investigation", back_populates="experimental_runs")
    measurements: Mapped[List["Measurement"]] = relationship(
        "Measurement", back_populates="run", cascade="all, delete-orphan", lazy="selectin"
    )
