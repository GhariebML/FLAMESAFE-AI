# FlameSafe AI — Multi-Agent System Audit & Readiness Assessment

## 1. Executive Summary
This audit evaluates the existing **FlameSafe AI** repository (`feature/multi-agent-system`, branched from `main` / `integration` at `4edd1d9`) prior to building the **Autonomous Multi-Agent Scientific Data Intelligence System** and **Dynamic Dataset Engine**.

---

## 2. Verified Existing Baseline (Reusable Components)

| Subsystem | Verified Status | Reusable Files & Capabilities |
| :--- | :--- | :--- |
| **Database Models (6 Core Tables)** | Verified & Tested | `Investigation`, `ExperimentalRun`, `Measurement`, `ResearchDocument`, `EvidenceChunk`, `DataSource` in `backend/app/models/`. |
| **Seeded NASA Scientific Data** | Verified in SQLite | **5** investigation groups (`BASS`, `SAFFIRE`, `FLEX`, `SAME`, `ACME`), **7** experimental runs, **18** measurements, **5** data sources, **5** research documents, and **8** evidence chunks (`data/seed/seed_investigations.json`, `data/seed/seed_documents.json`). |
| **Scientific Ingestion & Validators** | Verified & Tested | `PDFExtractor` (`%PDF-` + 25 MB bounds check, section detection), `ScientificValidator` (DOI regex & physical range checks), `UnitNormalizer` (`psi`/`atm` $\to$ `kPa`, `m/s` $\to$ `cm/s`), `ScientificIngestionPipeline` (`backend/app/ingestion/pipeline.py`). |
| **RAG & Ranking Engines** | Verified & Tested | `ScientificTextChunker`, `MockEmbeddingProvider` / `GeminiEmbeddingProvider`, `EvidenceRetriever`, `ScientificReranker`, `CitationValidator`, and weighted relevance scorer ($R = 0.30D + 0.25F + 0.20C + 0.15M + 0.10Q$). |
| **Frontend Dual-Theme Application** | Verified & Tested | Next.js 15 App Router with 8 routes (`/`, `/dashboard`, `/investigations`, `/investigations/[id]`, `/compare`, `/insights`, `/scenarios`, `/assistant`, `/evidence`), Dual-Theme engine (**White "Cleanroom Lab"** + **Black "Mission Control"**), and Recharts visualizations. |
| **Installed Python Packages** | Verified | `langgraph`, `langchain_core`, `fastapi`, `sqlalchemy`, `pydantic`, `pandas`, `numpy`, `fitz` (PyMuPDF), `openpyxl`, `httpx` are installed (`pyarrow` is not installed in the local Python 3.14 interpreter; Parquet exports use a deterministic fallback writer or Pandas engine when `pyarrow` is absent). |

---

## 3. Identified Gaps & Missing Subsystems

1. **No Multi-Agent Orchestration Layer (`backend/app/agents/`)**:
   - No `LangGraph` `StateGraph` supervisor, no typed `ResearchWorkflowState`, no structured `ResearchIntent` extraction, and no agent run/event persistence.
2. **Basic PSI Adapter Only (`backend/app/ingestion/sources/psi_adapter.py`)**:
   - Only reads local `seed_investigations.json` without a modular `backend/app/connectors/psi/` package (`client.py`, `discovery.py`, `investigation.py`, `metadata.py`, `file_manifest.py`, `publications.py`, `version_history.py`, `download_strategy.py`, `source_validator.py`) or user-assisted handoff support for restricted/large NASA PSI portal downloads.
3. **No Dynamic Dataset Engine or Registry Tables**:
   - Missing persistent SQLAlchemy models for `ResearchRequest`, `AgentRun`, `AgentCheckpoint`, `WorkflowEvent`, `PSIInvestigationCatalog`, `PSIFileCatalog`, `AcquisitionJob`, `FileAsset`, `DatasetJob`, `Dataset`, `DatasetVersion`, `DatasetItem`, `DatasetValidationReport`, and `DatasetApproval`.
4. **No Object Storage Vault or Multi-Format Exporter**:
   - Missing `RawDataVault` storage abstraction (`local_vault` / `s3_compatible`) and reproducible `CSV` / `JSON` / `Parquet` dataset exporters with embedded provenance manifests.
5. **No Frontend Research Intelligence Workspace (`/research`)**:
   - Missing interactive UI for natural-language research requests, intent preview/revision, real-time 11-agent activity monitor, smart file manifest selection ($F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A$), human-in-the-loop approval gate (`APPROVE`, `REJECT`, `MODIFY_PLAN`, `RESUME_WORKFLOW`), Dataset Explorer, and evidence-grounded research reports.

---

## 4. Security & Scientific Integrity Controls Required
- **Outbound Domain Allowlist & SSRF Protection**: Acquisition service must only allow verified scientific domains (`psi.nasa.gov`, `ntrs.nasa.gov`, `nasa.gov`, `doi.org`, or verified local seed vault assets) and block private/loopback IP ranges (`127.0.0.0/8`, `10.0.0.0/8`, `169.254.0.0/16`, `192.168.0.0/16`).
- **Deterministic Validation & Quarantine**: Records failing unit/range checks must enter `NEEDS_HUMAN_REVIEW` or `REJECTED` without deleting raw source data or coercing `null` to `0`.
- **Evidence Classification**: Every dataset item and finding must carry an explicit classification (`VERIFIED_EXPERIMENTAL_DATA`, `PUBLISHED_FINDING`, `DERIVED_METRIC`, `ANALYTICAL_INFERENCE`, `AI_INTERPRETATION`, `UNVERIFIED`, `UNKNOWN`).

---

## 5. Recommended Implementation Sequence
1. **Database Extension & Migration (`003_multi_agent_dataset_engine.py`)**: Add the 14 new models non-destructively alongside the 6 existing models.
2. **NASA PSI Connector (`backend/app/connectors/psi/`)**: Implement discovery, file catalog manifest, source validation, and download strategy (including user-assisted handoff for non-direct PSI portal files).
3. **Object Storage Vault & Dataset Engine (`backend/app/datasets/`)**: Implement `StorageVault`, `DatasetBuilderService`, versioned snapshots, and `CSV`/`JSON`/`Parquet` exports.
4. **11-Agent Architecture & LangGraph Supervisor (`backend/app/agents/`)**: Implement Agents 01–11 with `StateGraph`, durable DB checkpointing, and human-in-the-loop pause/resume interrupts.
5. **REST API Endpoints (`backend/app/api/v1/endpoints/{research,psi,acquisitions,datasets}.py`)**: Expose all `/research/*`, `/psi/*`, `/acquisitions/*`, and `/datasets/*` endpoints.
6. **Frontend Research Intelligence Workspace (`frontend/app/research/page.tsx`)**: Build the complete end-to-end workspace integrated into the sidebar navigation.
7. **Automated Test Suite & Technical Documentation**: Verify unit, connector, acquisition, dataset, and end-to-end multi-agent workflows via `pytest` and browser verification.
