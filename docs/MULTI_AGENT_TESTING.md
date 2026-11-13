# FlameSafe AI — Multi-Agent Automated Testing & Verification Suite

## 1. Test Suite Overview

The Multi-Agent Scientific Data Intelligence System is verified by `backend/app/tests/test_multi_agent_system.py` alongside the existing backend and frontend test suites.

---

## 2. Multi-Agent Test Cases (`test_multi_agent_system.py`)

| Test Function | Agents / Modules Covered | Verification Assertion |
|---|---|---|
| `test_agent_02_query_understanding` | `AGENT_02` (`MultiAgentNodes.agent_02_query_understanding`) | Verifies extraction of `BASS`, `SAFFIRE`, `PMMA`, `Lunar Partial Gravity (0.166g)`, and `flame_spread_rate`. |
| `test_psi_connector_discovery_and_endpoints` | `AGENT_04`, `PSIDiscoveryService`, `GET /api/v1/psi/*` | Verifies all 11 NASA PSI campaigns are searchable and `/api/v1/psi/investigations/search` returns ranked matches. |
| `test_agent_05_file_selection_formula_and_video_exclusion` | `AGENT_05`, `PSIFileManifestService` | Verifies exact $F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A$ arithmetic, selects tabular JSON seeds, and excludes `PSI-FILE-BASS-VIDEO-RAW` (185 MB zip). |
| `test_agent_06_security_ssrf_and_acquisition_handoff` | `AGENT_06`, `PSISourceValidator`, `POST /api/v1/acquisitions` | Verifies blocking of `http://127.0.0.1:8000`, `https://192.168.1.10`, and `https://malicious.example.com`, path sanitization, SHA-256 hash generation, and `USER_HANDOFF_REQUIRED` status. |
| `test_dataset_engine_validation_and_null_preservation` | `AGENT_08`, `AGENT_09`, `DynamicDatasetEngine` | Verifies `None` values remain `None` (never converted to `0`), valid rows pass, and `oxygen_pct = 145.0` is deterministically `REJECTED`. |
| `test_end_to_end_11_agent_research_workflow_and_exports` | `AGENT_01`–`AGENT_11`, `/api/v1/research/*`, `/api/v1/datasets/*` | Executes full LangGraph workflow to `READY`, verifies `v1.0.0` dataset creation, quality report, analysis endpoint, and `.json`, `.csv`, and `.parquet` exports. |
| `test_human_in_the_loop_approval_and_rejection_workflow` | `AGENT_01`, `DatasetApproval`, `POST /api/v1/research/requests/{id}/approve` | Verifies pausing at `AWAITING_APPROVAL`, resuming to `READY` on `APPROVE`, and transitioning to `CANCELLED` on `REJECT`. |
