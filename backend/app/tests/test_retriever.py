from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy.exc import ProgrammingError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.evidence_chunk import EvidenceChunk
from app.models.investigation import Investigation
from app.models.research_document import ResearchDocument
from app.rag.retriever import EvidenceRetriever


def test_cosine_similarity_edge_cases():
    """Verify mathematical properties of cosine similarity calculation."""
    # Identical vectors -> 1.0
    assert pytest.approx(EvidenceRetriever._cosine_similarity([1.0, 0.0], [1.0, 0.0])) == 1.0

    # Orthogonal vectors -> 0.0
    assert pytest.approx(EvidenceRetriever._cosine_similarity([1.0, 0.0], [0.0, 1.0])) == 0.0

    # Opposing vectors -> -1.0
    assert pytest.approx(EvidenceRetriever._cosine_similarity([1.0, 0.0], [-1.0, 0.0])) == -1.0

    # Zero vectors -> 0.0
    assert EvidenceRetriever._cosine_similarity([0.0, 0.0], [1.0, 0.0]) == 0.0

    # Mismatched lengths -> 0.0
    assert EvidenceRetriever._cosine_similarity([1.0, 0.0], [1.0, 0.0, 0.0]) == 0.0

    # Empty vectors -> 0.0
    assert EvidenceRetriever._cosine_similarity([], []) == 0.0


@pytest.fixture
def sample_candidate_chunks():
    inv_bass = Investigation(
        id="inv-bass-test",
        psi_id="PSI-BASS",
        acronym="BASS",
        title="Burning and Suppression of Solids",
        research_area="Solid Fuel Flammability",
    )
    doc_bass = ResearchDocument(
        id="doc-bass-test",
        investigation_id="inv-bass-test",
        title="BASS Report",
        investigation=inv_bass,
    )
    chunk_bass_1 = EvidenceChunk(
        id="chunk-1",
        document_id="doc-bass-test",
        chunk_text="Flame extinction was recorded at 0.8 cm/s airflow in microgravity.",
        embedding=[0.1] * 768,
        document=doc_bass,
    )
    chunk_bass_2 = EvidenceChunk(
        id="chunk-2",
        document_id="doc-bass-test",
        chunk_text="Limiting oxygen concentration LOC was 16.2% O2.",
        embedding=[-0.1] * 768,
        document=doc_bass,
    )

    inv_saf = Investigation(
        id="inv-saf-test",
        psi_id="PSI-SAF",
        acronym="SAFFIRE",
        title="Spacecraft Fire Safety Experiment",
        research_area="Large-Scale Fabric Combustion",
    )
    doc_saf = ResearchDocument(
        id="doc-saf-test",
        investigation_id="inv-saf-test",
        title="SAFFIRE Report",
        investigation=inv_saf,
    )
    chunk_saf_1 = EvidenceChunk(
        id="chunk-3",
        document_id="doc-saf-test",
        chunk_text="Large sample burning on Cygnus module combustion experiment demonstrated flame acceleration.",
        embedding=[0.05] * 768,
        document=doc_saf,
    )

    return [chunk_bass_1, chunk_bass_2, chunk_saf_1]


@pytest.mark.asyncio
async def test_retrieve_in_memory_threshold_and_sorting(sample_candidate_chunks):
    """Verify in-memory retrieval sorts by score and filters below threshold."""
    results = await EvidenceRetriever.retrieve_in_memory(
        query="flame extinction airflow",
        candidates=sample_candidate_chunks,
        top_k=2,
        threshold=0.2,
    )

    assert len(results) > 0
    # Top result should contain matching query terms (extinction, airflow)
    top_chunk, top_score = results[0]
    assert "extinction" in top_chunk.chunk_text.lower()
    assert top_score >= 0.2


@pytest.mark.asyncio
async def test_retrieve_in_memory_investigation_filter(sample_candidate_chunks):
    """Verify investigation_id_filter restricts candidates to the specified investigation."""
    results = await EvidenceRetriever.retrieve_in_memory(
        query="combustion experiment",
        candidates=sample_candidate_chunks,
        investigation_id_filter="inv-saf-test",
        top_k=5,
        threshold=0.1,
    )

    assert len(results) > 0
    for chunk, _score in results:
        assert chunk.document.investigation_id == "inv-saf-test"


@pytest.mark.asyncio
async def test_retrieve_in_memory_empty_candidates():
    """Verify in-memory retrieval returns empty list when candidate list is empty."""
    results = await EvidenceRetriever.retrieve_in_memory(
        query="any query",
        candidates=[],
        top_k=5,
    )
    assert results == []


@pytest.mark.asyncio
async def test_retrieve_unified_dispatches_to_sqlite_fallback(db_session: AsyncSession):
    """Verify unified retrieve() dispatches to in-memory cosine fallback on SQLite session."""
    # Seed chunks in SQLite
    inv = Investigation(
        id="inv-sql",
        psi_id="PSI-SQL",
        acronym="SQL",
        title="SQL Investigation",
        research_area="Combustion",
    )
    doc = ResearchDocument(
        id="doc-sql",
        investigation_id="inv-sql",
        title="SQL Doc",
        document_type="Paper",
        investigation=inv,
    )
    chunk = EvidenceChunk(
        id="chunk-sql-1",
        document_id="doc-sql",
        chunk_text="Solid PMMA burn velocity in microgravity airflow.",
        embedding=[0.02] * 768,
        document=doc,
    )
    db_session.add_all([inv, doc, chunk])
    await db_session.commit()

    results = await EvidenceRetriever.retrieve(
        query="PMMA burn velocity",
        candidates=[chunk],
        session=db_session,
        top_k=3,
        threshold=0.1,
    )

    assert len(results) == 1
    assert results[0][0].id == "chunk-sql-1"


@pytest.mark.asyncio
async def test_retrieve_pgvector_mocked_execution():
    """Verify native PostgreSQL pgvector execution constructs expected SQL and parses scores."""
    mock_session = AsyncMock(spec=AsyncSession)

    # Mock SQL execution returning 2 chunk IDs and similarity scores
    mock_rows = [
        ("chunk-pg-1", 0.88),
        ("chunk-pg-2", 0.74),
    ]
    mock_exec_result = MagicMock()
    mock_exec_result.fetchall.return_value = mock_rows

    chunk1 = EvidenceChunk(id="chunk-pg-1", chunk_text="Passage 1 text")
    chunk2 = EvidenceChunk(id="chunk-pg-2", chunk_text="Passage 2 text")

    mock_load_result = MagicMock()
    mock_load_result.scalars.return_value.all.return_value = [chunk1, chunk2]

    # First call is raw pgvector query, second call is loading chunk entities
    mock_session.execute.side_effect = [mock_exec_result, mock_load_result]

    results = await EvidenceRetriever.retrieve_pgvector(
        session=mock_session,
        query="airflow extinction",
        top_k=2,
        threshold=0.5,
    )

    assert len(results) == 2
    assert results[0][0].id == "chunk-pg-1"
    assert results[0][1] >= 0.5
    assert mock_session.execute.call_count == 2


@pytest.mark.asyncio
async def test_retrieve_pgvector_failure_falls_back_to_in_memory():
    """Verify that if pgvector query fails (e.g. extension missing), retriever falls back to in-memory."""
    mock_session = AsyncMock(spec=AsyncSession)
    mock_bind = MagicMock()
    mock_bind.dialect.name = "postgresql"
    mock_session.get_bind.return_value = mock_bind
    mock_session.bind = mock_bind

    # Simulate Postgres error: operator <=> does not exist
    mock_session.execute.side_effect = ProgrammingError("operator does not exist: json <=> vector", params=None, orig=Exception())

    inv = Investigation(id="inv-fb", psi_id="PSI-FB", acronym="FB", title="Fallback Inv")
    doc = ResearchDocument(id="doc-fb", investigation_id="inv-fb", title="Fallback Doc", investigation=inv)
    chunk = EvidenceChunk(
        id="chunk-fb-1",
        document_id="doc-fb",
        chunk_text="Radiative extinction of droplet in nitrogen.",
        embedding=[0.05] * 768,
        document=doc,
    )

    results = await EvidenceRetriever.retrieve(
        query="droplet extinction",
        candidates=[chunk],
        session=mock_session,
        top_k=1,
        threshold=0.1,
    )

    assert len(results) == 1
    assert results[0][0].id == "chunk-fb-1"
