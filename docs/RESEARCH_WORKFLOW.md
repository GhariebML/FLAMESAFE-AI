# FlameSafe AI — End-to-End Autonomous Research Workflow

## 1. Workflow State Machine (17 Lifecycle States)

The Chief Intelligence Orchestrator (`AGENT_01`) manages the following explicit lifecycle states on `ResearchRequest.status`:

1. `RECEIVED`: User submits natural-language research question.
2. `PARSING_INTENT`: Agent 02 decomposes domain, fuel, gravity regime, campaigns, and variables.
3. `CHECKING_EXISTING_DATA`: Agent 03 audits local DB investigations, chunks, and existing datasets.
4. `DISCOVERING_PSI`: Agent 04 searches the 11-campaign NASA PSI catalog.
5. `SELECTING_FILES`: Agent 05 scores candidate files using $F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A$.
6. `AWAITING_APPROVAL`: Workflow pauses when `require_approval = True` and persists a `DatasetApproval` record.
7. `APPROVED` / `REJECTED` / `CANCELLED`: Researcher decision via `POST /api/v1/research/requests/{id}/approve`.
8. `ACQUIRING_FILES`: Agent 06 validates URLs, blocks SSRF, and stores raw assets in the SHA-256 vault.
9. `EXTRACTING_DATA`: Agent 07 extracts structured runs and measurements.
10. `MAPPING_SCHEMA`: Agent 08 maps rows into canonical FlameSafe schema and normalizes units.
11. `VALIDATING_DATA`: Agent 09 runs deterministic physical bounds and null-preservation checks.
12. `BUILDING_DATASET`: Agent 10 fingerprints, versions, and exports `JSON`, `CSV`, and `Parquet` snapshots.
13. `GENERATING_INSIGHTS`: Agent 11 executes RAG retrieval, reranking, and citation-grounded synthesis.
14. `READY`: Workflow complete; dataset and report available in `/research`.
15. `FAILED`: Captures structured error category and preserves latest `AgentCheckpoint` for resume.
