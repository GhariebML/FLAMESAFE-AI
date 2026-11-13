# Backend Architecture & Developer Guide — Developer B Handbook

## 1. Overview & Technology Stack
- **Framework**: FastAPI (Python 3.11+)
- **ASGI Server**: Uvicorn
- **ORM & Data Layer**: SQLAlchemy 2.0 (Asynchronous engine via `asyncpg`)
- **Validation**: Pydantic v2 / Pydantic Settings
- **Database**: PostgreSQL 16 with `pgvector` (SQLite fallback via `aiosqlite`)
- **Migrations**: Alembic
- **Scientific Data & NLP**: Pandas, NumPy, PyMuPDF (`fitz`)
- **Backend Root**: `backend/`

---

## 2. Directory Structure & Architectural Layers
```text
backend/
├── app/
│   ├── main.py               # FastAPI application entrypoint, CORS, lifespan & error handlers
│   ├── api/v1/
│   │   ├── router.py         # Master v1 router aggregating all endpoints
│   │   └── endpoints/        # Endpoint controllers (health, overview, investigations, etc.)
│   ├── core/
│   │   ├── config.py         # Settings loaded from environment variables
│   │   ├── database.py       # Async engine, sessionmaker, and DB lifecycle
│   │   ├── exceptions.py     # Custom domain exceptions (InvestigationNotFoundError, etc.)
│   │   └── logging.py        # Centralized logging configuration
│   ├── models/               # SQLAlchemy 2.0 declarative database models
│   ├── schemas/              # Pydantic v2 request/response validation schemas
│   ├── repositories/         # Database access layer (InvestigationRepository, DocumentRepository)
│   ├── services/             # Business logic layer (InvestigationService, ComparisonService, AIService)
│   ├── ingestion/            # Data collection, PDF extraction, normalization, and validation
│   ├── rag/                  # Chunker, embeddings, retriever, reranker, generator, citations
│   ├── ranking/              # Relevance scoring formula and explainability engine
│   └── tests/                # Automated pytest test suite
├── migrations/               # Alembic database migrations
└── scripts/                  # Standalone administrative scripts (seed_data.py, run_migrations.py)
```

---

## 3. Layer Responsibilities & Patterns

### 3.1. Repository Pattern (`app/repositories/`)
Repositories contain pure database query logic using SQLAlchemy 2.0 `select()` and async sessions. Services never execute raw SQL or construct ORM queries directly:
```python
from app.repositories.investigation_repo import InvestigationRepository

repo = InvestigationRepository(db_session)
investigation = await repo.get_by_id("e0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c")
```

### 3.2. Service Pattern (`app/services/`)
Services encapsulate business rules, analytical formulas, and orchestration:
- `InvestigationService`: Coordinates overview calculations and pagination.
- `ComparisonService`: Compares investigations and enforces unit compatibility.
- `RankingService`: Implements the 5-factor relevance formula.
- `ScenarioService`: Maps exploration environments to NASA flight analog data.
- `AIService`: Manages the RAG pipeline lifecycle.

### 3.3. Pydantic v2 Schemas (`app/schemas/`)
All API inputs and outputs must validate through Pydantic v2 schemas. Use `ConfigDict(from_attributes=True)` to serialize SQLAlchemy model instances into JSON responses automatically:
```python
class InvestigationDetailSchema(BaseModel):
    id: str
    psi_id: str
    acronym: str
    title: str
    # ...
    model_config = ConfigDict(from_attributes=True)
```

---

## 4. Running Migrations & Seeding
### Apply Migrations:
```bash
cd backend
alembic upgrade head
```

### Seed NASA PSI Datasets:
```bash
python -m scripts.seed_data
```
The FastAPI lifespan handler automatically checks if the database is empty upon startup and seeds the canonical NASA flight investigations automatically.

---

## 5. Running the Backend Test Suite
All backend tests run asynchronously with pytest:
```bash
cd backend
python -m pytest -v
```
To run a specific test file:
```bash
python -m pytest app/tests/test_assistant.py -v
```
All 11 baseline tests run against an in-memory SQLite database, guaranteeing fast, self-contained test execution without external dependencies.
