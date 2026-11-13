export interface Measurement {
  id: string;
  run_id: string;
  metric_name: string;
  metric_value: number | null;
  unit: string;
  measurement_time: number | null;
  source_document_id?: string | null;
}

export interface ExperimentalRun {
  id: string;
  investigation_id: string;
  run_code: string;
  fuel_type: string;
  fuel_name: string;
  fuel_geometry?: string | null;
  gravity_regime: string;
  oxygen_concentration: number | null;
  pressure_value: number | null;
  pressure_unit?: string | null;
  airflow_velocity: number | null;
  airflow_unit?: string | null;
  suppressant?: string | null;
  sensor_types?: string[] | null;
  experimental_notes?: string | null;
  measurements: Measurement[];
}

export interface EvidenceChunk {
  id: string;
  document_id: string;
  chunk_text: string;
  page_number?: number | null;
  section_name?: string | null;
  embedding_provider?: string | null;
  embedding_model?: string | null;
  embedding_dimension?: number | null;
}

export interface ResearchDocument {
  id: string;
  investigation_id: string;
  title: string;
  document_type: string;
  doi?: string | null;
  source_url?: string | null;
  file_path?: string | null;
  evidence_chunks?: EvidenceChunk[];
}

export interface DataSource {
  id: string;
  investigation_id: string;
  source_name: string;
  source_url: string;
  doi?: string | null;
  version?: string | null;
  accessed_at?: string | null;
}

export interface InvestigationSummary {
  id: string;
  psi_id: string;
  acronym: string;
  title: string;
  research_area: string;
  description?: string | null;
  doi?: string | null;
  source_url?: string | null;
  experimental_runs_count: number;
  documents_count: number;
  primary_fuel_types?: string[];
  gravity_regimes?: string[];
}

export interface InvestigationDetail {
  id: string;
  psi_id: string;
  acronym: string;
  title: string;
  research_area: string;
  objectives?: string | null;
  description?: string | null;
  doi?: string | null;
  source_url?: string | null;
  metadata_payload?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  experimental_runs: ExperimentalRun[];
  research_documents: ResearchDocument[];
  data_sources: DataSource[];
}

export interface InvestigationFilterParams {
  query?: string;
  research_area?: string;
  fuel_type?: string;
  gravity_regime?: string;
  acronym?: string;
  sort_by?: string;
  page?: number;
  page_size?: number;
}

export interface EvidenceCatalogItem {
  chunk_id: string;
  document_id: string;
  document_title: string;
  document_type: string;
  investigation_id: string;
  investigation_acronym: string;
  psi_id: string;
  doi?: string | null;
  source_url?: string | null;
  page_number?: number | null;
  section_name?: string | null;
  chunk_text: string;
  verification_status: string;
  embedding_provider?: string | null;
  embedding_model?: string | null;
}

export interface SourceCatalogResponse {
  total_sources: number;
  total_documents: number;
  total_evidence_chunks: number;
  sources: DataSource[];
  evidence_items: EvidenceCatalogItem[];
}
