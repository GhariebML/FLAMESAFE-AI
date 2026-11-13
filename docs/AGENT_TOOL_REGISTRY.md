# FlameSafe AI — Agent Tool Registry & Permissions Matrix

## 1. Least-Privilege Tool Access Governance

Every specialist agent in `backend/app/agents/nodes.py` is restricted to an explicit set of internal service methods. No agent has arbitrary shell execution, unconstrained filesystem write access, or outbound internet access to non-allowlisted domains.

| Agent ID | Allowed Tools / Service Methods | Database Write Scope | Outbound Network Access |
|---|---|---|---|
| **AGENT 01** | `StateGraph.ainvoke`, `_log_agent_step` | `research_requests`, `agent_runs`, `workflow_events`, `agent_checkpoints`, `dataset_approvals` | None |
| **AGENT 02** | `parse_research_intent`, `extract_domain_entities` | State-only (`research_intent`) | None |
| **AGENT 03** | `check_local_investigations`, `check_reusable_datasets` | Read-only (`investigations`, `datasets`, `evidence_chunks`) | None |
| **AGENT 04** | `PSIDiscoveryService.search_investigations`, `PSISourceValidator.validate_source_url` | State-only (`psi_candidates`) | Allowlisted metadata check only |
| **AGENT 05** | `PSIFileManifestService.score_and_select_files` | State-only (`selected_files`, `excluded_files`) | None |
| **AGENT 06** | `PSIDownloadStrategy.acquire_file`, `StorageVaultService.store_raw_asset`, `PSISourceValidator.sanitize_filename` | `acquisition_jobs`, `file_assets`, and `data/vault/raw/` | Allowlisted NASA/DOI HTTPS only |
| **AGENT 07** | `DynamicDatasetEngine.extract_from_database_and_assets` | Read-only (`investigations`, `experimental_runs`, `measurements`, `data/vault/raw/`) | None |
| **AGENT 08** | `DynamicDatasetEngine.map_to_canonical_schema`, `UnitNormalizer.normalize` | State-only (`mapped_records`) | None |
| **AGENT 09** | `DynamicDatasetEngine.validate_canonical_records`, `ScientificValidator` | State-only (`validated_records`, `validation_report`) | None |
| **AGENT 10** | `DynamicDatasetEngine.build_or_reuse_dataset`, `StorageVaultService.store_dataset_exports` | `datasets`, `dataset_versions`, `dataset_items`, `dataset_jobs`, `dataset_validation_reports`, `data/vault/exports/` | None |
| **AGENT 11** | `AIService.answer_query`, `EvidenceRetriever.retrieve`, `ScientificReranker.rerank`, `CitationValidator.build_citations` | State-only (`final_response`, `evidence_citations`) | Configured LLM/Embedding API only |
