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
import {
  ResearchRequestDetail,
  WorkflowEventItem,
  PSICatalogEntry,
  PSIFileManifestItem,
  DatasetSummary,
  DatasetDetail,
  DatasetVersion,
  DatasetValidationReport,
  AIRuntimeStatus,
} from "@/types/research";
import { API_ENDPOINTS } from "./endpoints";

const DEFAULT_RENDER_API_URL = "https://flamesafe-backend.onrender.com/api/v1";

function isNonLocalBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  );
}

function normalizeBaseUrl(raw?: string): string {
  const trimmed = (raw || "").trim().replace(/\/+$/, "");
  if (!trimmed) {
    if (isNonLocalBrowser() || process.env.NODE_ENV === "production") {
      return DEFAULT_RENDER_API_URL;
    }
    return "http://localhost:8001/api/v1";
  }
  if (isNonLocalBrowser() && (trimmed.includes("localhost") || trimmed.includes("127.0.0.1"))) {
    return DEFAULT_RENDER_API_URL;
  }
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}

function getCandidateBaseUrls(): string[] {
  const primary = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);
  const candidates: string[] = [primary];

  if (primary.includes(":8001")) {
    candidates.push(primary.replace(":8001", ":8000"));
  } else if (primary.includes(":8000")) {
    candidates.push(primary.replace(":8000", ":8001"));
  }

  if (typeof window !== "undefined" && !candidates.includes("/api/v1")) {
    candidates.push("/api/v1");
  }
  return candidates;
}

const PRIMARY_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);

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

const CACHE_TTL_MS = 60_000;
const FAST_GET_TIMEOUT_MS = 4_500;
const LONG_REQUEST_TIMEOUT_MS = 45_000;
const responseCache = new Map<string, { ts: number; data: unknown }>();
let warmupTriggered = false;

function triggerBackgroundWarmup() {
  if (warmupTriggered || typeof window === "undefined") return;
  warmupTriggered = true;
  fetch(`${DEFAULT_RENDER_API_URL}/health`, { mode: "cors" }).catch(() => {});
}

function isFastCacheableGet(endpoint: string, options: RequestInit): boolean {
  const method = (options.method || "GET").toUpperCase();
  if (method !== "GET") return false;
  return (
    endpoint === "/overview" ||
    endpoint === "/investigations" ||
    endpoint.startsWith("/investigations?") ||
    endpoint === "/sources" ||
    endpoint === "/ai/status"
  );
}

async function fetchFromBase<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const method = (options.method || "GET").toUpperCase();
  const isRemote = baseUrl.startsWith("http");
  const timeoutMs =
    method === "GET" && isRemote && !endpoint.includes("verify=true")
      ? FAST_GET_TIMEOUT_MS
      : LONG_REQUEST_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    const payload = await res.json().catch(() => ({}));

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
  } catch (err) {
    if (isRemote && (err as Error)?.name === "AbortError") {
      triggerBackgroundWarmup();
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cacheable = isFastCacheableGet(endpoint, options);
  if (cacheable) {
    const cached = responseCache.get(endpoint);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return cached.data as T;
    }
  }

  const candidates = getCandidateBaseUrls();
  let lastError: unknown = null;

  for (const baseUrl of candidates) {
    try {
      const data = await fetchFromBase<T>(baseUrl, endpoint, options);
      if (cacheable) {
        responseCache.set(endpoint, { ts: Date.now(), data });
      }
      return data;
    } catch (err) {
      lastError = err;
      if (err instanceof APIError && err.status !== 404 && err.status !== 0 && err.status < 500) {
        throw err;
      }
    }
  }

  if (lastError instanceof APIError) {
    throw lastError;
  }
  throw new APIError(
    (lastError as Error)?.message || "Network connectivity failure",
    "NETWORK_ERROR",
    0
  );
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

  async getAIStatus(verify: boolean = false): Promise<AIRuntimeStatus> {
    const qs = verify ? "?verify=true" : "";
    return request<AIRuntimeStatus>(`${API_ENDPOINTS.AI_STATUS}${qs}`);
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

  // Multi-Agent Research Intelligence Endpoints
  async createResearchRequest(payload: {
    question: string;
    require_approval?: boolean;
    force_psi_discovery?: boolean;
  }): Promise<ResearchRequestDetail> {
    return request<ResearchRequestDetail>(API_ENDPOINTS.RESEARCH_REQUESTS, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async listResearchRequests(): Promise<ResearchRequestDetail[]> {
    return request<ResearchRequestDetail[]>(API_ENDPOINTS.RESEARCH_REQUESTS);
  },

  async getResearchRequest(id: string): Promise<ResearchRequestDetail> {
    return request<ResearchRequestDetail>(API_ENDPOINTS.RESEARCH_REQUEST_DETAIL(id));
  },

  async getResearchRequestEvents(id: string): Promise<WorkflowEventItem[]> {
    return request<WorkflowEventItem[]>(API_ENDPOINTS.RESEARCH_REQUEST_EVENTS(id));
  },

  async approveResearchRequest(
    id: string,
    payload: {
      decision: "APPROVE" | "REJECT" | "MODIFY_PLAN" | "RESUME_WORKFLOW";
      selected_file_identifiers?: string[];
      decided_by?: string;
      reason?: string;
    }
  ): Promise<ResearchRequestDetail> {
    return request<ResearchRequestDetail>(API_ENDPOINTS.RESEARCH_REQUEST_APPROVE(id), {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async reviseResearchIntent(
    id: string,
    payload: {
      updated_question?: string;
      fuel_type?: string;
      gravity_regime?: string;
      variables_of_interest?: string[];
      require_approval?: boolean;
    }
  ): Promise<ResearchRequestDetail> {
    return request<ResearchRequestDetail>(API_ENDPOINTS.RESEARCH_REQUEST_REVISE(id), {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async searchPSIInvestigations(
    params: { query?: string; fuel_type?: string; research_domain?: string } = {}
  ): Promise<PSICatalogEntry[]> {
    const search = new URLSearchParams();
    if (params.query) search.append("query", params.query);
    if (params.fuel_type) search.append("fuel_type", params.fuel_type);
    if (params.research_domain) search.append("research_domain", params.research_domain);
    const qs = search.toString();
    return request<PSICatalogEntry[]>(`${API_ENDPOINTS.PSI_SEARCH}${qs ? `?${qs}` : ""}`);
  },

  async getPSIInvestigationFiles(
    investigationId: string,
    question?: string
  ): Promise<PSIFileManifestItem[]> {
    const qs = question ? `?question=${encodeURIComponent(question)}` : "";
    return request<PSIFileManifestItem[]>(
      `${API_ENDPOINTS.PSI_INVESTIGATION_FILES(investigationId)}${qs}`
    );
  },

  async listDatasets(): Promise<DatasetSummary[]> {
    return request<DatasetSummary[]>(API_ENDPOINTS.DATASETS);
  },

  async getDatasetDetail(id: string): Promise<DatasetDetail> {
    return request<DatasetDetail>(API_ENDPOINTS.DATASET_DETAIL(id));
  },

  async getDatasetVersions(id: string): Promise<DatasetVersion[]> {
    return request<DatasetVersion[]>(API_ENDPOINTS.DATASET_VERSIONS(id));
  },

  async getDatasetQualityReport(id: string): Promise<DatasetValidationReport> {
    return request<DatasetValidationReport>(API_ENDPOINTS.DATASET_QUALITY_REPORT(id));
  },

  async analyzeDataset(id: string): Promise<Record<string, any>> {
    return request<Record<string, any>>(API_ENDPOINTS.DATASET_ANALYZE(id), {
      method: "POST",
    });
  },

  async getDatasetCoverage(id: string): Promise<Record<string, any>> {
    return request<Record<string, any>>(API_ENDPOINTS.DATASET_COVERAGE(id));
  },

  async getDatasetLineage(id: string): Promise<Record<string, any>> {
    return request<Record<string, any>>(API_ENDPOINTS.DATASET_LINEAGE(id));
  },

  async getDatasetDiff(id: string): Promise<Record<string, any>> {
    return request<Record<string, any>>(API_ENDPOINTS.DATASET_DIFF(id));
  },

  async runDatasetAnalytics(
    id: string,
    payload?: {
      filter_investigation?: string;
      filter_parameter?: string;
      filter_material?: string;
      group_by_column?: string;
      compare_parameter?: string;
    },
  ): Promise<Record<string, any>> {
    return request<Record<string, any>>(API_ENDPOINTS.DATASET_ANALYTICS(id), {
      method: "POST",
      body: JSON.stringify(payload ?? {}),
    });
  },

  getDatasetExportUrl(id: string, format: "json" | "csv" | "parquet"): string {
    return `${PRIMARY_BASE_URL}${API_ENDPOINTS.DATASET_EXPORT(id, format)}`;
  },
};
