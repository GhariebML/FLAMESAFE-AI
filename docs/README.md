# FlameSafe AI Documentation Hub

Welcome to the official English technical documentation for **FlameSafe AI** (*Microgravity Combustion Intelligence*).

## Documentation Directory

### Audit, Validation & Visual Review
- [Repository Audit Report](REPOSITORY_AUDIT.md) — Verified codebase inventory, module mapping, and discrepancy log
- [Documentation Validation Report](REPOSITORY_DOCUMENTATION_VALIDATION.md) — Link, Mermaid, command, and security verification
- [Repository Visual Review](REPOSITORY_VISUAL_REVIEW.md) — Final visual quality review of screenshots, hero assets, and README layout

### Architecture & Diagrams
- [System Architecture](architecture/system-architecture.md) — End-to-end Next.js, FastAPI, LangGraph, RAG, and DB topology
- [Multi-Agent Workflow](architecture/multi-agent-workflow.md) — Canonical 11-agent LangGraph `StateGraph` and HITL gates
- [RAG Pipeline](architecture/rag-pipeline.md) — Embeddings, vector/keyword retrieval, reranking, and citation verification
- [Scientific Data Lifecycle](architecture/data-lifecycle.md) — Ingestion, SI normalization, validation, fingerprinting, and export
- [Database Schema & ERD](architecture/database-schema.md) — SQLAlchemy models and Alembic migration chain
- [Research Workflow](architecture/research-workflow.md) — End-to-end researcher journey across modules
- [Deployment Architecture](architecture/deployment.md) — Vercel, Render, and Docker Compose environments

### Platform Features
- [Mission Control](features/mission-control.md) (`/dashboard`)
- [NASA PSI Investigations Explorer](features/investigations.md) (`/investigations`, `/investigations/[id]`)
- [AI Research Intelligence Lab](features/ai-lab.md) (`/research`)
- [Data Observatory](features/data-observatory.md) (`/compare`)
- [Decision Lab & Gap Intelligence](features/decision-lab.md) (`/scenarios`)
- [Research Insights](features/insights.md) (`/insights`)
- [Evidence & Citation Vault](features/evidence.md) (`/evidence`)
- [Astro-Flame AI Companion](features/astro-flame.md) (`/assistant` & widget)

### API, Development & Governance
- [API Reference](api/README.md) — Verified FastAPI `/api/v1` endpoints
- [Local Setup Guide](development/local-setup.md) — Prerequisites, installation, migrations, and running locally
- [Environment Variables](development/environment-variables.md) — Complete settings reference without secrets
- [Render & Vercel Deployment Guide](deployment/render.md) — Cloud configuration, health checks, CORS, and troubleshooting
- [Scientific Integrity Policy](scientific/scientific-integrity.md) — Null preservation, provenance, and extrapolation boundaries
