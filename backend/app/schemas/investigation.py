from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class MeasurementSchema(BaseModel):
    id: str
    run_id: str
    metric_name: str
    metric_value: Optional[float] = None
    unit: str
    measurement_time: Optional[float] = None
    source_document_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ExperimentalRunSchema(BaseModel):
    id: str
    investigation_id: str
    run_code: str
    fuel_type: str
    fuel_name: str
    fuel_geometry: Optional[str] = None
    gravity_regime: str
    oxygen_concentration: Optional[float] = None
    pressure_value: Optional[float] = None
    pressure_unit: Optional[str] = "kPa"
    airflow_velocity: Optional[float] = None
    airflow_unit: Optional[str] = "cm/s"
    suppressant: Optional[str] = None
    sensor_types: Optional[List[str]] = None
    experimental_notes: Optional[str] = None
    measurements: List[MeasurementSchema] = []

    model_config = ConfigDict(from_attributes=True)


class EvidenceChunkSchema(BaseModel):
    id: str
    document_id: str
    chunk_text: str
    page_number: Optional[int] = None
    section_name: Optional[str] = None
    embedding_provider: Optional[str] = None
    embedding_model: Optional[str] = None
    embedding_dimension: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class ResearchDocumentSchema(BaseModel):
    id: str
    investigation_id: str
    title: str
    document_type: str
    doi: Optional[str] = None
    source_url: Optional[str] = None
    file_path: Optional[str] = None
    evidence_chunks: List[EvidenceChunkSchema] = []

    model_config = ConfigDict(from_attributes=True)


class DataSourceSchema(BaseModel):
    id: str
    investigation_id: str
    source_name: str
    source_url: str
    doi: Optional[str] = None
    version: Optional[str] = "1.0"
    accessed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class InvestigationSummarySchema(BaseModel):
    id: str
    psi_id: str
    acronym: str
    title: str
    research_area: str
    description: Optional[str] = None
    doi: Optional[str] = None
    source_url: Optional[str] = None
    experimental_runs_count: int = 0
    documents_count: int = 0
    primary_fuel_types: List[str] = []
    gravity_regimes: List[str] = []

    model_config = ConfigDict(from_attributes=True)


class InvestigationDetailSchema(BaseModel):
    id: str
    psi_id: str
    acronym: str
    title: str
    research_area: str
    objectives: Optional[str] = None
    description: Optional[str] = None
    doi: Optional[str] = None
    source_url: Optional[str] = None
    metadata_payload: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    experimental_runs: List[ExperimentalRunSchema] = []
    research_documents: List[ResearchDocumentSchema] = []
    data_sources: List[DataSourceSchema] = []

    model_config = ConfigDict(from_attributes=True)


class InvestigationFilterParams(BaseModel):
    query: Optional[str] = None
    research_area: Optional[str] = None
    fuel_type: Optional[str] = None
    gravity_regime: Optional[str] = None
    acronym: Optional[str] = None
    sort_by: Optional[str] = None


class EvidenceCatalogItemSchema(BaseModel):
    chunk_id: str
    document_id: str
    document_title: str
    document_type: str
    investigation_id: str
    investigation_acronym: str
    psi_id: str
    doi: Optional[str] = None
    source_url: Optional[str] = None
    page_number: Optional[int] = None
    section_name: Optional[str] = None
    chunk_text: str
    verification_status: str = "Verified Source"
    embedding_provider: Optional[str] = None
    embedding_model: Optional[str] = None


class SourceCatalogResponse(BaseModel):
    total_sources: int
    total_documents: int
    total_evidence_chunks: int
    sources: List[DataSourceSchema]
    evidence_items: List[EvidenceCatalogItemSchema]
