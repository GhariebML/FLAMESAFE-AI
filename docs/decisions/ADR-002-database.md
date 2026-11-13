# ADR-002: PostgreSQL with pgvector for Relational and Semantic Storage

## Status
Accepted

## Date
2026-11-13

## Context
FlameSafe AI processes structured NASA Physical Sciences Informatics (PSI) experimental run metrics (pressure in kPa, airflow in cm/s, oxygen concentrations, sensor types) alongside unstructured scientific literature (peer-reviewed papers, experimental notes, report excerpts).

We required a data layer that:
1. Maintains strict referential integrity between investigations, runs, measurements, and data provenance.
2. Supports fast relational filtering across complex attributes (fuel type, gravity regime, flight facility).
3. Enables high-dimensional vector similarity search for semantic RAG document retrieval without adding external dedicated vector database clusters (e.g. Pinecone, Milvus, Qdrant).
4. Provides a lightweight local fallback for developers and CI testing without Docker overhead.

## Decision
We selected **PostgreSQL 16 with the `pgvector` extension** as the primary datastore:
- Relational tables (`investigations`, `experimental_runs`, `measurements`, `research_documents`, `data_sources`) enforce foreign key integrity and ACID compliance.
- `evidence_chunks` stores document text segments and 768-dimensional embedding vectors indexed with IVFFlat or HNSW via `pgvector`.
- For standalone offline developer testing, local execution automatically supports SQLite via `aiosqlite` with pseudo-embedding cosine scoring.

## Consequences
- **Positive**: Single unified database for relational metadata and vector embeddings; simplified backups, transactions, and container footprint.
- **Negative**: Requires `pgvector` extension in production PostgreSQL container (handled via `pgvector/pgvector:pg16` Docker image).
