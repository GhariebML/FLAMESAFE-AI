# Contributing to FlameSafe AI

Thank you for contributing to **FlameSafe AI**, an open-source platform designed for the 2026 NASA Space Apps Challenge (Team R²).

## Team Members & Development Roles

- **Developer A (Frontend & Product Engineer):** Owns UI architecture, Next.js components, visual analytics, and client-side integration.
- **Developer B (Backend, Data & AI Engineer):** Owns FastAPI services, data models, PostgreSQL/pgvector storage, NASA data ingestion, and the RAG pipeline.

---

## 1. Code of Conduct

- Maintain respect and constructive communication across all PR reviews and discussions.
- Adhere strictly to **Scientific Integrity guidelines** (see `docs/SCIENTIFIC_INTEGRITY.md`).
- Never fabricate experimental results, synthetic DOIs, or ungrounded scientific metrics.

---

## 2. Branching Strategy

We use a structured branch topology:

- `main`: Production-ready, verified code. Protected branch.
- `integration`: Shared staging branch where Developer A and Developer B merge and validate end-to-end features.
- `feature/frontend-<feature-name>`: Developer A working branches.
- `feature/backend-<feature-name>`: Developer B working branches.
- `fix/<issue-name>`: Hotfixes and bug fixes.

---

## 3. Commit Message Conventions

We adhere to the Conventional Commits specification:

- `feat(frontend): add comparison radar chart component`
- `feat(backend): implement investigation filter endpoints`
- `feat(rag): add citation verification service`
- `fix(api): correct unit conversion for pressure metrics`
- `docs: update API contract for scenario analysis`
- `test(backend): add test cases for weighted ranking formula`
- `chore: update docker compose configuration`

---

## 4. Pull Request (PR) Workflow

1. Branch off `integration`.
2. Implement your scoped feature adhering to the ownership boundaries.
3. Run local linters and automated tests (`make test` or `npm test` / `pytest`).
4. Ensure all documentation matches code changes (e.g., update `docs/API_CONTRACT.md` if schema changed).
5. Open a Pull Request targeting `integration`.
6. Request a review from the other developer. Both developers must approve before merging.
7. Merge using "Squash and Merge" or "Rebase and Merge" to keep a clean history.

---

## 5. Coding Standards

### Backend (Python / FastAPI)
- Use Python 3.11+ type hints on all functions and parameters.
- Use Pydantic v2 schemas for all request/response models.
- Format code using Black and Ruff.
- Use asynchronous SQLAlchemy sessions for database queries.

### Frontend (Next.js / TypeScript)
- Use TypeScript with strict type checking enabled.
- Tailwind CSS for all responsive layouts and components.
- Keep components modular: presentational components in `components/`, page routes in `app/`.
- Centralize all API calls through `lib/api/client.ts`.
