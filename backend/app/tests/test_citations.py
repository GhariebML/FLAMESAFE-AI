from app.rag.citations import CitationValidator
from app.models.evidence_chunk import EvidenceChunk
from app.models.research_document import ResearchDocument
from app.models.investigation import Investigation


def test_citation_builder():
    inv = Investigation(
        id="test-inv-01",
        psi_id="PSI-TEST-01",
        acronym="TEST",
        title="Test Investigation",
        research_area="Combustion",
        doi="10.1000/182",
    )
    doc = ResearchDocument(
        id="test-doc-01",
        investigation_id="test-inv-01",
        title="Test Document",
        document_type="Paper",
        doi="10.1000/182",
        investigation=inv,
    )
    chunk = EvidenceChunk(
        id="test-chunk-01",
        document_id="test-doc-01",
        chunk_text="Experimental measurements showed flame extinction at 0.8 cm/s velocity.",
        page_number=4,
        section_name="Extinction Results",
        document=doc,
    )

    citations = CitationValidator.build_citations([(chunk, 0.95)])
    assert len(citations) == 1
    cit = citations[0]
    assert cit.investigation_acronym == "TEST"
    assert cit.psi_id == "PSI-TEST-01"
    assert cit.doi == "10.1000/182"
    assert cit.page_number == 4
    assert cit.verification_status == "Verified Source"
