# FlameSafe AI — Engineering Documentation Index

Welcome to the comprehensive technical documentation for **FlameSafe AI**, an AI-powered scientific intelligence platform developed for the 2026 NASA Space Apps Challenge (Team R²).

---

## Documentation Roadmap

| Document | Purpose & Contents | Primary Audience |
| :--- | :--- | :--- |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Mission background, NASA challenge context, user personas, problem statement, and solution scope. | All Team Members, Judges |
| [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) | High-level system architecture, modular monolith topology, component boundaries, and request lifecycle. | Architects, Lead Engineers |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | Relational schema definitions, pgvector configuration, indexes, relationships, and Alembic migrations. | Developer B, DBAs |
| [API_CONTRACT.md](API_CONTRACT.md) | Definitive OpenAPI v1 specification, request/response schemas, JSON payloads, and HTTP error codes. | Developer A & Developer B |
| [DATA_DICTIONARY.md](DATA_DICTIONARY.md) | Scientific parameter definitions, data types, measurement units, physical bounds, and provenance tracking. | Data Engineers, Researchers |
| [DATA_INGESTION.md](DATA_INGESTION.md) | NASA Physical Sciences Informatics (PSI) ingestion pipeline, extraction, parsing, normalization, and indexing. | Developer B, Ingestion Engineers |
| [SI_ENGINE_AND_RAG.md](SI_ENGINE_AND_RAG.md) | Relevance ranking scoring model, RAG pipeline, embedding abstraction, and verified citation validation. | AI Engineers, Developer B |
| [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md) | Next.js 15 App Router architecture, UI component hierarchy, Tailwind styling tokens, and API client usage. | Developer A |
| [BACKEND_GUIDE.md](BACKEND_GUIDE.md) | FastAPI design, service and repository patterns, dependency injection, and error handling conventions. | Developer B |
| [TEAM_WORKFLOW.md](TEAM_WORKFLOW.md) | Two-developer division of responsibilities, ownership matrix, Git branching strategy, and PR workflow. | Developer A & Developer B |
| [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md) | Actionable sprint tasks, dependencies, priorities, and acceptance criteria for both developers. | Project Leads, Developers |
| [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) | Complete local setup instructions for Windows PowerShell and Linux/macOS, with and without Docker. | All Developers |
| [TESTING_AND_QA.md](TESTING_AND_QA.md) | Automated testing strategy, pytest API tests, frontend unit tests, and GitHub Actions CI pipeline. | QA Engineers, Developers |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Docker Compose containerization, multi-stage builds, environment variables, and health checks. | DevOps, Deployment Engineers |
| [SCIENTIFIC_INTEGRITY.md](SCIENTIFIC_INTEGRITY.md) | Strict principles separating empirical NASA data from AI inferences, null handling, and safety boundaries. | Entire Team, Judges |
| [MVP_ROADMAP.md](MVP_ROADMAP.md) | Phased feature implementation roadmap from Hackathon MVP to advanced planetary fire safety intelligence. | Product Leads |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Step-by-step solutions for common port conflicts, migration locks, environment issues, and API errors. | All Developers |
| [PRODUCT_AND_ENGINEERING_AUDIT.md](PRODUCT_AND_ENGINEERING_AUDIT.md) | Full 12-section repository audit separating verified capabilities from mock/pending subsystems. | Principal Architects, QA |
| [PRODUCT_DESIGN_STRATEGY.md](PRODUCT_DESIGN_STRATEGY.md) | Aerospace visual identity (`#071525`), typography, WCAG 2.2 AA contrast, and IA strategy. | UI/UX Designers, Frontend |
| [PRODUCT_DESIGN_ROADMAP.md](PRODUCT_DESIGN_ROADMAP.md) | Design system rollout milestones and accessibility compliance plan. | Product & Design Leads |
| [FRONTEND_IMPLEMENTATION_PLAN.md](FRONTEND_IMPLEMENTATION_PLAN.md) | Next.js 15 App Router component architecture, `/evidence` page, and Recharts visualizations. | Frontend Engineers |
| [BACKEND_IMPLEMENTATION_PLAN.md](BACKEND_IMPLEMENTATION_PLAN.md) | FastAPI `/sources`, Gemini HTTP providers, Alembic `002_add_embedding_metadata`, and ingestion pipeline. | Backend & AI Engineers |
| [INTEGRATION_ROADMAP.md](INTEGRATION_ROADMAP.md) | Contract synchronization between frontend telemetry views and backend endpoints. | Full-Stack Leads |
| [QUALITY_GATE.md](QUALITY_GATE.md) | Automated verification commands, RAG scientific evaluation cases, and merge readiness checklist. | QA & Release Engineers |
| [MULTI_AGENT_SYSTEM_AUDIT.md](MULTI_AGENT_SYSTEM_AUDIT.md) | Pre-implementation repository audit for the 11-Agent Scientific Data Intelligence expansion. | Principal Architects |
| [MULTI_AGENT_ARCHITECTURE.md](MULTI_AGENT_ARCHITECTURE.md) | 11-Agent LangGraph supervisor topology, state schema, and deterministic vs. AI boundaries. | Multi-Agent Engineers |
| [DATASET_ENGINE.md](DATASET_ENGINE.md) | Dynamic Dataset Engine canonical schema, unit normalization, and deterministic physical validation. | Scientific Data Engineers |
| [PSI_INTEGRATION.md](PSI_INTEGRATION.md) | NASA PSI 11-campaign catalog discovery and file scoring formula $F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A$. | Ingestion & Data Engineers |
| [AGENT_TOOL_REGISTRY.md](AGENT_TOOL_REGISTRY.md) | Least-privilege tool access matrix and database/network scope for Agents 01–11. | Security & AI Architects |
| [AGENT_EVALUATION.md](AGENT_EVALUATION.md) | Multi-agent evaluation metrics across intent accuracy, file selection, data quality, and RAG faithfulness. | AI/ML & QA Engineers |
| [DATASET_VERSIONING.md](DATASET_VERSIONING.md) | SHA-256 content fingerprinting, idempotent version reuse, and CSV/JSON/Parquet snapshot exports. | Data Engineers |
| [RESEARCH_WORKFLOW.md](RESEARCH_WORKFLOW.md) | 17-state autonomous research lifecycle and Human-in-the-Loop approval gate (`AWAITING_APPROVAL`). | Full-Stack Engineers |
| [MULTI_AGENT_IMPLEMENTATION_ROADMAP.md](MULTI_AGENT_IMPLEMENTATION_ROADMAP.md) | Phased engineering milestones and production scaling roadmap for the Multi-Agent Platform. | Engineering Leads |
| [SECURITY_AND_GOVERNANCE.md](SECURITY_AND_GOVERNANCE.md) | Allowlisted domain enforcement, SSRF protection, path sanitization, and human governance gates. | Security Engineers |
| [FRONTEND_RESEARCH_WORKSPACE.md](FRONTEND_RESEARCH_WORKSPACE.md) | Specification for the 8-panel `/research` workspace in Next.js 15 with White/Black dual-theme support. | Frontend Engineers |
| [MULTI_AGENT_TESTING.md](MULTI_AGENT_TESTING.md) | Automated test matrix (`test_multi_agent_system.py`) covering all 11 agents and REST endpoints. | QA Engineers |

---

## Architectural Diagrams

The `docs/diagrams/` directory contains version-controlled Mermaid source files:

- [system_architecture.mmd](diagrams/system_architecture.mmd) — Overall system components, gateway, and service boundaries.
- [database_erd.mmd](diagrams/database_erd.mmd) — Relational and vector entity relationship diagram.
- [data_pipeline.mmd](diagrams/data_pipeline.mmd) — End-to-end NASA PSI data extraction, normalization, and vectorization.
- [rag_pipeline.mmd](diagrams/rag_pipeline.mmd) — Semantic retrieval, reranking, LLM synthesis, and citation verification sequence.
- [scenario_workflow.mmd](diagrams/scenario_workflow.mmd) — Mission scenario evaluation and research gap identification workflow.
- [developer_workflow.mmd](diagrams/developer_workflow.mmd) — Contract-driven collaboration sequence between Developer A and Developer B.

---

## Architecture Decision Records (ADRs)

Key architectural choices and their rationales are recorded in `docs/decisions/`:

- [ADR-001: Modular Monolith Architecture](decisions/ADR-001-architecture.md)
- [ADR-002: PostgreSQL and pgvector Datastore](decisions/ADR-002-database.md)
- [ADR-003: Provider-Agnostic AI & Grounded RAG](decisions/ADR-003-ai-and-rag.md)
- [ADR-004: Two-Developer Contract-Driven Workflow](decisions/ADR-004-team-integration.md)
