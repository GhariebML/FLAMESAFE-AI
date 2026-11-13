export interface ScenarioRequest {
  environment: string;
  fuel_type?: string;
  oxygen_concentration?: number;
  pressure_value?: number;
  pressure_unit?: string;
  airflow_velocity?: number;
  airflow_unit?: string;
  fire_safety_focus?: string;
}

export interface ConditionMatchReport {
  parameter: string;
  scenario_input: string;
  experimental_data_status: "Direct Match" | "Analogous Range" | "Extrapolated" | "No Data";
  notes?: string | null;
}

export interface EvidenceSnippet {
  investigation_acronym: string;
  document_title: string;
  doi?: string | null;
  page_number?: number | null;
  excerpt: string;
  relevance_rationale: string;
}

export interface ScenarioAnalysisResponse {
  scenario_summary: string;
  target_environment: string;
  gravity_context: string;
  relevant_investigations: string[];
  condition_matches: ConditionMatchReport[];
  supporting_evidence: EvidenceSnippet[];
  research_gaps: string[];
  scientific_limitations: string[];
  safety_advisory: string;
}
