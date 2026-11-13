# FlameSafe AI — Frontend/Backend Integration Roadmap

## Integration Principles
- All frontend-backend communication uses typed REST JSON contracts under `/api/v1` documented in `docs/API_CONTRACT.md`.
- Every endpoint wraps responses in `APIResponseEnvelope<T>`.
- Missing numerical values remain `null` in JSON and render as `"Not recorded"` in the UI.
- Mock/demo fallback states (`isUsingFallback`, `is_mock_provider`) must always be explicitly surfaced to the user.

---

## Integration Checkpoints

### Checkpoint 1 — Core Explorer & Dashboard Telemetry (Verified Complete)
- **Backend Owners:** `GET /api/v1/health`, `GET /api/v1/overview`, `GET /api/v1/investigations`, `GET /api/v1/investigations/{id}`
- **Frontend Consumers:** `Navbar`, `DashboardPage`, `InvestigationsPage`, `DetailView`
- **Verification Criteria:** Live SQLite/Postgres auto-seeding loads 5 investigations (`BASS`, `SAFFIRE`, `FLEX`, `SAME`, `ACME`); filter query parameters sync cleanly with URL SearchParams.

### Checkpoint 2 — Analytical Labs & Quantitative Charts (Verified Complete)
- **Backend Owners:** `POST /api/v1/compare`, `POST /api/v1/rank`, `POST /api/v1/scenarios/analyze`
- **Frontend Consumers:** `ComparisonMatrix`, `InsightsPage`, `GapAnalysisCard`, `ScenariosPage`
- **Verification Criteria:** Unit-compatible `numeric_metrics` render cleanly in Recharts `BarChart` and `RadarChart`; all 6 space environments return structured match classifications and research gaps.

### Checkpoint 3 — Evidence Traceability & RAG Grounding (Verified Complete)
- **Backend Owners:** `POST /api/v1/assistant/query`, `GET /api/v1/sources`, `GET /api/v1/sources/{id}`
- **Frontend Consumers:** `ChatInterface`, `CitationViewer`, `EvidenceCenterPage`
- **Verification Criteria:** Every citation links to DOI and page number; insufficient evidence triggers abstention (`has_sufficient_evidence = false`); `is_mock_provider = true` displays the mock synthesis banner.

### Checkpoint 4 — Live Gemini & `pgvector` Production Cutover (Next Milestone)
- **Owners:** Developer B (Backend/AI) + Lead (Infra)
- **Verification Criteria:** Running `docker compose up --build -d` with PostgreSQL `pgvector:pg16` + valid `GEMINI_API_KEY` transitions `Navbar` telemetry from `AI: Mock Mode` to `AI: gemini` without schema changes.
