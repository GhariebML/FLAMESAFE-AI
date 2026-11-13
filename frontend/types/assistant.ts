export interface CitationItem {
  citation_id: string;
  investigation_acronym: string;
  psi_id: string;
  document_title: string;
  doi?: string | null;
  source_url?: string | null;
  page_number?: number | null;
  section_name?: string | null;
  excerpt: string;
  verification_status: "Verified Source" | "Secondary Reference" | "Unverified";
}

export interface AssistantQueryRequest {
  query: string;
  investigation_id_filter?: string;
  max_citations?: number;
}

export interface AssistantQueryResponse {
  query: string;
  answer: string;
  citations: CitationItem[];
  scientific_uncertainty_note?: string | null;
  has_sufficient_evidence: boolean;
  ai_provider: string;
  model_name: string;
  is_mock_provider?: boolean;
  prompt_version?: string;
}
