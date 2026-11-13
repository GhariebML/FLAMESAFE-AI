export interface ResearchIntent {
  intent_type: string;
  research_domain: string;
  fuel_type: string;
  gravity_regime: string;
  target_investigations: string[];
  variables_of_interest: string[];
  research_objectives: string[];
  required_file_types: string[];
  required_outputs: string[];
  ambiguities_detected: string[];
  search_strategy: string;
}

export interface ExistingDataCoverage {
  classification: string;
  matched_investigations: string[];
  existing_datasets_matched: string[];
  documents_available_count: number;
  evidence_chunks_count: number;
  embeddings_ready: boolean;
  missing_investigations: string[];
  missing_variables: string[];
  reuse_recommendation: string;
}

export interface PSICatalogEntry {
  investigation_id: string;
  internal_catalog_id?: string;
  source_repository?: string;
  source_record_id?: string | null;
  psi_id: string;
  local_aliases?: string[];
  acronym: string;
  title: string;
  research_area: string;
  description: string;
  facility?: string | null;
  gravity_regime: string;
  fuel_types: string[];
  dataset_doi?: string | null;
  publication_dois?: string[];
  doi?: string | null;
  source_url: string;
  available_document_categories: string[];
  record_origin?: string;
  verification_status?: string;
  accessibility_status: string;
  relevance_score: number;
  last_verified_at: string;
}

export interface FileSelectionBreakdown {
  question_relevance_q: number;
  file_type_relevance_t: number;
  content_coverage_c: number;
  provenance_quality_p: number;
  accessibility_a: number;
  priority_score_f: number;
}

export interface PSIFileManifestItem {
  file_identifier: string;
  psi_investigation_id: string;
  investigation_acronym: string;
  file_name: string;
  file_category: string;
  file_type: string;
  mime_type: string;
  file_size_bytes?: number | null;
  source_url: string;
  doi?: string | null;
  content_coverage: string[];
  provenance_info: Record<string, any>;
  accessibility: string;
  acquisition_outcome?: string;
  governance_explanation?: string | null;
  requires_user_handoff: boolean;
  selected: boolean;
  score_breakdown?: FileSelectionBreakdown | null;
  selection_rationale: string;
}

export interface AgentRunItem {
  id: string;
  agent_id: string;
  agent_name: string;
  status: string;
  input_summary?: Record<string, any> | null;
  output_summary?: Record<string, any> | null;
  tools_invoked: string[];
  retry_count: number;
  error_category?: string | null;
  error_message?: string | null;
  started_at: string;
  completed_at?: string | null;
}

export interface WorkflowEventItem {
  id: string;
  request_id: string;
  thread_id: string;
  from_state?: string | null;
  to_state: string;
  agent_id?: string | null;
  event_type: string;
  message: string;
  payload?: Record<string, any> | null;
  created_at: string;
}

export interface ResearchRequestDetail {
  id: string;
  thread_id: string;
  user_question: string;
  status: string;
  require_approval: boolean;
  approval_status: string;
  research_intent?: ResearchIntent | null;
  existing_data_coverage?: ExistingDataCoverage | null;
  discovered_investigations: PSICatalogEntry[];
  candidate_files: PSIFileManifestItem[];
  selected_files: PSIFileManifestItem[];
  acquisition_summary?: Record<string, any> | null;
  validation_summary?: Record<string, any> | null;
  dataset_id?: string | null;
  dataset_version_id?: string | null;
  indexing_status: string;
  final_answer?: string | null;
  final_report?: Record<string, any> | null;
  error_log: Record<string, any>[];
  agent_runs: AgentRunItem[];
  workflow_events: WorkflowEventItem[];
  created_at: string;
  updated_at: string;
}

export interface DatasetItemRecord {
  id: string;
  investigation_id: string;
  investigation_acronym: string;
  experimental_run_id?: string | null;
  run_name: string;
  parameter_name: string;
  original_value?: number | null;
  original_unit: string;
  normalized_value?: number | null;
  normalized_unit: string;
  conversion_formula: string;
  uncertainty?: number | null;
  fuel_type: string;
  gravity_regime: string;
  oxygen_pct?: number | null;
  pressure_kpa?: number | null;
  airflow_cm_s?: number | null;
  source_document_id?: string | null;
  source_doi?: string | null;
  source_url?: string | null;
  page_number?: number | null;
  section_name?: string | null;
  extraction_method: string;
  evidence_classification: string;
  validation_status: string;
  validation_notes?: string | null;
}

export interface DatasetValidationReport {
  id: string;
  dataset_version_id: string;
  overall_status: string;
  total_records: number;
  passed_count: number;
  warning_count: number;
  quarantined_count: number;
  rejected_count: number;
  provenance_coverage_pct: number;
  null_handling_verified: boolean;
  unit_checks_summary: Record<string, any>;
  quarantined_items: Record<string, any>[];
  warnings: string[];
  created_at: string;
}

export interface DatasetVersion {
  id: string;
  dataset_id: string;
  version_number: number;
  version_tag: string;
  schema_version: string;
  content_fingerprint: string;
  source_investigation_ids: string[];
  original_file_ids: string[];
  source_document_ids: string[];
  record_count: number;
  measurement_count: number;
  validation_status: string;
  processing_config: Record<string, any>;
  unit_conversions: Record<string, any>[];
  file_hashes: Record<string, string>;
  provenance_manifest: Record<string, any>;
  export_uris?: Record<string, string> | null;
  created_at: string;
}

export interface DatasetSummary {
  id: string;
  dataset_key: string;
  name: string;
  research_objective: string;
  research_query: string;
  schema_version: string;
  latest_version_number: number;
  source_investigation_ids: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DatasetDetail extends DatasetSummary {
  latest_version?: DatasetVersion | null;
  items: DatasetItemRecord[];
  quality_report?: DatasetValidationReport | null;
}

export interface AIRuntimeStatus {
  provider: string;
  configured: boolean;
  connected: boolean;
  generation_model: string;
  embedding_model: string;
  embedding_dimensions: number;
  is_mock_provider: boolean;
  last_successful_request_at?: string | null;
  last_error?: string | null;
  error_category?: string | null;
  token_usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | null;
}
