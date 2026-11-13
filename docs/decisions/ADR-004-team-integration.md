# ADR-004: Two-Developer Parallel Workflow and Contract-Driven Integration

## Status
Accepted

## Date
2026-11-13

## Context
The FlameSafe AI core development team consists of two engineers working concurrently:
- **Developer A**: Frontend & Product Engineer (UI/UX, visual analytics, Next.js, component architecture).
- **Developer B**: Backend, Data & AI Engineer (FastAPI, database models, Alembic, NASA PSI ingestion, RAG).

Without an agreed integration boundary, teams frequently suffer merge conflicts, schema divergence, blocked frontend development while waiting for backend APIs, and integration failures right before judging.

## Decision
We established a **Contract-Driven Integration Framework**:
1. **Contract as Single Source of Truth**: `docs/API_CONTRACT.md` and FastAPI OpenAPI schemas define every payload, query param, error code, and HTTP status code upfront.
2. **Strict Ownership Boundaries**:
   - Developer A owns `frontend/`, `components/`, `app/`, `hooks/`, and UI tests. Never edits backend code directly.
   - Developer B owns `backend/`, `data/`, `app/models/`, `app/services/`, and API tests. Never breaks agreed contract properties without written notice.
3. **Decoupled Local Development**: The frontend client (`lib/api/client.ts`) includes graceful fallbacks to typed local seed data, allowing Developer A to build and test UI flows even when the backend is offline or being migrated.
4. **Git Branch Hierarchy**: Work proceeds in isolated feature branches (`feature/frontend-*`, `feature/backend-*`), merges into an `integration` branch for staging tests, and promotes to `main` only after verified end-to-end milestone completion.

## Consequences
- **Positive**: Zero development blocking; clear accountability; reproducible pull request reviews; rapid feature completion.
- **Negative**: Requires upfront documentation effort to maintain schema alignment.
