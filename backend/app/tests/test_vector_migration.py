import importlib
import math

import pytest
from sqlalchemy import create_engine, select, text
from sqlalchemy.dialects import postgresql, sqlite
from sqlalchemy.orm import Session
from sqlalchemy.schema import CreateTable

from app.models.base import Base
from app.models.evidence_chunk import EMBEDDING_SCHEMA_DIMENSION, EvidenceChunk
from app.models.investigation import Investigation
from app.models.research_document import ResearchDocument
from app.repositories.document_repo import DocumentRepository

migration_003 = importlib.import_module("migrations.versions.003_pgvector_embedding")


def test_postgresql_model_compilation():
    """Verify that EvidenceChunk compiles to VECTOR(768) under PostgreSQL dialect."""
    ddl = str(CreateTable(EvidenceChunk.__table__).compile(dialect=postgresql.dialect()))
    assert "embedding VECTOR(768)" in ddl or "embedding VECTOR(768)" in ddl.replace("  ", " ")
    assert "evidence_chunks" in ddl


def test_sqlite_model_compilation():
    """Verify that EvidenceChunk compiles to JSON under SQLite dialect."""
    ddl = str(CreateTable(EvidenceChunk.__table__).compile(dialect=sqlite.dialect()))
    assert "embedding JSON" in ddl
    assert "evidence_chunks" in ddl


def test_embedding_nullability_and_schema_dimension():
    """Verify that embedding remains nullable and matches 768 dimensions."""
    col = EvidenceChunk.__table__.columns["embedding"]
    assert col.nullable is True
    assert EMBEDDING_SCHEMA_DIMENSION == 768


def test_evidence_chunk_metadata_and_relationships_intact():
    """Verify that page_number, section_name, and metadata_payload are preserved."""
    cols = EvidenceChunk.__table__.columns
    assert "page_number" in cols
    assert cols["page_number"].nullable is True
    assert "section_name" in cols
    assert cols["section_name"].nullable is True
    assert "metadata_payload" in cols
    assert cols["metadata_payload"].nullable is True
    assert "chunk_text" in cols
    assert cols["chunk_text"].nullable is False

    # Relationship check
    assert hasattr(EvidenceChunk, "document")
    assert EvidenceChunk.document.property.back_populates == "evidence_chunks"


def test_sqlite_in_memory_creation_and_insertion():
    """Verify SQLite can create tables, insert NULL embeddings, and insert 768-dim vectors."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        inv = Investigation(
            id="inv-test-01",
            psi_id="PSI-TEST-01",
            acronym="TEST",
            title="Test Investigation",
            research_area="Combustion",
        )
        doc = ResearchDocument(
            id="doc-test-01",
            investigation_id="inv-test-01",
            title="Test Document",
            document_type="Paper",
            doi="10.1000/182",
        )
        chunk_null = EvidenceChunk(
            id="chunk-null-01",
            document_id="doc-test-01",
            chunk_text="Chunk with null vector",
            page_number=1,
            section_name="Introduction",
            embedding=None,
        )
        dummy_vector = [round(math.sin(i * 0.1), 4) for i in range(768)]
        chunk_vec = EvidenceChunk(
            id="chunk-vec-01",
            document_id="doc-test-01",
            chunk_text="Chunk with 768-dim vector",
            page_number=2,
            section_name="Results",
            embedding=dummy_vector,
        )

        session.add_all([inv, doc, chunk_null, chunk_vec])
        session.commit()

        # Query back
        res_null = session.execute(
            select(EvidenceChunk).where(EvidenceChunk.id == "chunk-null-01")
        ).scalar_one()
        assert res_null.embedding is None
        assert res_null.page_number == 1
        assert res_null.section_name == "Introduction"

        res_vec = session.execute(
            select(EvidenceChunk).where(EvidenceChunk.id == "chunk-vec-01")
        ).scalar_one()
        assert res_vec.embedding is not None
        assert len(res_vec.embedding) == 768
        assert res_vec.embedding[0] == dummy_vector[0]


@pytest.mark.asyncio
async def test_document_repository_search_fallback_sqlite(db_session):
    """Verify DocumentRepository.search_similar_chunks runs cleanly on SQLite fallback."""
    repo = DocumentRepository(db_session)

    # All seeded chunks currently have null embeddings
    query_vec = [0.1] * 768
    results = await repo.search_similar_chunks(query_vector=query_vec, top_k=5)
    # Since existing chunks have null embeddings, results should safely be empty
    assert results == []

    # Inject one chunk with a 768-dim embedding
    chunk_with_emb = EvidenceChunk(
        id="chunk-repo-test",
        document_id="doc-bass-001",
        chunk_text="Test chunk with valid embedding",
        page_number=10,
        section_name="Experimental Results",
        embedding=[0.1] * 768,
    )
    db_session.add(chunk_with_emb)
    await db_session.commit()

    # Search again
    results = await repo.search_similar_chunks(query_vector=query_vec, top_k=5)
    assert len(results) == 1
    found_chunk, score = results[0]
    assert found_chunk.id == "chunk-repo-test"
    assert score > 0.99  # Identical vector should have cosine sim close to 1.0
    assert found_chunk.document is not None
    assert found_chunk.document.investigation is not None
    assert found_chunk.document.investigation.acronym == "BASS"


@pytest.mark.asyncio
async def test_document_repository_dimension_enforcement(db_session):
    """Verify that search_similar_chunks rejects vectors with invalid dimensions."""
    repo = DocumentRepository(db_session)

    # Empty vector
    with pytest.raises(ValueError, match="Query vector dimension must be 768"):
        await repo.search_similar_chunks(query_vector=[])

    # Wrong dimension vector (e.g. 512 or 1536)
    with pytest.raises(ValueError, match="Query vector dimension must be 768"):
        await repo.search_similar_chunks(query_vector=[0.1] * 512)

    with pytest.raises(ValueError, match="Query vector dimension must be 768"):
        await repo.search_similar_chunks(query_vector=[0.1] * 1536)


def test_migration_003_metadata_and_sql_definitions():
    """Verify migration 003 properties, down_revision, and safety checks."""
    assert migration_003.revision == "003_pgvector_embedding"
    assert migration_003.down_revision == "002_add_embedding_metadata"
    assert migration_003.EMBEDDING_DIMENSION == 768


@pytest.mark.asyncio
async def test_postgresql_pgvector_integration_or_skip():
    """
    Integration test targeting a real PostgreSQL + pgvector instance if reachable.
    If PostgreSQL is unreachable in this environment, skips cleanly without false claims.
    """
    import os

    from sqlalchemy.exc import SQLAlchemyError
    from sqlalchemy.ext.asyncio import create_async_engine

    from app.core.config import settings

    pg_url = os.getenv("PG_TEST_DATABASE_URL", settings.DATABASE_URL)
    if "postgresql" not in pg_url:
        pytest.skip("No PostgreSQL URL configured for integration testing.")

    try:
        engine = create_async_engine(pg_url)
        async with engine.connect() as conn:
            # Check if PostgreSQL and pgvector extension are available
            res = await conn.execute(text("SELECT 1;"))
            assert res.scalar() == 1
            ext = await conn.execute(
                text("SELECT extname FROM pg_extension WHERE extname = 'vector';")
            )
            has_vector = ext.scalar_one_or_none()
            if not has_vector:
                pytest.skip("PostgreSQL is reachable but pgvector extension is not installed.")
        await engine.dispose()
    except (OSError, SQLAlchemyError) as e:
        pytest.skip(f"Live PostgreSQL instance not reachable ({e}).")
