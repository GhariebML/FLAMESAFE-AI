import json
import os
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ingestion.extractors.pdf_extractor import PDFExtractor
from app.ingestion.parsers.metadata_parser import MetadataParser
from app.ingestion.sources.psi_adapter import PSISourceAdapter, sanitize_filename
from app.ingestion.validators.scientific_validator import ScientificValidator
from app.models.evidence_chunk import EvidenceChunk
from app.models.research_document import ResearchDocument
from scripts.ingest import ingest_manifest, ingest_single_document

SAMPLE_PDF_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "samples", "sample_paper.pdf")
)


def test_sanitize_filename():
    assert sanitize_filename("10.1016/j.proci.2014.05.077") == "10.1016_j.proci.2014.05.077"
    assert sanitize_filename("../../etc/passwd") == "etc_passwd"
    assert sanitize_filename('bad:name*with?chars"<>|') == "bad_name_with_chars"


@pytest.mark.asyncio
async def test_psi_adapter_download_mocked(tmp_path):
    adapter = PSISourceAdapter(raw_data_dir=str(tmp_path))
    dummy_pdf = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.content = dummy_pdf

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_resp

        # 1. First call: downloads and caches
        result = await adapter.fetch_document_content("test_doc_01", source_url="https://example.com/test.pdf")
        assert result == dummy_pdf
        assert os.path.exists(os.path.join(tmp_path, "test_doc_01.pdf"))
        mock_get.assert_called_once()

        # 2. Second call: reuses cache without calling remote network
        mock_get.reset_mock()
        cached_result = await adapter.fetch_document_content("test_doc_01")
        assert cached_result == dummy_pdf
        mock_get.assert_not_called()


@pytest.mark.asyncio
async def test_psi_adapter_invalid_url_and_status(tmp_path):
    adapter = PSISourceAdapter(raw_data_dir=str(tmp_path))

    # Invalid URL scheme
    bad_scheme = await adapter.fetch_document_content("doc_ftp", source_url="ftp://example.com/doc.pdf")
    assert bad_scheme is None

    # HTTP 404 Not Found
    mock_resp = MagicMock()
    mock_resp.status_code = 404
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_resp
        res_404 = await adapter.fetch_document_content("doc_404", source_url="https://example.com/notfound.pdf")
        assert res_404 is None

    # Timeout
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = httpx.TimeoutException("Connection timed out")
        res_timeout = await adapter.fetch_document_content("doc_timeout", source_url="https://example.com/timeout.pdf")
        assert res_timeout is None


@pytest.mark.asyncio
async def test_psi_adapter_non_pdf_content(tmp_path):
    adapter = PSISourceAdapter(raw_data_dir=str(tmp_path))
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.content = b"<html><body>Error: Access Denied</body></html>"

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_resp
        res = await adapter.fetch_document_content("doc_html", source_url="https://example.com/fake.pdf")
        assert res is None
        assert not os.path.exists(os.path.join(tmp_path, "doc_html.pdf"))


def test_pdf_extractor_with_fixture():
    assert os.path.exists(SAMPLE_PDF_PATH), f"Sample PDF fixture missing at {SAMPLE_PDF_PATH}"
    with open(SAMPLE_PDF_PATH, "rb") as f:
        pdf_bytes = f.read()

    extractor = PDFExtractor()

    # 1. Full text extraction
    full_text = extractor.extract_text(pdf_bytes)
    assert "Microgravity combustion research" in full_text
    assert "PMMA in low-speed flows" in full_text

    # 2. Section extraction with page numbers
    sections = extractor.extract_sections(pdf_bytes)
    # Page 1 and Page 2 should be present; empty Page 3 skipped
    assert len(sections) == 2
    assert sections[0]["page_number"] == 1
    assert "Introduction" in (sections[0]["section_name"] or "")
    assert sections[1]["page_number"] == 2
    assert "Results and Discussion" in (sections[1]["section_name"] or "")

    # 3. Chunk extraction
    chunks = extractor.extract_chunks(pdf_bytes, min_chunk_len=50, max_chunk_len=500)
    assert len(chunks) >= 2
    for c in chunks:
        assert c["page_number"] in [1, 2]
        assert len(c["chunk_text"]) > 0


def test_pdf_extractor_corrupt_data():
    extractor = PDFExtractor()
    assert extractor.extract_text(b"corrupted binary data not a pdf") == ""
    assert extractor.extract_sections(b"corrupted binary data not a pdf") == []
    assert extractor.extract_chunks(b"corrupted binary data not a pdf") == []
    assert extractor.extract_text(b"") == ""


def test_metadata_parser_document():
    raw_doc = {
        "id": "doc-test-01",
        "investigation_id": "inv-001",
        "title": "Flame Extinction in Microgravity",
        "document_type": "Journal Article",
        "doi": "10.1016/j.test.2026.01",
        "source_url": "https://doi.org/10.1016/j.test.2026.01",
    }
    parsed = MetadataParser.parse_document_record(raw_doc)
    assert parsed["id"] == "doc-test-01"
    assert parsed["title"] == "Flame Extinction in Microgravity"
    assert parsed["doi"] == "10.1016/j.test.2026.01"


def test_scientific_validator_bounds():
    assert ScientificValidator.validate_doi("10.1016/j.combustflame.2018.04.015") is True
    assert ScientificValidator.validate_doi("invalid-doi-string") is False
    assert ScientificValidator.validate_doi(None) is True

    # Run record validation
    valid_run = {
        "gravity_regime": "Microgravity",
        "oxygen_concentration": 21.0,
        "pressure_value": 101.3,
        "airflow_velocity": 5.0,
    }
    assert len(ScientificValidator.validate_run_record(valid_run)) == 0

    invalid_run = {
        "gravity_regime": "Microgravity",
        "oxygen_concentration": 150.0,
        "pressure_value": -10.0,
        "airflow_velocity": -5.0,
    }
    warnings = ScientificValidator.validate_run_record(invalid_run)
    assert len(warnings) == 3


@pytest.mark.asyncio
async def test_end_to_end_ingestion_pipeline(db_session: AsyncSession):
    assert os.path.exists(SAMPLE_PDF_PATH)

    # Ingest document into BASS investigation using local file
    success = await ingest_single_document(
        session=db_session,
        investigation_id_or_acronym="BASS",
        title="BASS Novel Flame Boundary Study 2026",
        file_path=SAMPLE_PDF_PATH,
        doi="10.1016/j.proci.2026.99.999",
        document_type="Peer-Reviewed Journal Article",
    )
    assert success is True

    # Verify document exists in database
    doc_q = select(ResearchDocument).where(ResearchDocument.title == "BASS Novel Flame Boundary Study 2026")
    doc = (await db_session.execute(doc_q)).scalar_one_or_none()
    assert doc is not None
    assert doc.doi == "10.1016/j.proci.2026.99.999"

    # Verify chunks exist and contain page number, section name, and metadata
    chunk_q = select(EvidenceChunk).where(EvidenceChunk.document_id == doc.id)
    chunks = list((await db_session.execute(chunk_q)).scalars().all())
    assert len(chunks) >= 2
    for c in chunks:
        assert c.page_number in [1, 2]
        assert c.chunk_text is not None
        assert c.metadata_payload.get("doi") == "10.1016/j.proci.2026.99.999"

    # Test idempotency / duplicate prevention
    dup_success = await ingest_single_document(
        session=db_session,
        investigation_id_or_acronym="BASS",
        title="BASS Novel Flame Boundary Study 2026",
        file_path=SAMPLE_PDF_PATH,
        doi="10.1016/j.proci.2026.99.999",
    )
    assert dup_success is True

    # Count of chunks should remain identical
    chunk_count_again = len(list((await db_session.execute(chunk_q)).scalars().all()))
    assert chunk_count_again == len(chunks)


@pytest.mark.asyncio
async def test_single_document_ingestion_through_metadata_parser(db_session: AsyncSession):
    """Verify single-document ingestion normalizes metadata cleanly via MetadataParser."""
    assert os.path.exists(SAMPLE_PDF_PATH)

    # Ingest with trailing whitespace and messy metadata
    success = await ingest_single_document(
        session=db_session,
        investigation_id_or_acronym="SAFFIRE",
        title="  SAFFIRE Microgravity Combustion Analysis   ",
        file_path=SAMPLE_PDF_PATH,
        doi="  10.2514/1.A34167.meta  ",
        document_type="  Technical Report  ",
    )
    assert success is True

    # Check that whitespace was stripped and document_type normalized by MetadataParser
    doc_q = select(ResearchDocument).where(ResearchDocument.doi == "10.2514/1.A34167.meta")
    doc = (await db_session.execute(doc_q)).scalar_one_or_none()
    assert doc is not None
    assert doc.title == "SAFFIRE Microgravity Combustion Analysis"
    assert doc.document_type == "Technical Report"


@pytest.mark.asyncio
async def test_missing_optional_metadata(db_session: AsyncSession):
    """Verify missing optional metadata (DOI, URL) is preserved as None without inventing values."""
    assert os.path.exists(SAMPLE_PDF_PATH)

    success = await ingest_single_document(
        session=db_session,
        investigation_id_or_acronym="FLEX",
        title="FLEX Minimal Metadata Publication",
        file_path=SAMPLE_PDF_PATH,
        doi=None,
        source_url=None,
    )
    assert success is True

    doc_q = select(ResearchDocument).where(ResearchDocument.title == "FLEX Minimal Metadata Publication")
    doc = (await db_session.execute(doc_q)).scalar_one_or_none()
    assert doc is not None
    assert doc.doi is None
    assert doc.source_url is None

    # Chunks should also reflect None in their metadata payload for missing DOI
    chunk_q = select(EvidenceChunk).where(EvidenceChunk.document_id == doc.id)
    chunks = list((await db_session.execute(chunk_q)).scalars().all())
    assert len(chunks) >= 1
    for c in chunks:
        assert c.metadata_payload.get("doi") is None


@pytest.mark.asyncio
async def test_valid_and_invalid_doi_handling(db_session: AsyncSession):
    """Verify valid DOIs are preserved and invalid DOIs are handled safely without crashing."""
    assert os.path.exists(SAMPLE_PDF_PATH)

    # Valid DOI
    ok = await ingest_single_document(
        session=db_session,
        investigation_id_or_acronym="SAME",
        title="SAME Valid DOI Study",
        file_path=SAMPLE_PDF_PATH,
        doi="10.4271/2009-01-2481.v2",
    )
    assert ok is True

    # Invalid DOI: should log warning but not crash or fail ingestion
    ok_inv = await ingest_single_document(
        session=db_session,
        investigation_id_or_acronym="SAME",
        title="SAME Invalid DOI Study",
        file_path=SAMPLE_PDF_PATH,
        doi="not_a_valid_doi_format",
    )
    assert ok_inv is True

    doc_q = select(ResearchDocument).where(ResearchDocument.title == "SAME Invalid DOI Study")
    doc = (await db_session.execute(doc_q)).scalar_one_or_none()
    assert doc is not None
    assert doc.doi == "not_a_valid_doi_format"


@pytest.mark.asyncio
async def test_consistency_single_and_manifest_ingestion(db_session: AsyncSession, tmp_path):
    """Verify that single-document and manifest ingestion yield identical normalized structure."""
    assert os.path.exists(SAMPLE_PDF_PATH)

    # 1. Single document ingestion
    await ingest_single_document(
        session=db_session,
        investigation_id_or_acronym="ACME",
        title="ACME Diffusion Flames Comparison",
        file_path=SAMPLE_PDF_PATH,
        doi="10.1016/j.combustflame.2026.single",
        document_type="Peer-Reviewed Journal Article",
    )

    # 2. Manifest ingestion with identical parameters
    manifest_file = os.path.join(tmp_path, "test_manifest.json")
    with open(manifest_file, "w", encoding="utf-8") as f:  # noqa: ASYNC230
        json.dump(
            [
                {
                    "acronym": "ACME",
                    "title": "ACME Diffusion Flames Comparison Manifest",
                    "file_path": SAMPLE_PDF_PATH,
                    "doi": "10.1016/j.combustflame.2026.manifest",
                    "document_type": "Peer-Reviewed Journal Article",
                }
            ],
            f,
        )

    await ingest_manifest(session=db_session, manifest_path=manifest_file)

    # Check single-ingested doc
    single_doc = (
        await db_session.execute(
            select(ResearchDocument).where(ResearchDocument.doi == "10.1016/j.combustflame.2026.single")
        )
    ).scalar_one()

    # Check manifest-ingested doc
    manifest_doc = (
        await db_session.execute(
            select(ResearchDocument).where(ResearchDocument.doi == "10.1016/j.combustflame.2026.manifest")
        )
    ).scalar_one()

    assert single_doc.document_type == manifest_doc.document_type
    assert single_doc.investigation_id == manifest_doc.investigation_id

    # Check chunk structure
    single_chunks = list(
        (await db_session.execute(select(EvidenceChunk).where(EvidenceChunk.document_id == single_doc.id))).scalars().all()
    )
    manifest_chunks = list(
        (await db_session.execute(select(EvidenceChunk).where(EvidenceChunk.document_id == manifest_doc.id))).scalars().all()
    )

    assert len(single_chunks) == len(manifest_chunks)
    assert single_chunks[0].page_number == manifest_chunks[0].page_number
    assert single_chunks[0].section_name == manifest_chunks[0].section_name

