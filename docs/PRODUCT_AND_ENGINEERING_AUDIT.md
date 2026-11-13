# FlameSafe AI — Complete Product and Engineering Audit

**Audit Date:** 2026-11-13  
**Repository:** `https://github.com/GhariebML/FLAMESAFE-AI`  
**Audited Baseline Commit:** `ffab9ce` (`main` / `integration`)  
**Audit Methodology:** Direct static code inspection across all 180+ repository files combined with live runtime execution of the FastAPI backend (`uvicorn`), `pytest` suite, and Next.js TypeScript compiler (`tsc --noEmit`).

---

## 1. Existing Implemented Features (Verified Working)

The following components were verified both by reading source files and by executing tests or live API calls:

1. **Monorepo & Build Tooling**:
   - Next.js 15.0.3 App Router (`frontend/`), FastAPI 0.115+ (`backend/`), SQLAlchemy 2.0 Async, Pydantic v2, Alembic migrations, Docker Compose (`docker-compose.yml`), and GitHub Actions CI (`.github/workflows/ci.yml`).
2. **Database Schema & Models (`backend/app/models/`)**:
   - Six relational models implemented and tested: `Investigation`, `ExperimentalRun`, `Measurement`, `ResearchDocument`, `EvidenceChunk`, and `DataSource`.
   - Automatic local fallback from PostgreSQL (`asyncpg`) to SQLite (`aiosqlite`) implemented in `backend/app/core/database.py` when local PostgreSQL is not running.
   - Null-safety preserved on quantitative measurements (`Measurement.metric_value` is `Optional[float]`, never coerced to `0.0`).
3. **REST API v1 Contract (`backend/app/api/v1/`)**:
   - All 9 endpoints respond with standardized `APIResponseEnvelope[T]` or `PaginatedResponse[T]`:
     - `GET /api/v1/health`
     - `GET /api/v1/overview`
     - `GET /api/v1/investigations`
     - `GET /api/v1/investigations/{investigation_id}`
     - `POST /api/v1/compare`
     - `POST /api/v1/rank`
     - `POST /api/v1/scenarios/analyze`
     - `POST /api/v1/assistant/query`
     - `GET /api/v1/sources/{source_id}`
4. **Unit Normalization & Validation (`backend/app/ingestion/`)**:
   - `UnitNormalizer` converts pressure (`atm`, `psi`, `bar`, `pa` $\rightarrow$ `kPa`), velocity (`m/s`, `mm/s` $\rightarrow$ `cm/s`), and oxygen mole fraction ($\rightarrow$ `%`).
   - `ScientificValidator` validates DOI syntax (`^10\.\d{4,9}/[-._;()/:A-Za-z0-9]+$`) and physical bounds ($0 \le \text{O}_2 \le 100\%$, pressure $> 0$, airflow $\ge 0$).
5. **Weighted Relevance Ranking Engine (`backend/app/ranking/scoring.py`)**:
   - Computes $R = 0.30D + 0.25F + 0.20C + 0.15M + 0.10Q$ with per-factor breakdown (`domain_score`, `fuel_score`, `condition_score`, `mission_score`, `quality_score`), matched/missing factor lists, and non-probabilistic fire-risk disclaimer.

---

## 2. Features That Are Partially Implemented

1. **Dashboard Visualizations (`frontend/app/dashboard/page.tsx`, `frontend/components/dashboard/DomainDistribution.tsx`)**:
   - Although `recharts` (`^2.13.3`) is installed in `frontend/package.json`, **zero Recharts components are imported or rendered anywhere in `frontend/`**. `DomainDistribution.tsx` renders plain HTML `<div>` rows.
2. **Investigation Explorer Filtering (`backend/app/repositories/investigation_repo.py`, `frontend/app/investigations/page.tsx`)**:
   - Currently supports filtering only by `query`, `research_area`, and `acronym`.
   - Does **not** support filtering by `fuel_type` or `gravity_regime`, sorting, table view toggle, or URL query parameter persistence (`useSearchParams`).
3. **Comparison Lab (`frontend/app/compare/page.tsx`, `backend/app/services/comparison_service.py`)**:
   - Compares high-level investigation text strings (e.g. `"18.5% - 21.0%"`) in a static table.
   - Lacks visual Recharts comparisons for compatible quantitative metrics, lacks measurement-level comparisons (such as `Flame Spread Rate`), and has no export (`CSV`/`JSON`) capability.
4. **Mission Scenario Analyzer (`backend/app/services/scenario_service.py`, `frontend/app/scenarios/page.tsx`)**:
   - `relevant_acronyms = ["BASS", "SAFFIRE", "SAME"]` is hardcoded in `scenario_service.py` (line 62) rather than dynamically matching experimental runs against the requested pressure, oxygen, and airflow ranges.
   - `condition_matches` uses static status strings (`"Direct Match"`, `"Analogous Range"`, `"Extrapolated"`) without distinguishing `"Partial Match"` or `"Unsupported Condition"`, and omits `recommended_research_directions`.
5. **Seed Dataset Completeness (`data/seed/seed_documents.json` vs `data/seed/seed_investigations.json`)**:
   - `seed_investigations.json` defines 5 investigations (`BASS`, `SAFFIRE`, `FLEX`, `SAME`, `ACME`) with 5 research documents.
   - However, `seed_data.py` ignores `item["research_documents"]` in `seed_investigations.json` and only loads `seed_documents.json`, which contains **4 documents** (missing `doc-acme-001` for `ACME`) and **6 evidence chunks** (not 7 as previously reported).
   - Furthermore, `seed_data.py` leaves `EvidenceChunk.embedding` as `None` when seeding.

---

## 3. Features That Are Placeholders

1. **`GeminiEmbeddingProvider` (`backend/app/rag/embeddings.py`, lines 48–62)**:
   - Currently logs a message and returns `MockEmbeddingProvider()._generate_vector(text)` (deterministic SHA-256 trigonometric hash vectors). It makes **no real network call** to Google's embedding API.
2. **`GeminiLLMProvider` (`backend/app/rag/generator.py`, lines 54–71)**:
   - Currently logs a message and delegates directly to `MockLLMProvider().generate_response(...)`. If a developer sets `AI_PROVIDER=gemini`, the system silently returns mock template text while reporting `ai_provider="gemini"` in the API response.
3. **`PSISourceAdapter.fetch_document_content` (`backend/app/ingestion/sources/psi_adapter.py`, lines 45–48)**:
   - Logs a message and returns `None`. There is no end-to-end batch ingestion orchestrator connecting `PDFExtractor`, `ScientificTextChunker`, `UnitNormalizer`, `ScientificValidator`, deduplication hashing, and database persistence.

---

## 4. Broken or Incomplete Functionality (Verified Bugs)

1. **Async Lazy-Load Crash Risk in `DocumentRepository.get_chunks_for_investigation` (`backend/app/repositories/document_repo.py`, lines 23–33)**:
   - `get_chunks_for_investigation` loads `.options(selectinload(EvidenceChunk.document))` without chaining `.selectinload(ResearchDocument.investigation)`. When `AIService.answer_query` is called with `investigation_id_filter` set, accessing `doc.investigation` (line 69 of `ai_service.py`) triggers an implicit synchronous IO lazy load on an async session (`MissingGreenlet` error).
2. **Broken Mobile Navigation (`frontend/components/layout/Sidebar.tsx`, line 30 & `Navbar.tsx`)**:
   - `Sidebar.tsx` uses `hidden md:flex`. Below `768px` (`360px`, `390px` mobile screens), the sidebar disappears and `Navbar.tsx` has **no mobile menu button or drawer**. Mobile users cannot navigate between modules.
3. **Silent Offline Fallback in `useInvestigations` (`frontend/hooks/useInvestigations.ts`)**:
   - When the backend is unreachable, `useInvestigations` silently populates `FALLBACK_INVESTIGATIONS` without exposing an `isUsingFallback` flag or alerting the user that offline demo data is being displayed.
4. **Masked Test Failures in `frontend/package.json` (line 11)**:
   - `"test": "node --test tests/*.test.js || echo 'Frontend unit tests executed'"` always exits with code `0` even when unit tests fail, preventing CI from catching regressions.
5. **Missing Dedicated Evidence & Sources Center Page**:
   - While `GET /api/v1/sources/{source_id}` exists, there is no `GET /api/v1/sources` collection endpoint and no `/evidence` frontend route for browsing verified publications, DOIs, and extracted evidence chunks.

---

## 5. Frontend Design Weaknesses

1. **Lack of Visual Hierarchy & Scientific Charts**:
   - Pages rely heavily on uniform dark cards without visual data representation (`Recharts`), making it difficult for researchers to compare parameter regimes at a glance.
2. **Palette & Contrast Inconsistency**:
   - Current `space` tokens (`#050811`, `#0a1124`) lack the structured aerospace elevation hierarchy of Deep Space Navy (`#071525`), Midnight Blue (`#0D2035`), Electric Blue (`#3B82F6`), Scientific Cyan (`#22D3EE`), and Controlled Amber (`#F59E0B`).
3. **Missing Breadcrumbs & Global Context**:
   - `Navbar.tsx` displays static branding rather than contextual page titles, breadcrumbs, quick search, or explicit AI/Demo Mode telemetry.
4. **Incomplete Investigation Detail Layout (`frontend/components/investigations/DetailView.tsx`)**:
   - Shows basic runs and documents, but omits structured sections for sensors/hardware inventory, related investigations, and indexed evidence chunks with page citations.

---

## 6. Backend Architecture Weaknesses

1. **No Batch Ingestion Orchestrator**:
   - Individual classes (`PDFExtractor`, `MetadataParser`, `UnitNormalizer`, `ScientificValidator`) exist in isolation under `backend/app/ingestion/`, but no pipeline service or CLI script coordinates them with error isolation, content hashing, and reporting.
2. **Missing Source & Evidence Listing Endpoint**:
   - `backend/app/api/v1/endpoints/sources.py` only fetches a single `DataSource` by UUID (`GET /sources/{source_id}`), offering no way to list or filter all sources, documents, and evidence chunks.
3. **Idempotency & Completeness of Seeding**:
   - `seed_data.py` checks `count(Investigation.id) > 0`, which skips seeding if even 1 investigation exists, and does not seed `ACME` chunks or precompute embeddings.

---

## 7. Database Design Risks

1. **Untracked Embedding Provenance (`backend/app/models/evidence_chunk.py`)**:
   - `EvidenceChunk` stores `embedding: Mapped[Optional[List[float]]] = mapped_column(JSON, nullable=True)` without recording `embedding_provider`, `embedding_model`, `embedding_dimension`, `embedded_at`, or `content_hash`. Mixing vectors from different models or dimensions cannot be detected at the database layer.
2. **PostgreSQL `pgvector` vs SQLite Compatibility**:
   - `001_initial_schema.py` runs `CREATE EXTENSION IF NOT EXISTS vector;` on PostgreSQL, but defines `embedding` as `sa.JSON()`. A migration (`002_...`) and hybrid column/query strategy are needed so PostgreSQL can leverage native vector indexing/operations while SQLite remains 100% functional for local/CI testing.
3. **Raw Value Preservation**:
   - `ExperimentalRun` and `Measurement` should preserve raw units/values in metadata or dedicated fields when normalization occurs.

---

## 8. AI Integration Limitations

1. **Mock Masquerading Risk**:
   - `GeminiLLMProvider` and `GeminiEmbeddingProvider` fall back silently to mock implementations without flagging the response as mock/fallback output.
2. **Lack of Versioned Prompt Templates**:
   - System instructions are hardcoded inline inside `AIService.answer_query` rather than managed as versioned, testable prompt templates.
3. **No Quantitative RAG Evaluation Suite**:
   - No evaluation dataset currently tests retrieval recall, citation accuracy, and abstention precision across verified NASA combustion questions.

---

## 9. Scientific Data Quality Issues

1. **Missing `ACME` Evidence Chunks in `seed_documents.json`**:
   - `ACME` (`PSI-ACME-01`, DOI `10.1016/j.combustflame.2018.04.015`) has `doc-acme-001` listed in `seed_investigations.json` but is missing from `seed_documents.json`, leaving `ACME` unrepresented in RAG retrieval.
2. **Hardcoded Scenario Matching**:
   - `ScenarioService` returns `["BASS", "SAFFIRE", "SAME"]` regardless of whether `ACME` or `FLEX` matches the fuel/condition profile, and does not dynamically inspect `ExperimentalRun` oxygen, pressure, and airflow ranges.

---

## 10. Performance Concerns

1. **In-Memory Retrieval Loop**:
   - `EvidenceRetriever.retrieve` calls `embedder.embed_query(chunk.chunk_text)` on the fly for every candidate chunk whose `chunk.embedding` is `None`. Since `seed_data.py` left `chunk.embedding` as `None`, every query recomputes embeddings for all chunks in the database. Precomputing and persisting embeddings during seeding/ingestion eliminates this overhead.
2. **Un-debounced Search Input**:
   - `InvestigationsPage` triggers an API request on every keystroke (`useState` bound directly to `useInvestigations`). Adding a debounced search hook/input prevents redundant network calls.

---

## 11. Security Risks

1. **Silent Fallback Masking Configuration Errors**:
   - Falling back from `GeminiLLMProvider` to `MockLLMProvider` without explicit telemetry can mislead operators in staging/production.
2. **Unbounded File Input in PDF Extractor**:
   - `PDFExtractor` does not enforce a maximum file size or validate PDF magic bytes (`%PDF-`) before invoking PyMuPDF.

---

## 12. Recommended Implementation Priorities

### P0 — Critical Foundation (Immediate Execution)
- Fix `DocumentRepository.get_chunks_for_investigation` eager loading (`selectinload(ResearchDocument.investigation)`).
- Fix `seed_documents.json` and `seed_data.py` to include `ACME` (`doc-acme-001`), precompute embeddings with model/dimension provenance, and ensure idempotent seeding.
- Fix `frontend/package.json` test script so failures return a non-zero exit code.
- Implement responsive mobile navigation drawer in `Navbar.tsx` / `Sidebar.tsx`.
- Expose explicit `ai_mode` / fallback telemetry so mock data is never silently presented as live API/AI output.

### P1 — Product Intelligence & Visual Transformation
- Establish the complete Aerospace Scientific Design System (`tokens.ts`, `frontend/components/ui/`, updated Tailwind palette).
- Transform all 7 existing pages + add the new **Evidence & Sources Center (`/evidence`)** with `GET /api/v1/sources`.
- Build real interactive `Recharts` visualizations on the Dashboard, Comparison Lab, and Insights pages.
- Upgrade `GeminiEmbeddingProvider` and `GeminiLLMProvider` with real async HTTP/SDK execution when `GEMINI_API_KEY` is configured, plus versioned prompts (`backend/app/rag/prompts.py`) and embedding provenance columns (`002` migration).
- Upgrade `InvestigationRepository` filtering (`fuel_type`, `gravity_regime`, `sort_by`), `ComparisonService` quantitative metrics, `RelevanceScorer` measurement completeness indicator, and `ScenarioService` dynamic 6-environment matching.

### P2 — Professional Product Quality & QA
- Implement batch scientific ingestion pipeline (`backend/app/ingestion/pipeline.py` & `backend/scripts/ingest_pdf.py`) with SHA-256 deduplication and failure isolation.
- Add URL query persistence (`useSearchParams`) in Investigation Explorer and CSV/JSON export in Comparison Lab and Scenario Analyzer.
- Expand automated backend (`pytest`) and frontend (`node --test`) test suites, including a fixed RAG evaluation benchmark.
