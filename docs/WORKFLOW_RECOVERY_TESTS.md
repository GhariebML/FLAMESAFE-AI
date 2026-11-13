# DURABLE WORKFLOW RESUMPTION & CHECKPOINT RECOVERY TESTS

## 1. Durable Checkpoint Architecture (Priority 7)

Implemented in `backend/app/agents/orchestrator/supervisor.py` (`ChiefIntelligenceOrchestrator`) and `backend/app/agents/nodes.py` (`MultiAgentNodes`):

- Every completed agent step (`AGENT_02` through `AGENT_11`) commits:
  1. An `AgentRun` audit record (`agent_runs` table).
  2. A `WorkflowEvent` state transition record (`workflow_events` table).
  3. A durable `AgentCheckpoint` snapshot (`agent_checkpoints` table) containing the full serializable `ResearchWorkflowState` (`research_intent`, `coverage_status`, `psi_candidates`, `selected_files`, `acquisition_jobs`, `acquired_assets`, `extracted_records`, `warnings`, `errors`).

---

## 2. Idempotent Resumption Across Backend Restarts

When a paused workflow (`AWAITING_APPROVAL`) is resumed via `POST /api/v1/research/requests/{request_id}/approve` or `ChiefIntelligenceOrchestrator.approve_and_resume`:

1. **State Recovery from `AgentCheckpoint`**: Loads the latest `AgentCheckpoint` row ordered by `checkpoint_version DESC` for `request_id` and merges it with `ResearchRequest`.
2. **Idempotent File Acquisition (`agent_06_file_acquisition`)**: Before downloading any file in `selected_files`, queries `acquisition_jobs` and `file_assets` for `(request_id, file_identifier)` where `status IN ('DOWNLOAD_COMPLETED', 'DOWNLOADED')`. If already completed, reuses the existing vault asset (`reused_from_checkpoint = True`) without repeating the download.
3. **Idempotent Extraction (`agent_07_scientific_extraction`)**: If `extracted_records` is already populated in the restored checkpoint state, skips re-extraction and advances directly to `MAPPING_SCHEMA`.

---

## 3. Automated 9-Step Recovery Verification

Tested in `backend/app/tests/test_second_stage_validation.py::test_suite_06_checkpoint_recovery_and_idempotent_resumption`:

1. Submit research request with `require_approval=True`.
2. Execute Agents 02, 03, 04, and 05.
3. Pause at `AWAITING_APPROVAL` and verify `AgentCheckpoint` (`04_AGENT_05`) is committed to the database.
4. Simulate backend restart by instantiating a brand-new `ChiefIntelligenceOrchestrator` instance.
5. Approve file plan and resume execution from persisted `AgentCheckpoint`.
6. Complete acquisition (`AGENT_06`), extraction (`AGENT_07`), mapping (`AGENT_08`), validation (`AGENT_09`), dataset build (`AGENT_10`), and synthesis (`AGENT_11`).
7. Re-invoke `agent_06_file_acquisition` on the same `request_id` and verify all jobs report `reused_from_checkpoint == True` (zero duplicate downloads).
