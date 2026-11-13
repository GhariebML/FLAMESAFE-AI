# Two-Developer Team Workflow & Collaboration Guide

## 1. Overview & Team Structure
FlameSafe AI is engineered by two primary software developers working in parallel under the 2026 NASA Space Apps Challenge (Team R²):
- **Developer A — Frontend & Product Engineer**
- **Developer B — Backend, Data & AI Engineer**

To prevent merge conflicts, duplicated effort, or architectural misalignment, this document governs the division of responsibilities, the Git collaboration topology, and the shared integration milestones.

---

## 2. Ownership & Responsibility Matrix

| System Component | Primary Owner | Secondary / Reviewer | Rules & Boundaries |
| :--- | :--- | :--- | :--- |
| **Next.js Application & Pages** (`frontend/app/`) | Developer A | Developer B | Developer B does not edit UI page routing. |
| **UI Components & Visualizations** (`frontend/components/`) | Developer A | Developer B | Developer A owns Recharts, layouts, and Tailwind styling. |
| **Frontend API Client** (`frontend/lib/api/`) | Developer A | Developer B | Uses agreed `docs/API_CONTRACT.md` property definitions. |
| **FastAPI Endpoints & Controllers** (`backend/app/api/`) | Developer B | Developer A | Must strictly adhere to OpenAPI v1 contracts. |
| **SQLAlchemy Models & DB** (`backend/app/models/`, `migrations/`) | Developer B | Developer A | Developer A never modifies database schemas directly. |
| **NASA PSI Ingestion & Parsing** (`backend/app/ingestion/`) | Developer B | Developer A | Preserves scientific traceability and DOIs. |
| **RAG Pipeline & LLM Abstraction** (`backend/app/rag/`) | Developer B | Developer A | Enforces citation verification and hallucination limits. |
| **Ranking Engine** (`backend/app/ranking/`) | Developer B | Developer A | Computes weighted relevance scores; explains matches. |
| **API Contract Approval** (`docs/API_CONTRACT.md`) | Shared (50/50) | Shared (50/50) | Any field change requires mutual sign-off before coding. |
| **End-to-End Integration Testing** | Shared (50/50) | Shared (50/50) | Both test live UI against live backend before release. |

---

## 3. Git Branching Strategy

```text
main (Protected, Production-Ready)
  └── integration (Shared Staging Branch)
        ├── feature/frontend-comparison-radar (Dev A)
        ├── feature/frontend-assistant-chat (Dev A)
        ├── feature/backend-psi-ingestion (Dev B)
        └── feature/backend-rag-citations (Dev B)
```

### Branch Roles
- **`main`**: Production-ready branch. Deployed to live demonstration environment. Direct pushes are disabled.
- **`integration`**: Staging integration branch. Developer A and Developer B merge their feature branches here to perform end-to-end testing.
- **`feature/frontend-<name>`**: Developer A working branches.
- **`feature/backend-<name>`**: Developer B working branches.
- **`fix/<name>`**: Bug fixes for integration or staging defects.

---

## 4. Conventional Commit Standards
All commits must follow the Conventional Commits specification:
- `feat(frontend): implement comparison matrix table component`
- `feat(backend): add scientific relevance ranking scoring engine`
- `feat(rag): implement citation validation against retrieved chunks`
- `fix(api): correct pressure unit conversion in scenario service`
- `docs: update API contract for investigation detail endpoint`
- `test(backend): add tests for limiting oxygen concentration`

---

## 5. Pull Request (PR) Workflow
1. Branch from up-to-date `integration`.
2. Implement feature within assigned ownership boundaries.
3. Verify local tests pass (`make test` or `python -m pytest` / `node --test`).
4. Push branch to GitHub:
   ```bash
   git push origin feature/frontend-dashboard
   ```
5. Open a Pull Request targeting `integration` using the PR template (`.github/PULL_REQUEST_TEMPLATE.md`).
6. Request code review from the other developer.
7. Merge using **Squash and Merge** after approval and clean CI pass.

---

## 6. The First End-to-End Integration Milestone
### Milestone Objective: "Live FlameSafe Seed Data Pipeline Verification"
- **Acceptance Criteria**:
  1. Developer B starts the backend (`http://localhost:8000`) with PostgreSQL or SQLite fallback.
  2. Database seeds canonical NASA PSI investigations (BASS, SAFFIRE, FLEX, SAME, ACME).
  3. Developer A launches Next.js frontend (`http://localhost:3000`).
  4. The frontend Navbar displays `API: Online` in green.
  5. The Mission Intelligence Dashboard displays live metrics (5 investigations, 8 runs, 14 measurements).
  6. The Investigation Explorer lists all 5 investigations with verified DOIs and allows viewing the BASS detail page with experimental runs.
  7. The SI Assistant answers a sample question ("What is the quench velocity in BASS?") and displays verified citation `CIT-001`.
