# ADR-001: Modular Monolith Architecture with API-First Integration

## Status
Accepted

## Date
2026-11-13

## Context
FlameSafe AI is an AI-powered scientific research and spacecraft fire safety intelligence platform developed by a two-developer team for the 2026 NASA Space Apps Challenge (Cairo). The system must support scientific data ingestion, exploratory investigation discovery, multi-investigation comparison, weighted relevance ranking, scenario analysis, and evidence-grounded AI assistant capabilities.

We needed an architectural paradigm that satisfies:
1. Fast iteration speed under hackathon timelines.
2. Clear division of responsibilities between Developer A (Frontend) and Developer B (Backend/Data).
3. Elimination of unnecessary network overhead and distributed system failures (e.g., service discovery, distributed transactions, multi-repo sync).
4. Long-term maintainability and path to scale.

## Decision
We adopted a **Modular Monolith** architecture housed in a single monorepo:
- **Frontend**: Next.js 15 (React 19, TypeScript, Tailwind CSS) providing client-side routing, data visualization, and interactive workspaces.
- **Backend**: FastAPI (Python 3.11+, Pydantic v2, SQLAlchemy 2.0) organized into cohesive domain modules (`investigations`, `comparison`, `ranking`, `scenarios`, `assistant`, `ingestion`, `rag`).
- **Integration**: API-First integration using typed OpenAPI/Pydantic contracts versioned under `/api/v1` and consumed by a centralized frontend client (`lib/api/client.ts`).

Microservices were rejected as introducing unjustifiable operational complexity, container orchestration overhead, and high coordination latency for a two-developer project.

## Consequences
- **Positive**: Single repository, straightforward local development via Docker Compose, unified CI pipeline, atomic contract versioning, zero inter-service network latency in backend.
- **Negative**: Requires strict discipline to prevent tight coupling between backend modules (enforced via repository and service abstractions).
