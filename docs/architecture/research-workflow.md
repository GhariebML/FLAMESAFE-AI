# End-to-End Research Workflow

This diagram illustrates the full researcher journey across FlameSafe AI—from exploring indexed NASA PSI campaigns to running the 11-agent LangGraph research pipeline and exporting validated datasets.

```mermaid
flowchart LR
    U["Researcher"] --> EXP["1. Explore Catalog<br/>(/investigations & /investigations/[id])"]
    EXP --> CMP["2. Compare Regimes<br/>(/compare: 2–4 studies, 1g vs 0g vs 0.16g)"]
    CMP --> LAB["3. Launch AI Lab Request<br/>(/research -> POST /api/v1/research/requests)"]
    LAB --> ORCH["4. LangGraph Pipeline<br/>(AGENT_01–11 + optional HITL approval)"]
    ORCH --> DS["5. Inspect & Export Dataset<br/>(Quality, Lineage, Pandas Analytics, Parquet/CSV/JSON)"]
    LAB --> RAG["6. Verify Evidence & Gaps<br/>(/evidence, /scenarios, /assistant)"]
```
