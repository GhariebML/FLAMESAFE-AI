# FlameSafe AI API Reference

Base prefix: `/api/v1`  
Interactive OpenAPI / Swagger UI (when backend is running): `/docs` and `/redoc` (`openapi_url: /api/v1/openapi.json`).  
All standard JSON responses follow `APIResponseEnvelope` (`{ "success": true, "message": "...", "data": ... }`).

## Verified Endpoints (`backend/app/api/v1/endpoints/`)

| Group | Method | Path | Purpose |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/v1/health` | Verifies API and database connectivity (`healthy` or `degraded`) |
| **AI Diagnostics** | `GET` | `/api/v1/ai/status` | Reports active AI/embedding provider and runs live Gemini check (`?verify=true`) |
| **Overview** | `GET` | `/api/v1/overview` | Mission Control repository counts, domain distribution, and recent sources |
| **Investigations** | `GET` | `/api/v1/investigations` | Paginated, multi-facet filtered NASA PSI investigations |
| **Investigations** | `GET` | `/api/v1/investigations/{investigation_id}` | Full investigation profile, experimental runs, measurements, and DOI documents |
| **Comparison** | `POST` | `/api/v1/compare` | Side-by-side parameter matrix and numeric metrics for 2–4 investigations |
| **Ranking** | `POST` | `/api/v1/rank` | Weighted scientific relevance ranking (`RelevanceScorer`) |
| **Scenarios** | `POST` | `/api/v1/scenarios/analyze` | Evaluates target space habitat conditions against empirical NASA PSI runs |
| **Assistant** | `POST` | `/api/v1/assistant/query` | RAG-grounded scientific Q&A with citation verification and abstention |
| **Sources** | `GET` | `/api/v1/sources`, `/api/v1/sources/catalog` | Traceable NASA PSI / NTRS source catalog |
| **Sources** | `GET` | `/api/v1/sources/{source_id}` | Detailed provenance record for a single source |
| **Multi-Agent Research** | `POST` | `/api/v1/research/requests` | Starts a new 11-agent LangGraph research workflow |
| **Multi-Agent Research** | `GET` | `/api/v1/research/requests` | Lists recent research requests |
| **Multi-Agent Research** | `GET` | `/api/v1/research/requests/{id}` | Full request state, agent runs, checkpoints, and outputs |
| **Multi-Agent Research** | `GET` | `/api/v1/research/requests/{id}/events` | Chronological workflow state transition events |
| **Multi-Agent Research** | `POST` | `/api/v1/research/requests/{id}/approve` | Submits HITL decision (`APPROVE`, `REJECT`, `MODIFY_PLAN`, `RESUME_WORKFLOW`) |
| **Multi-Agent Research** | `POST` | `/api/v1/research/requests/{id}/revise` | Revises scientific intent parameters |
| **Multi-Agent Research** | `POST` | `/api/v1/research/requests/{id}/resume` | Resumes workflow from persisted checkpoint |
| **NASA PSI Connector** | `GET` | `/api/v1/psi/investigations/search` | Searches indexed/live NASA PSI campaign catalog |
| **NASA PSI Connector** | `GET` | `/api/v1/psi/investigations/{id}` | PSI investigation metadata |
| **NASA PSI Connector** | `GET` | `/api/v1/psi/investigations/{id}/files` | Priority-scored file manifest for an investigation |
| **NASA PSI Connector** | `GET` | `/api/v1/psi/files/{id}` | File manifest item metadata |
| **Acquisitions** | `POST` | `/api/v1/acquisitions` | Triggers SSRF-guarded file acquisition job |
| **Acquisitions** | `GET` | `/api/v1/acquisitions/{id}` | Acquisition job status and SHA-256 vault assets |
| **Datasets** | `GET` | `/api/v1/datasets` | Lists dynamically constructed datasets |
| **Datasets** | `GET` | `/api/v1/datasets/{id}` | Dataset schema, records, and metadata |
| **Datasets** | `GET` | `/api/v1/datasets/{id}/versions` | Semantic version history |
| **Datasets** | `GET` | `/api/v1/datasets/{id}/quality-report` | Deterministic validation & null-guard report |
| **Datasets** | `POST` | `/api/v1/datasets/{id}/analyze` | Runs summary analysis on dataset records |
| **Datasets** | `GET` | `/api/v1/datasets/{id}/export` | Exports dataset in `json`, `csv`, or `parquet` format |
| **Datasets** | `GET` | `/api/v1/datasets/{id}/coverage` | Field completeness, DOI, and SI consistency coverage |
| **Datasets** | `GET` | `/api/v1/datasets/{id}/lineage` | Item-level 6-step provenance chain |
| **Datasets** | `GET` | `/api/v1/datasets/{id}/diff` | Version-over-version record diff |
| **Datasets** | `POST` | `/api/v1/datasets/{id}/analytics` | Pandas analytical workspace aggregation & filtering |

> **Authentication:** Currently, all `/api/v1` endpoints operate without user authentication for open research/hackathon evaluation. Do not expose unauthenticated write endpoints in multi-tenant environments without adding auth middleware.
