# Testing & Quality Assurance Guide — FlameSafe AI

## 1. QA Strategy & Testing Pyramid
FlameSafe AI enforces multi-level quality assurance:
1. **Unit & Mathematical Verification**: Testing numerical normalization, physical bounds, weighted ranking calculations, and citation builder logic.
2. **Integration & API Testing**: Testing full asynchronous HTTP request/response lifecycles, database transactions, and error status handling.
3. **Frontend Component & Client Testing**: Verifying formatting utilities, type correctness, and API envelope unwrapping.
4. **CI/CD Automation**: Automated GitHub Actions workflow executing linting and test suites on every pull request.

---

## 2. Backend Automated Test Suite
The backend test suite is located in `backend/app/tests/` and runs with `pytest` and `pytest-asyncio`.

### Running All Backend Tests:
```bash
cd backend
python -m pytest -v
```

### Test Suite Inventory:
| Test File | Target Module | Scope & Verification |
| :--- | :--- | :--- |
| `test_health.py` | Health & Status | Verifies `/api/v1/health` returns HTTP 200, healthy status, and active database connection. |
| `test_investigations.py` | Module 2 Explorer | Validates listing pagination, query filtering, and detail endpoint relationships. |
| `test_comparison.py` | Module 3 Comparison | Tests multi-investigation parameter alignment, delta generation, and invalid ID error handling. |
| `test_ranking.py` | Module 4 Ranking | Verifies the 5-factor scoring formula ($0-100$), factor breakdowns, and scientific disclaimer attachment. |
| `test_scenarios.py` | Module 5 Scenarios | Evaluates Lunar/Mars gravity context tags, condition matching, and research gap detection. |
| `test_assistant.py` | Module 6 Assistant | Tests RAG query execution, similarity retrieval, and presence of authentic DOI citations. |
| `test_normalizer.py` | Ingestion Normalizer | Validates unit conversion for pressure (atm/psi -> kPa), velocity (m/s -> cm/s), and oxygen. |
| `test_citations.py` | Citation Engine | Verifies citation formatting, page number extraction, and "Verified Source" tagging. |

---

## 3. Frontend Testing & Type Verification
Located in `frontend/tests/`:

### Run Unit Tests:
```bash
cd frontend
npm test
```

### Run TypeScript Type Check:
```bash
cd frontend
npm run typecheck
```

---

## 4. Code Formatting & Linting

### Backend Linting (Ruff):
```bash
cd backend
ruff check .
```

### Frontend Linting (ESLint):
```bash
cd frontend
npm run lint
```

---

## 5. Continuous Integration (GitHub Actions)
The workflow file `.github/workflows/ci.yml` triggers on all pushes and pull requests to `main` and `integration`:
- **Job 1: `backend-checks`**:
  - Python 3.11 setup.
  - Installs dependencies from `requirements.txt`.
  - Runs `ruff check .`
  - Runs `pytest -v` with in-memory SQLite and mock AI provider.
- **Job 2: `frontend-checks`**:
  - Node.js 20 setup.
  - Installs dependencies from `package.json`.
  - Runs TypeScript compiler (`tsc --noEmit`).
  - Runs frontend unit tests.
