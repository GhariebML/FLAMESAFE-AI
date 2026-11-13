export interface ComparisonRequest {
  investigation_ids: string[];
  target_parameters?: string[];
}

export interface ParameterComparisonItem {
  parameter_name: string;
  display_name: string;
  unit?: string | null;
  values_by_investigation: Record<string, any>;
  is_compatible_for_direct_diff: boolean;
  notes?: string | null;
}

export interface InvestigationComparisonProfile {
  id: string;
  psi_id: string;
  acronym: string;
  title: string;
  research_area: string;
  gravity_regime: string;
  primary_fuel_types: string[];
  typical_oxygen_range?: string | null;
  typical_pressure_range?: string | null;
  typical_airflow_range?: string | null;
  measurement_capabilities: string[];
  identified_limitations: string[];
  doi?: string | null;
  numeric_metrics?: Record<string, number | null>;
}

export interface ComparisonResponse {
  investigations: InvestigationComparisonProfile[];
  parameter_matrix: ParameterComparisonItem[];
  scientific_summary: string;
  comparison_limitations: string[];
}
