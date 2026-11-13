# Actionable Task Breakdown & Sprint Plan

## 1. Developer A — Frontend & Product Tasks

### Task FE-01: Core UI Shell & Navigation Layout
- **Owner**: Developer A
- **Priority**: P0 (Blocker for other UI tasks)
- **Status**: Scaffolding Complete / Ready for Refinement
- **Dependencies**: None
- **Acceptance Criteria**:
  - `Navbar`, `Sidebar`, and `Footer` render with responsive mobile drawer/toggle.
  - Active route highlighting works across all 6 modules.
  - Live API status indicator polls `/api/v1/health` and toggles green/red pill.

### Task FE-02: Mission Intelligence Dashboard (Module 1)
- **Owner**: Developer A
- **Priority**: P0
- **Dependencies**: FE-01, BE-01
- **Acceptance Criteria**:
  - Metrics cards display total investigations, runs, measurements, and papers.
  - Domain distribution renders breakdown of NASA PSI combustion areas.
  - Recent sources list verified NASA DOI links.

### Task FE-03: Investigation Explorer & Detail Profile (Module 2)
- **Owner**: Developer A
- **Priority**: P0
- **Dependencies**: FE-01, BE-02
- **Acceptance Criteria**:
  - Search input filters investigations by title, acronym, and keywords.
  - Domain dropdown filters by research area.
  - Detail page (`/investigations/[id]`) renders experimental runs, oxygen, pressure, and sensor suites without coercing missing values to zero.

### Task FE-04: Investigation Comparison Workspace (Module 3)
- **Owner**: Developer A
- **Priority**: P1
- **Dependencies**: FE-03, BE-03
- **Acceptance Criteria**:
  - User can select 2 to 4 investigations via interactive pill selectors.
  - Comparison table highlights parameter deltas (pressure in kPa, airflow in cm/s).
  - Displays scientific comparison limitations banner.

### Task FE-05: Mission Scenario Fire Safety Analyzer (Module 5)
- **Owner**: Developer A
- **Priority**: P1
- **Dependencies**: FE-01, BE-05
- **Acceptance Criteria**:
  - Environment selector cards for Spacecraft, Lunar Habitat, and Mars Habitat.
  - Form allows customizing oxygen concentration, pressure, and ventilation.
  - Renders condition match statuses (`Direct Match`, `Analogous Range`, `Extrapolated`) and research gaps.

### Task FE-06: SI Research Assistant Interface (Module 6)
- **Owner**: Developer A
- **Priority**: P0
- **Dependencies**: FE-01, BE-06
- **Acceptance Criteria**:
  - Chat interface allows submitting research inquiries with auto-scroll.
  - Assistant message renders synthesized answer alongside interactive citation cards.
  - Displays scientific uncertainty note for partial-gravity caveats.

---

## 2. Developer B — Backend, Data & AI Tasks

### Task BE-01: Database Foundation & Seeding Pipeline
- **Owner**: Developer B
- **Priority**: P0 (Blocker for all API services)
- **Status**: Implemented & Tested
- **Dependencies**: None
- **Acceptance Criteria**:
  - PostgreSQL schema and Alembic migrations create all 6 core tables.
  - `scripts.seed_data` loads 5 canonical NASA investigations (BASS, SAFFIRE, FLEX, SAME, ACME).
  - SQLite fallback works for local standalone testing.

### Task BE-02: Investigation Endpoints & Filter Logic
- **Owner**: Developer B
- **Priority**: P0
- **Status**: Implemented & Tested
- **Dependencies**: BE-01
- **Acceptance Criteria**:
  - `GET /api/v1/investigations` supports keyword search, domain filter, and pagination.
  - `GET /api/v1/investigations/{id}` returns complete profile with runs and documents.
  - Returns `404 Not Found` for invalid IDs using `APIErrorResponse`.

### Task BE-03: Multi-Investigation Comparison Engine
- **Owner**: Developer B
- **Priority**: P1
- **Status**: Implemented & Tested
- **Dependencies**: BE-02
- **Acceptance Criteria**:
  - `POST /api/v1/compare` accepts 2 to 5 investigation IDs.
  - Normalizes parameter units (kPa, cm/s) and flags incompatible comparisons.
  - Flags missing experimental metrics as `"Not recorded"`.

### Task BE-04: Scientific Relevance Ranking Formula
- **Owner**: Developer B
- **Priority**: P1
- **Status**: Implemented & Tested
- **Dependencies**: BE-02
- **Acceptance Criteria**:
  - Computes weighted score: $R = 0.30D + 0.25F + 0.20C + 0.15M + 0.10Q$.
  - Generates transparent explainability breakdown for matched and missing factors.
  - Attaches non-fire-risk disclaimer to all responses.

### Task BE-05: Mission Scenario Environmental Analysis
- **Owner**: Developer B
- **Priority**: P1
- **Status**: Implemented & Tested
- **Dependencies**: BE-02
- **Acceptance Criteria**:
  - `POST /api/v1/scenarios/analyze` maps input atmosphere to microgravity analogies.
  - Categorizes condition matches into `Direct Match`, `Analogous Range`, or `Extrapolated`.
  - Attaches partial-gravity advisory (0g does not directly predict lunar/Mars surface buoyancy).

### Task BE-06: RAG Engine & Citation Verification
- **Owner**: Developer B
- **Priority**: P0
- **Status**: Implemented & Tested
- **Dependencies**: BE-01
- **Acceptance Criteria**:
  - Semantic retriever searches chunk embeddings using cosine similarity.
  - Reranker boosts chunks with explicit units and section headers.
  - LLM generator synthesizes response; citation validator constructs verified DOI and page citations.
  - Abstains with explanation if similarity threshold is not met.
