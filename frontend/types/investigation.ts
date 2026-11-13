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

export interface ResearchDocument {
  id: string;
  investigation_id: string;
  title: string;
  document_type: string;
  doi?: string | null;
  source_url?: string | null;
  file_path?: string | null;
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
  acronym?: string;
  page?: number;
  page_size?: number;
}
