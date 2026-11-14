# System Architecture

FlameSafe AI uses a decoupled, contract-driven monorepo architecture separating the **Next.js 15 App Router** frontend from the **FastAPI + LangGraph** scientific backend.

```mermaid
flowchart TB
    subgraph Client["Frontend Layer (Next.js 15 · Vercel)"]
        UI["App Router Pages (/, /dashboard, /investigations, /research, /compare, /scenarios, /insights, /evidence, /assistant)"]
        API_CLIENT["Unified API Client (frontend/lib/api/client.ts)"]
        FALLBACK["Edge/Serverless Fallback (/api/v1/[...slug])"]
        UI --> API_CLIENT
        API_CLIENT -. "Cold-start / offline fallback" .-> FALLBACK
    end

    subgraph Backend["Backend API Layer (FastAPI · Render / Docker)"]
        GW["FastAPI + GZipMiddleware + CORSMiddleware (/api/v1)"]
        ROUTERS["13 API Routers (health, ai, overview, investigations, compare, rank, scenarios, assistant, sources, research, psi, acquisitions, datasets)"]
        SERVICES["Domain Services (Comparison, Ranking, Scenario, Investigation, AI)"]
        GW --> ROUTERS --> SERVICES
    end

    subgraph Intelligence["Multi-Agent & RAG Layer"]
        LG["AGENT 01: ChiefIntelligenceOrchestrator (LangGraph StateGraph)"]
        AGENTS["Agents 02–11 (Query, Reuse, PSI Discovery, File Selection, Acquisition, Extraction, Schema Mapping, Validation, Dataset Builder, Research Intelligence)"]
        RAG["RAG Pipeline (Chunker -> Embeddings -> PGVector/Cosine Retriever -> Reranker -> Citation Guard)"]
        LG --> AGENTS
        AGENTS --> RAG
    end

    subgraph Data["Persistence & External Sources"]
        DB[("PostgreSQL 16 + pgvector / SQLite Fallback")]
        VAULT["SHA-256 Storage Vault & Parquet/CSV/JSON Exports"]
        PSI["NASA PSI & NTRS Public Archives"]
        GEMINI["Google Gemini API (gemini-3.8-flash & gemini-embedding-2)"]
    end

    API_CLIENT -->|"HTTPS / JSON"| GW
    SERVICES --> DB
    LG --> DB
    AGENTS --> VAULT
    AGENTS -->|"Allowlisted HTTPS + SSRF Guard"| PSI
    RAG -->|"google-genai SDK"| GEMINI
    RAG -. "Fallback when key absent" .-> MOCK["Deterministic Grounded Mock Provider"]
```

## Layer Responsibilities

| Layer | Implementation Path | Verified Responsibility |
| :--- | :--- | :--- |
| **Frontend UI** | `frontend/app/`, `frontend/components/` | 10 interactive routes, Three.js 3D hero, Recharts visualizations, Astro-Flame companion |
| **API Client** | `frontend/lib/api/client.ts` | 60s GET caching, 4.5s cold-start timeout + background `/health` warmup, fallback to `/api/v1/[...slug]` |
| **API Gateway** | `backend/app/main.py`, `backend/app/api/v1/` | FastAPI v0.2.0, `GZipMiddleware`, `CORSMiddleware`, standardized `APIResponseEnvelope` |
| **Orchestration** | `backend/app/agents/orchestrator/supervisor.py` | LangGraph `StateGraph` coordinating Agents 02–11 with SQLAlchemy `AgentCheckpoint` persistence |
| **Scientific Data** | `backend/app/datasets/`, `backend/app/ingestion/` | SI unit normalization, deterministic bounds validation, SHA-256 vault, Parquet/CSV/JSON export |
| **RAG Engine** | `backend/app/rag/` | Bilingual chunking, 768-dim Gemini or deterministic mock embeddings, vector + keyword retrieval, citation verification |
