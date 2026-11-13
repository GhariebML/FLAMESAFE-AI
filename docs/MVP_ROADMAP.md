# Product Development & MVP Roadmap — FlameSafe AI

## 1. Phased Development Strategy
FlameSafe AI is engineered along a phased delivery path designed to balance rapid delivery for the 2026 NASA Space Apps Challenge with a long-term vision for aerospace fire safety intelligence.

---

## 2. Phase 1 — Hackathon MVP Foundation (Current Phase)
**Goal:** Establish a working, robust, implementation-ready platform with authentic NASA combustion records.

### Deliverables:
- [x] Monorepo architecture separating Next.js 15 frontend and FastAPI backend.
- [x] Canonical seed dataset containing 5 NASA flight programs (BASS, SAFFIRE, FLEX, SAME, ACME).
- [x] PostgreSQL schema with pgvector support and SQLite fallback.
- [x] Core REST API v1 (`/health`, `/overview`, `/investigations`, `/compare`, `/rank`, `/scenarios/analyze`, `/assistant/query`).
- [x] Module 1: Mission Intelligence Dashboard with live database metrics.
- [x] Module 2: Investigation Explorer with multi-field search and detail pages.
- [x] Module 3: Investigation Comparison Workspace with unit standardization.
- [x] Module 4: Scientific Relevance Ranking based on weighted 5-factor scoring.
- [x] Module 5: Mission Scenario Analyzer covering Spacecraft, Lunar, and Mars regimes.
- [x] Module 6: SI Assistant with grounded RAG and authentic DOI citations.
- [x] Docker Compose stack and GitHub Actions CI automation.

---

## 3. Phase 2 — Post-Hackathon Enhancement (Q1 2027)
**Goal:** Expand automated data ingestion and advanced physical kinetics modeling.

### Objectives:
- **Live NASA PSI Web Ingestion**: Automated crawler for open datasets on `psi.nasa.gov`.
- **Advanced Partial-Gravity Kinetic Models**: Analytical scaling models incorporating Froude and Grashof numbers to simulate partial-gravity transition regimes ($0.05\text{ g} - 0.5\text{ g}$).
- **Video Telemetry Browser**: Synchronized playback of NASA high-speed flame video feeds alongside radiometer and thermocouple sensor traces.
- **Multi-Document Comparison Export**: One-click generation of PDF technical comparison briefs for aerospace safety review boards.

---

## 4. Phase 3 — Enterprise Aerospace Integration (Q3 2027)
**Goal:** Transition into a mission-grade decision support platform for exploration architectures (Artemis Lunar Base, Mars Transit Vehicles).

### Objectives:
- **ECLSS Emergency Ventilation Coupling**: Integration with Environmental Control and Life Support System (ECLSS) simulation tools to model cabin depressurization and emergency flame suppression.
- **Automated Flammability Screening Assessor**: Pre-flight material flammability hazard index tool comparing terrestrial NASA-STD-6001 Test 1 results with low-ventilation microgravity quench boundaries.
- **Federated Planetary Habitat Network**: Real-time sensor telemetry ingestion from lunar and Martian test bed facilities.
