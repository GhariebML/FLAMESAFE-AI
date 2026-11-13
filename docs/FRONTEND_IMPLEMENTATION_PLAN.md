# FlameSafe AI — Frontend Implementation Plan (Developer A)

**Owner:** Developer A (Frontend & Product Engineering)  
**Scope:** Everything under `frontend/` (`app/`, `components/`, `hooks/`, `lib/`, `styles/`, `types/`, `tests/`).

---

## Completed Foundation Tasks

| Task ID | Description | Priority | Status | Files Affected |
| :--- | :--- | :--- | :--- | :--- |
| **FE-01** | Design system tokens & UI primitives (`MetricCard`, `ChartContainer`, `Tabs`, `SearchInput`, `UncertaintyBanner`) | P0 | Implemented & Tested | `frontend/tailwind.config.ts`, `frontend/components/ui/*`, `frontend/lib/design-system/*` |
| **FE-02** | Responsive AppShell with mobile navigation drawer, dynamic breadcrumbs, global quick search, and AI/API telemetry pill | P0 | Implemented & Verified | `frontend/components/layout/{AppShell,Navbar,Sidebar}.tsx` |
| **FE-03** | Dashboard Recharts (`DomainDistribution` BarChart + Fuel Category DonutChart) + offline fallback banner | P1 | Implemented & Verified | `frontend/app/dashboard/page.tsx`, `frontend/components/dashboard/DomainDistribution.tsx`, `frontend/hooks/useOverview.ts` |
| **FE-04** | Investigation Explorer with URL SearchParams persistence, multi-facet filters (`fuel_type`, `gravity_regime`, `research_area`, `sort_by`), Cards/Table view, and 10-section Detail dossier | P1 | Implemented & Verified | `frontend/app/investigations/page.tsx`, `frontend/components/investigations/{FilterBar,InvestigationCard,DetailView}.tsx` |
| **FE-05** | Comparison Lab with unit-matched `BarChart`, normalized `RadarChart`, and CSV/JSON export; Insights Center with `Measurement Completeness` chart | P1 | Implemented & Verified | `frontend/app/compare/page.tsx`, `frontend/components/comparison/ComparisonMatrix.tsx`, `frontend/app/insights/page.tsx` |
| **FE-06** | 6-environment Mission Scenario Analyzer, Evidence Center (`/evidence`), and transparent Mock/Live Assistant telemetry | P1 | Implemented & Verified | `frontend/app/scenarios/page.tsx`, `frontend/components/scenarios/GapAnalysisCard.tsx`, `frontend/app/evidence/page.tsx`, `frontend/components/assistant/ChatInterface.tsx` |

## Upcoming Tasks (Next Sprint)

| Task ID | Description | Priority | Dependencies | Acceptance Criteria | Test Requirements |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FE-07** | Streaming token output in `ChatInterface.tsx` when backend SSE is enabled | P2 | `BE-08` | Tokens stream smoothly with live abort button and verified citation panel on completion | Integration check against mock stream |
| **FE-08** | Weight customization sliders in `InsightsPage` | P2 | None | Users can adjust $D, F, C, M, Q$ weights while normalizing sum to $1.0$ | Unit test for weight normalization |
| **FE-09** | Automated responsive E2E browser suite (Playwright) | P2 | `FE-01..06` | Zero console errors and zero horizontal overflow verified at `360px`, `768px`, `1440px` | Headless Chromium CI check |
