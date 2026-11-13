# Changelog

All notable changes to the **FlameSafe AI** platform are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-11-13

### Added
- **Repository Architecture**: Monorepo structure separating Next.js frontend, FastAPI backend, shared data, and engineering documentation.
- **Backend Foundation**:
  - FastAPI modular application with versioned API prefix `/api/v1`.
  - Core configuration handling environment variables with Pydantic Settings.
  - SQLAlchemy models for Investigations, Experimental Runs, Measurements, Documents, Evidence Chunks, and Data Sources.
  - Endpoints for `/health`, `/overview`, `/investigations`, `/compare`, `/rank`, `/scenarios/analyze`, `/assistant/query`, and `/sources`.
  - Provider-agnostic AI and RAG architecture with embeddings and citation validation.
  - Scientific relevance ranking engine using weighted scoring criteria.
  - Unit normalization service for combustion parameters (pressure, airflow, oxygen fraction).
- **Frontend Foundation**:
  - Next.js with TypeScript and Tailwind CSS application skeleton.
  - Centralized typed API client (`lib/api/client.ts`).
  - Modular components for Dashboard, Investigation Explorer, Comparison Matrix, Scenario Analyzer, and AI Assistant.
  - Responsive AppShell with navigation sidebar, status bar, and accessible layouts.
- **Data & Seed**:
  - Real NASA Physical Sciences Informatics (PSI) seed records for BASS, SAFFIRE, FLEX, SAME, and ACME.
  - Schema documentation and sample request/response payloads.
- **Documentation**:
  - Comprehensive root `README.md` in English with dedicated Arabic project overview and onboarding.
  - 18 engineering specifications and architectural guides in `docs/`.
  - 6 Mermaid architecture and workflow diagrams.
  - 4 Architecture Decision Records (ADRs).
- **Tooling & CI**:
  - Docker Compose configuration for local multi-container development (Frontend, Backend, PostgreSQL with pgvector).
  - GitHub Actions CI workflow for automated linting and test runs.
  - Setup scripts for Linux/macOS and Windows PowerShell.
