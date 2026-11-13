import { APIResponseEnvelope, PaginatedResponse } from "@/types/api";
import {
  InvestigationSummary,
  InvestigationDetail,
  InvestigationFilterParams,
  DataSource,
  SourceCatalogResponse,
} from "@/types/investigation";
import { ComparisonRequest, ComparisonResponse } from "@/types/comparison";
import { ScenarioRequest, ScenarioAnalysisResponse } from "@/types/scenario";
import { AssistantQueryRequest, AssistantQueryResponse } from "@/types/assistant";
import { API_ENDPOINTS } from "./endpoints";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class APIError extends Error {
  code: string;
  status: number;
  details?: Record<string, any>;

  constructor(message: string, code = "API_ERROR", status = 500, details?: Record<string, any>) {
    super(message);
    this.name = "APIError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const payload = await res.json();

    if (!res.ok || payload.success === false) {
      const err = payload.error || {};
      throw new APIError(
        err.message || `Request failed with status ${res.status}`,
        err.code || "REQUEST_FAILED",
        res.status,
        err.details
      );
    }

    return (payload as APIResponseEnvelope<T>).data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      (error as Error).message || "Network connectivity failure",
      "NETWORK_ERROR",
      0
    );
  }
}

export const apiClient = {
  async getHealth(): Promise<{
    status: string;
    database_status: string;
    ai_provider?: string;
    embedding_provider?: string;
    version?: string;
  }> {
    return request(API_ENDPOINTS.HEALTH);
  },

  async getOverview(): Promise<any> {
    return request(API_ENDPOINTS.OVERVIEW);
  },

  async getInvestigations(
    filters: InvestigationFilterParams = {}
  ): Promise<PaginatedResponse<InvestigationSummary>> {
    const params = new URLSearchParams();
    if (filters.query) params.append("query", filters.query);
    if (filters.research_area) params.append("research_area", filters.research_area);
    if (filters.fuel_type) params.append("fuel_type", filters.fuel_type);
    if (filters.gravity_regime) params.append("gravity_regime", filters.gravity_regime);
    if (filters.acronym) params.append("acronym", filters.acronym);
    if (filters.sort_by) params.append("sort_by", filters.sort_by);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.page_size) params.append("page_size", filters.page_size.toString());

    const qs = params.toString();
    const endpoint = `${API_ENDPOINTS.INVESTIGATIONS}${qs ? `?${qs}` : ""}`;
    return request<PaginatedResponse<InvestigationSummary>>(endpoint);
  },

  async getInvestigationDetail(id: string): Promise<InvestigationDetail> {
    return request<InvestigationDetail>(API_ENDPOINTS.INVESTIGATION_DETAIL(id));
  },

  async compareInvestigations(payload: ComparisonRequest): Promise<ComparisonResponse> {
    return request<ComparisonResponse>(API_ENDPOINTS.COMPARE, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async rankInvestigations(payload: {
    query: string;
    target_environment?: string;
    fuel_category?: string;
  }): Promise<any> {
    return request(API_ENDPOINTS.RANK, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async analyzeScenario(payload: ScenarioRequest): Promise<ScenarioAnalysisResponse> {
    return request<ScenarioAnalysisResponse>(API_ENDPOINTS.SCENARIOS_ANALYZE, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async queryAssistant(payload: AssistantQueryRequest): Promise<AssistantQueryResponse> {
    return request<AssistantQueryResponse>(API_ENDPOINTS.ASSISTANT_QUERY, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getSourcesCatalog(
    params: { investigation?: string; query?: string } = {}
  ): Promise<SourceCatalogResponse> {
    const search = new URLSearchParams();
    if (params.investigation) search.append("investigation", params.investigation);
    if (params.query) search.append("query", params.query);
    const qs = search.toString();
    return request<SourceCatalogResponse>(`${API_ENDPOINTS.SOURCES}${qs ? `?${qs}` : ""}`);
  },

  async getSourceDetail(id: string): Promise<DataSource> {
    return request<DataSource>(API_ENDPOINTS.SOURCE_DETAIL(id));
  },
};
