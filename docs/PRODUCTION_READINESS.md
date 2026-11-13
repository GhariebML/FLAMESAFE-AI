# PRODUCTION READINESS & HONEST CAPABILITY REPORT

## 1. Capability Status Classification (Priority 11)

In accordance with engineering audit standards, every subsystem is classified below using exact evidence categories (`Implemented`, `Verified locally`, `Verified against live source`, `Mock only`, `Incomplete`, `Blocked by external dependency`):

| Subsystem / Requirement | Classification | Verification Evidence |
|---|---|---|
| **Priority 1 — Official NASA PSI Identifiers (`PSI-25`, `PSI-69`, `PSI-98`, `PSI-101`, `PSI-102`, `PSI-159`)** | **Verified against live source** | `discovery.py`, `file_manifest.py`, `seed_investigations.json`, `test_suite_01` |
| **Priority 1 — Unverified Campaign Honesty (`BASS-I`, `FLEX-2`, `SOFIE`, `BRE`)** | **Verified locally** | Explicitly set `source_record_id = None` and `UNVERIFIED_OFFICIAL_PSI_ID` |
| **Priority 1 — Publication DOIs vs Dataset DOIs** | **Verified against live source** | Live Crossref HTTP 200 verification in `backend/data/psi_live_catalog_trace.json` |
| **Priority 2 — Genuine Apache Parquet Export (`pyarrow 26.0.1`)** | **Verified locally** | `PAR1` binary round-trip test (`test_suite_08_real_pyarrow_parquet_round_trip`) |
| **Priority 3 — Live NASA PSI / NTRS / Crossref Smoke Test** | **Verified against live source** | `backend/scripts/psi_live_smoke_test.py` -> `psi_live_catalog_trace.json` |
| **Priority 4 — Download Governance (7 States & 25 MB vs 1 GB Policy)** | **Verified locally** | `download_strategy.py` + `test_suite_04_download_governance_seven_states_and_policy` |
| **Priority 5 — Alembic Migrations (`001` -> `002` -> `003`) & Vector Isolation** | **Verified locally** | `test_suite_02_migration_chain_and_vector_provider_isolation` |
| **Priority 5 — Live PostgreSQL + `pgvector` Daemon Execution** | **Blocked by external dependency** | No PostgreSQL daemon is running on port `5432` on the current Windows host; local runtime uses `sqlite+aiosqlite` |
| **Priority 6 — Gemini 2.5 Flash & Embedding Configuration** | **Implemented / Verified locally in `MOCK_DEMO_MODE`** | `AI_MODEL_NAME="gemini-2.5-flash"`, `EMBEDDING_MODEL_NAME="gemini-embedding-001"`; switches to `LIVE_AI_MODE` when `GEMINI_API_KEY` is provided |
| **Priority 7 — Durable Workflow Resumption & Idempotent Recovery** | **Verified locally** | `test_suite_06_checkpoint_recovery_and_idempotent_resumption` |
| **Priority 8 — Dataset Coverage, 6-Hop Lineage & Version Diff** | **Verified locally** | `quality_and_lineage.py` + `test_suite_07_dataset_coverage_lineage_and_version_diff` |
| **Priority 9 — Pandas/NumPy Analytical Workspace & Unit Guardrails** | **Verified locally** | `analytics.py` + `test_suite_10_pandas_analytical_workspace_and_unit_guard` |
| **Priority 10 — 10 Test Suites & Scientific QA Benchmark** | **Verified locally** | `test_second_stage_validation.py` + `scientific_qa_benchmark.json` |

---

## 2. External Dependencies Required for Cloud Production Deployment

1. **PostgreSQL 16+ with `pgvector` Extension**: Provision a managed PostgreSQL instance with `CREATE EXTENSION IF NOT EXISTS vector;`, set `DATABASE_URL=postgresql+asyncpg://...` and `USE_SQLITE_FALLBACK=false`, and run `alembic upgrade head`.
2. **Google Gemini API Key (`GEMINI_API_KEY`)**: Provide a valid `GEMINI_API_KEY` environment variable and set `AI_PROVIDER=gemini` and `EMBEDDING_PROVIDER=gemini` to transition from `MOCK_DEMO_MODE` to `LIVE_AI_MODE`.
3. **Interactive NASA PSI Portal Bulk Archives**: Raw optical video archives (`>25 MB` or hosted behind the interactive `https://psi.nasa.gov/physci/repo/` SPA session) require researcher-assisted portal download and vault ingestion via the `PORTAL_HANDOFF_REQUIRED` governance workflow.
