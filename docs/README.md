# FlameSafe AI Documentation Hub

Welcome to the official technical documentation for **FlameSafe AI** (*Microgravity Combustion Intelligence*).

## Documentation Directory

### Audit & Validation
- [Repository Audit Report](REPOSITORY_AUDIT.md) — Verified codebase inventory, module mapping, and discrepancy log
- [Documentation Validation Report](REPOSITORY_DOCUMENTATION_VALIDATION.md) — Link, Mermaid, command, and security verification

### Architecture
- [System Architecture](architecture/system-architecture.md) — End-to-end Next.js, FastAPI, LangGraph, RAG, and DB topology
- [Multi-Agent Workflow](architecture/multi-agent-workflow.md) — Canonical 11-agent LangGraph `StateGraph` and HITL gates
- [RAG Pipeline](architecture/rag-pipeline.md) — Embeddings, vector/keyword retrieval, reranking, and citation verification
- [Scientific Data Lifecycle](architecture/data-lifecycle.md) — Ingestion, SI normalization, validation, fingerprinting, and export
- [Database Schema & ERD](architecture/database-schema.md) — SQLAlchemy models and Alembic migration chain
- [Deployment Architecture](architecture/deployment.md) — Vercel, Render, and Docker Compose environments

### API & Development
- [API Reference](api/README.md) — Verified FastAPI `/api/v1` endpoints
- [Local Setup Guide](development/local-setup.md) — Prerequisites, installation, migrations, and running locally
- [Environment Variables](development/environment-variables.md) — Complete settings reference without secrets

### Deployment & Scientific Governance
- [Render & Vercel Deployment Guide](deployment/render.md) — Cloud configuration, health checks, CORS, and troubleshooting
- [Scientific Integrity Policy](scientific/scientific-integrity.md) — Null preservation, provenance, and extrapolation boundaries
