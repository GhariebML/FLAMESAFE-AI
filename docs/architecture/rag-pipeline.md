# RAG Pipeline Architecture

FlameSafe AI's Retrieval-Augmented Generation (RAG) subsystem (`backend/app/rag/`) enforces strict provenance, provider isolation, and abstention when empirical evidence is insufficient.

```mermaid
flowchart LR
    Q["Research Query"] --> EMB["Query Embedding<br/>(Gemini gemini-embedding-2 @ 768d<br/>or deterministic sha256 mock)"]
    EMB --> RET["Hybrid Retriever<br/>(Vector cosine similarity + keyword matching<br/>filtered by embedding_provider)"]
    RET --> RERANK["Evidence Reranker<br/>(backend/app/rag/reranker.py)"]
    RERANK --> CHECK{"Sufficient Evidence<br/>above SIMILARITY_THRESHOLD (0.65)?"}
    CHECK -- "No" --> ABSTAIN["Abstention Protocol<br/>(Explicit insufficient-evidence response)"]
    CHECK -- "Yes" --> CTX["Context Construction<br/>(Chunks + Investigation + DOI + Page metadata)"]
    CTX --> LLM["LLM Generation<br/>(Gemini gemini-3.8-flash<br/>or deterministic grounded synthesizer)"]
    LLM --> CIT["Citation Validator<br/>(backend/app/rag/citations.py)"]
    CIT --> OUT["Verified Answer + Traceable Citations + Telemetry"]
```

## Key Architectural Guarantees

1. **Provider Vector Isolation:** Embeddings store `embedding_provider` and `embedding_dimension` (`768`). Vector queries never mix `gemini` embeddings with deterministic `mock` embeddings (`test_mock_and_gemini_provider_vector_isolation`).
2. **Honest Telemetry:** `GET /api/v1/ai/status` executes a live probe when `GEMINI_API_KEY` is configured and reports `is_mock_provider: true` whenever the deterministic fallback is active.
3. **Citation Verification:** `citations.py` cross-checks cited DOIs and investigation acronyms against retrieved `EvidenceChunk` and `ResearchDocument` records.
