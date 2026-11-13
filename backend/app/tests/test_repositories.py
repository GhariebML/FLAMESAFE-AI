import pytest

from app.models.evidence_chunk import EvidenceChunk
from app.repositories.document_repo import DocumentRepository
from app.repositories.investigation_repo import InvestigationRepository
from app.schemas.investigation import InvestigationFilterParams


@pytest.mark.asyncio
async def test_investigation_repo_fuel_type_filtering(db_session):
    """Verify filtering investigations by fuel_type using EXISTS subquery."""
    repo = InvestigationRepository(db_session)

    # 1. Query for PMMA (used in BASS and SAFFIRE)
    filters_pmma = InvestigationFilterParams(fuel_type="PMMA")
    items, total = await repo.list_investigations(filters=filters_pmma)
    assert total >= 1
    acronyms = [inv.acronym for inv in items]
    assert "BASS" in acronyms or "SAFFIRE" in acronyms

    # 2. Query for non-existent fuel
    filters_none = InvestigationFilterParams(fuel_type="UnobtaniumFuel999")
    items_none, total_none = await repo.list_investigations(filters=filters_none)
    assert total_none == 0
    assert len(items_none) == 0

    # 3. Combine research_area and fuel_type
    filters_comb = InvestigationFilterParams(research_area="Solid", fuel_type="PMMA")
    items_comb, total_comb = await repo.list_investigations(filters=filters_comb)
    assert total_comb >= 1
    for inv in items_comb:
        assert "Solid" in (inv.research_area or "")


@pytest.mark.asyncio
async def test_investigation_repo_relationship_eager_loading(db_session):
    """Verify that list_investigations eagerly loads data_sources, runs, and documents."""
    repo = InvestigationRepository(db_session)
    items, total = await repo.list_investigations(limit=5)
    assert total > 0

    for inv in items:
        # These relationship accesses should already be populated in memory
        assert hasattr(inv, "data_sources")
        assert hasattr(inv, "experimental_runs")
        assert hasattr(inv, "research_documents")
        # Ensure data_sources is a loaded list, not a lazy proxy
        assert isinstance(inv.data_sources, list)
        assert isinstance(inv.experimental_runs, list)
        assert isinstance(inv.research_documents, list)


@pytest.mark.asyncio
async def test_investigation_repo_deterministic_pagination(db_session):
    """Verify deterministic ordering by acronym.asc(), id.asc()."""
    repo = InvestigationRepository(db_session)
    page1, _total = await repo.list_investigations(offset=0, limit=2)
    page2, _ = await repo.list_investigations(offset=2, limit=2)

    assert len(page1) == 2
    assert len(page2) == 2
    # Verify no overlap between consecutive deterministic pages
    p1_ids = {inv.id for inv in page1}
    p2_ids = {inv.id for inv in page2}
    assert p1_ids.isdisjoint(p2_ids)

    # Verify alphabetical ordering of acronyms
    all_items, _ = await repo.list_investigations(limit=10)
    acronyms = [inv.acronym for inv in all_items]
    assert acronyms == sorted(acronyms)


@pytest.mark.asyncio
async def test_investigation_repo_get_by_acronym(db_session):
    """Verify acronym lookup case-insensitively with loaded relationships."""
    repo = InvestigationRepository(db_session)

    # Case-insensitive BASS
    inv = await repo.get_by_acronym("bass")
    assert inv is not None
    assert inv.acronym == "BASS"
    assert len(inv.experimental_runs) > 0
    assert len(inv.research_documents) > 0
    assert len(inv.data_sources) > 0

    # Non-existent acronym
    assert await repo.get_by_acronym("NONEXISTENT") is None
    assert await repo.get_by_acronym("") is None


@pytest.mark.asyncio
async def test_document_repo_get_by_doi(db_session):
    """Verify finding a research document by exact DOI with eager-loaded relationships."""
    repo = DocumentRepository(db_session)

    # Valid seeded BASS DOI
    doi = "10.1016/j.proci.2014.05.077"
    doc = await repo.get_by_doi(doi)
    assert doc is not None
    assert doc.doi == doi
    assert doc.investigation is not None
    assert doc.investigation.acronym == "BASS"
    assert len(doc.evidence_chunks) > 0

    # Non-existent DOI
    assert await repo.get_by_doi("10.9999/fake.doi") is None
    assert await repo.get_by_doi("") is None


@pytest.mark.asyncio
async def test_document_repo_get_by_title_and_investigation(db_session):
    """Verify finding a document by title within an investigation."""
    inv_repo = InvestigationRepository(db_session)
    doc_repo = DocumentRepository(db_session)

    bass = await inv_repo.get_by_acronym("BASS")
    assert bass is not None

    seeded_doc = bass.research_documents[0]
    found = await doc_repo.get_by_title_and_investigation(seeded_doc.title, bass.id)
    assert found is not None
    assert found.id == seeded_doc.id
    assert found.investigation.id == bass.id

    # Wrong investigation ID
    assert await doc_repo.get_by_title_and_investigation(seeded_doc.title, "wrong-id") is None


@pytest.mark.asyncio
async def test_document_repo_get_chunks_by_document_id(db_session):
    """Verify retrieving chunks by document_id ordered by page_number."""
    doc_repo = DocumentRepository(db_session)
    doc = await doc_repo.get_by_doi("10.1016/j.proci.2014.05.077")
    assert doc is not None

    chunks = await doc_repo.get_chunks_by_document_id(doc.id)
    assert len(chunks) >= 2
    for c in chunks:
        assert c.document_id == doc.id
        assert c.document is not None
        assert c.document.investigation is not None

    # Verify page order
    page_nums = [c.page_number for c in chunks if c.page_number is not None]
    assert page_nums == sorted(page_nums)


@pytest.mark.asyncio
async def test_document_repo_get_source_with_investigation(db_session):
    """Verify get_source_by_id loads parent investigation."""
    doc_repo = DocumentRepository(db_session)
    inv_repo = InvestigationRepository(db_session)

    bass = await inv_repo.get_by_acronym("BASS")
    assert bass is not None and len(bass.data_sources) > 0
    source_id = bass.data_sources[0].id

    source = await doc_repo.get_source_by_id(source_id)
    assert source is not None
    assert source.investigation is not None
    assert source.investigation.acronym == "BASS"


@pytest.mark.asyncio
async def test_search_similar_chunks_negative_scores_and_threshold(db_session):
    """
    Verify search_similar_chunks mathematical score consistency:
    - Cosine similarity correctly returns negative values for opposite vectors without clamping.
    - Similarity threshold correctly filters out below-threshold vectors.
    """
    repo = DocumentRepository(db_session)

    # Add two chunks with opposing unit vectors
    unit_pos = [1.0] + [0.0] * 767
    unit_neg = [-1.0] + [0.0] * 767

    chunk_pos = EvidenceChunk(
        id="chunk-test-pos",
        document_id="doc-bass-001",
        chunk_text="Positive unit chunk",
        page_number=1,
        section_name="Results",
        embedding=unit_pos,
    )
    chunk_neg = EvidenceChunk(
        id="chunk-test-neg",
        document_id="doc-bass-001",
        chunk_text="Negative unit chunk",
        page_number=2,
        section_name="Discussion",
        embedding=unit_neg,
    )
    db_session.add_all([chunk_pos, chunk_neg])
    await db_session.commit()

    # Query with unit_pos
    results = await repo.search_similar_chunks(query_vector=unit_pos, top_k=5)
    result_dict = {chunk.id: score for chunk, score in results}
    assert "chunk-test-pos" in result_dict
    assert "chunk-test-neg" in result_dict
    # Pos should be 1.0, Neg should be -1.0 (unclamped)
    assert pytest.approx(result_dict["chunk-test-pos"], abs=1e-3) == 1.0
    assert pytest.approx(result_dict["chunk-test-neg"], abs=1e-3) == -1.0

    # Query with threshold = 0.5 (should exclude chunk-test-neg)
    filtered = await repo.search_similar_chunks(
        query_vector=unit_pos, top_k=5, similarity_threshold=0.5
    )
    filtered_ids = [chunk.id for chunk, _ in filtered]
    assert "chunk-test-pos" in filtered_ids
    assert "chunk-test-neg" not in filtered_ids
