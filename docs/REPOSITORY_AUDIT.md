# FlameSafe AI — Repository Audit Report

**Audit Date:** 2026-11-14  
**Repository:** `https://github.com/GhariebML/FLAMESAFE-AI`  
**Audited Branch:** `feature/multi-agent-system`  
**Remote Status:** `origin/feature/multi-agent-system` (ahead of `main`/`integration` which are at `dc0cd46`).

---

## 1. Verified Project Structure & Technology Stack

FlameSafe AI is a full-stack monorepo combining a **FastAPI + LangGraph** scientific backend (`backend/`) with a **Next.js 15 App Router** frontend (`frontend/`), backed by **PostgreSQL 16 + pgvector** (with automatic **SQLite + aiosqlite** fallback for local/standalone environments).

| Layer | Verified Technologies | Evidence |
| :--- | :--- | :--- |
| **Frontend** | Next.js `15.5.x` (`^15.0.3` in manifest), React `19.0.0-rc`, TypeScript `5.6.3`, Tailwind CSS `3.4.15`, Recharts `2.13.3`, Three.js `0.187.0`, Lucide React | `frontend/package.json` |
| **Backend API** | Python `3.11+`, FastAPI `>=0.115.0`, Uvicorn, Pydantic v2, Pydantic Settings | `backend/requirements.txt` |
| **Database & Migrations** | SQLAlchemy `2.0.36+` (async), Alembic `1.13.3+` (4 migrations `001`–`004`), `asyncpg`, `aiosqlite`, `pgvector` | `backend/migrations/versions/` |
| **Multi-Agent & AI** | LangGraph `>=0.2.0` (`StateGraph`), `google-genai >=1.0.0` (`gemini-3.8-flash`, `gemini-embedding-2` at 768 dims), deterministic mock fallback | `backend/app/agents/`, `backend/app/rag/` |
| **Scientific Data** | Pandas `>=2.2.3`, NumPy `>=1.26.4`, PyArrow `>=18.0.0` (Parquet), PyMuPDF `>=1.24.11` | `backend/requirements.txt`, `backend/app/datasets/` |
| **CI / Deployment** | GitHub Actions (`.github/workflows/ci.yml`), Docker & Docker Compose, Render (`render.yaml`, `Dockerfile`), Vercel (`frontend/vercel.json`) | Root & `frontend/` |

---

## 2. Verified Backend Architecture

### 2.1 API Endpoints (`backend/app/api/v1/router.py`)
All 13 router modules are mounted under `/api/v1`:
- `health.py`: `GET /api/v1/health` (reports `healthy` when DB connected, `degraded` otherwise)
- `ai_status.py`: `GET /api/v1/ai/status` (live Gemini connectivity probe + `RuntimeAITelemetry`)
- `overview.py`: `GET /api/v1/overview`
- `investigations.py`: `GET /api/v1/investigations`, `GET /api/v1/investigations/{investigation_id}`
- `comparison.py`: `POST /api/v1/compare`
- `ranking.py`: `POST /api/v1/rank`
- `scenarios.py`: `POST /api/v1/scenarios/analyze`
- `assistant.py`: `POST /api/v1/assistant/query`
- `sources.py`: `GET /api/v1/sources`, `GET /api/v1/sources/catalog`, `GET /api/v1/sources/{source_id}`
- `research.py`: `POST/GET /api/v1/research/requests`, `GET /{id}`, `GET /{id}/events`, `POST /{id}/approve`, `POST /{id}/revise`, `POST /{id}/resume`
- `psi.py`: `GET /api/v1/psi/investigations/search`, `GET /{id}`, `GET /{id}/files`, `GET /psi/files/{id}`
- `acquisitions.py`: `POST /api/v1/acquisitions`, `GET /api/v1/acquisitions/{id}`
- `datasets.py`: `GET /api/v1/datasets`, `GET /{id}`, `GET /{id}/versions`, `GET /{id}/quality-report`, `POST /{id}/analyze`, `GET /{id}/export` (`json`, `csv`, `parquet`), `GET /{id}/coverage`, `GET /{id}/lineage`, `GET /{id}/diff`, `POST /{id}/analytics`

### 2.2 Database Models (`backend/app/models/`)
- Core scientific catalog: `Investigation`, `ExperimentalRun`, `Measurement`, `ResearchDocument`, `EvidenceChunk`, `DataSource`
- Multi-agent & dataset engine (`multi_agent.py`): `ResearchRequest`, `AgentRun`, `AgentCheckpoint`, `WorkflowEvent`, `PSIInvestigationCatalog`, `PSIFileCatalog`, `AcquisitionJob`, `FileAsset`, `DatasetJob`, `Dataset`, `DatasetVersion`, `DatasetItem`, `DatasetValidationReport`, `DatasetApproval`

### 2.3 Multi-Agent Orchestration (`backend/app/agents/orchestrator/supervisor.py`)
`ChiefIntelligenceOrchestrator` (`AGENT_01`) compiles a LangGraph `StateGraph` coordinating `AGENT_02` through `AGENT_11` with SQLAlchemy-persisted `AgentRun`, `WorkflowEvent`, and `AgentCheckpoint` records, supporting human-in-the-loop approval gates (`APPROVE`, `REJECT`, `MODIFY_PLAN`, `RESUME_WORKFLOW`).

---

## 3. Verified Frontend Routes (`frontend/app/`)

- `/` — Branded landing page with Three.js 3D hero (`FlameSafe3DHeroScene`), story sections, and Astro-Flame companion trigger
- `/dashboard` — Mission Control telemetry & repository overview
- `/investigations` — NASA PSI Investigation Explorer with multi-facet filtering
- `/investigations/[id]` — Investigation detail profile, experimental runs, measurements, and DOI documents
- `/research` — AI Lab: 11-agent LangGraph research workflow, HITL approval controls, and Dynamic Dataset Engine inspector
- `/compare` — Data Observatory: cross-investigation parameter matrix, radar coverage chart, and gravity-regime comparison
- `/scenarios` — Decision Lab: environment/oxygen/pressure scenario analyzer & Research Gap Intelligence
- `/insights` — Scientific relevance ranking (`RelevanceScorer`) & decision modes
- `/evidence` — Primary Literature & Citation Vault
- `/assistant` — Dedicated Astro-Flame RAG research assistant view
- `/api/v1/[...slug]` — Next.js App Router fallback API handler for resilience during backend cold-starts or offline previews

---

## 4. Discrepancies Found Between Older Documentation & Current Implementation

1. **Outdated `README.md` Scope:** The previous `README.md` described only the initial 6-module MVP (5 campaigns, basic RAG) and contained a typo (`"SI-Powered"` instead of `"AI-Powered"`), omitting the 11-agent LangGraph orchestrator, Dynamic Dataset Engine (Parquet/CSV/JSON, lineage, versioning, SHA-256 vault), NASA PSI connector, live Vercel/Render architecture, and the 10-route Next.js UI.
2. **Legacy Flat Docs:** `docs/` contained 40+ flat engineering/audit markdown files from development phases without a unified `docs/README.md` or categorized `architecture/`, `features/`, `development/`, `deployment/`, `api/`, and `scientific/` indexes.
3. **Missing Visual Assets:** No real browser-captured product screenshots (`docs/assets/screenshots/`) or GitHub social preview (`docs/assets/readme/flamesafe-social-preview.png`) were present.
4. **Test & Lint Coverage:**
   - Backend unit/integration suite (`41 passed, 1 skipped` — live Gemini smoke test skipped without live API key in CI).
   - Frontend unit tests (`12 passed`) + TypeScript (`tsc --noEmit`) + ESLint (`npm run lint`) + Next.js production build (`npm run build`) all verified passing.
   - `frontend/app/error.tsx`, `frontend/app/not-found.tsx`, and `frontend/.eslintrc.json` were added during production hardening.

---

## 5. Security & Secrets Audit

- Verified `.gitignore` excludes `.env`, `backend/.env`, `frontend/.env`, `.env.*`, `*.db`, `*.sqlite3`, and `data/vault/`.
- Verified `git ls-files` contains **zero** tracked `.env`, key, token, or credential files.
- Verified `PSISourceValidator` enforces HTTPS allowlist and blocks loopback/private SSRF targets.
