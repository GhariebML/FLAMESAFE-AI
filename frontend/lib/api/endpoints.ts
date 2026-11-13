export const API_ENDPOINTS = {
  HEALTH: "/health",
  OVERVIEW: "/overview",
  INVESTIGATIONS: "/investigations",
  INVESTIGATION_DETAIL: (id: string) => `/investigations/${id}`,
  COMPARE: "/compare",
  RANK: "/rank",
  SCENARIOS_ANALYZE: "/scenarios/analyze",
  ASSISTANT_QUERY: "/assistant/query",
  SOURCE_DETAIL: (id: string) => `/sources/${id}`,
} as const;
