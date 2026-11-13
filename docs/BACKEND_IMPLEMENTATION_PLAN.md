# FlameSafe AI — Backend Implementation Plan (Developer B / Data & AI)

**Owner:** Developer B (Backend, Database, Data Ingestion & AI/RAG)  
**Scope:** Everything under `backend/` and `data/`.

---

## Implemented Tasks

| Task ID | Description | Priority | Status | Files Affected |
| :--- | :--- | :--- | :--- | :--- |
| **BE-01** | Automatic local SQLite fallback when PostgreSQL port 5432 is unreachable; fixed `DocumentRepository.get_chunks_for_investigation` eager loading (`selectinload(ResearchDocument.investigation)`) | P0 | Implemented & Tested | `backend/app/core/database.py`, `backend/app/main.py`, `backend/app/repositories/document_repo.py` |
| **BE-02** | Seed dataset completion (`doc-acme-001` added; 5 investigations, 5 documents, 8 chunks) with SHA-256 `content_hash` and embedding model provenance columns (`002` migration) | P0 | Implemented & Tested | `data/seed/seed_documents.json`, `backend/app/models/evidence_chunk.py`, `backend/migrations/versions/002_add_embedding_metadata.py`, `backend/scripts/seed_data.py` |
| **BE-03** | Multi-facet Investigation filtering (`fuel_type`, `gravity_regime`, `sort_by`) and complete `GET /api/v1/sources` catalog endpoint | P1 | Implemented & Tested | `backend/app/repositories/investigation_repo.py`, `backend/app/api/v1/endpoints/{investigations,sources}.py`, `backend/app/schemas/investigation.py` |
| **BE-04** | Real Google Gemini REST integration (`GeminiEmbeddingProvider`, `GeminiLLMProvider`) with versioned prompts (`prompts.py`) and explicit `is_mock_provider` telemetry | P1 | Implemented (Mock tested; Live Gemini awaits key) | `backend/app/rag/{embeddings,generator,prompts,retriever}.py`, `backend/app/services/ai_service.py`, `backend/app/schemas/assistant.py` |
| **BE-05** | Quantitative `ComparisonService` metrics, `RelevanceScorer` `measurement_completeness` indicator, and dynamic 6-environment `ScenarioService` | P1 | Implemented & Tested | `backend/app/services/{comparison_service,scenario_service}.py`, `backend/app/ranking/scoring.py`, `backend/app/schemas/{comparison,ranking,scenario}.py` |
| **BE-06** | 15-stage batch `ScientificIngestionPipeline` with `%PDF-` / 25MB validation, SHA-256 deduplication, failure isolation, and `scripts/ingest_pdf.py` CLI | P1 | Implemented & Tested | `backend/app/ingestion/extractors/pdf_extractor.py`, `backend/app/ingestion/pipeline.py`, `backend/scripts/ingest_pdf.py` |

## Upcoming Tasks (Next Sprint)

| Task ID | Description | Priority | Dependencies | Acceptance Criteria | Test Requirements |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BE-07** | Native PostgreSQL `pgvector` `<=>` cosine distance query path in `EvidenceRetriever` when running on PostgreSQL | P1 | Docker Postgres `pgvector:pg16` | Queries execute vector similarity inside Postgres while retaining SQLite fallback for CI | Integration test on `pgvector/pgvector:pg16` |
| **BE-08** | Live verification of `GeminiEmbeddingProvider` (`768d`) & `GeminiLLMProvider` with real `GEMINI_API_KEY` | P1 | `GEMINI_API_KEY` | Re-embed seeded chunks with live model and verify citation fidelity on RAG evaluation set | Evaluation benchmark run |
| **BE-09** | Automated `NASA NTRS` / `PSI` HTTP PDF fetcher for additional `SAFFIRE-IV..VI` and `SOFIE` papers | P2 | `BE-06` | CLI downloads open-access PDFs into `data/raw/`, extracts, deduplicates, and reports ingested counts | Offline mocked `httpx` test |
