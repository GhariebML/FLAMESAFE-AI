from app.models.evidence_chunk import EvidenceChunk
from app.models.investigation import Investigation
from app.models.research_document import ResearchDocument
from app.rag.citations import CitationValidator
from app.schemas.assistant import CitationItem


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


def test_citation_builder_verification_statuses():
    """Verify secondary reference and unverified status logic."""
    # Case: Missing DOI but valid PSI ID -> Secondary Reference
    inv_no_doi = Investigation(
        id="inv-no-doi",
        psi_id="PSI-NOD-01",
        acronym="NOD",
        title="Investigation without DOI",
        research_area="Combustion",
        doi=None,
    )
    doc_no_doi = ResearchDocument(
        id="doc-no-doi",
        investigation_id="inv-no-doi",
        title="Document without DOI",
        document_type="Report",
        doi=None,
        investigation=inv_no_doi,
    )
    chunk_sec = EvidenceChunk(
        id="chunk-sec",
        document_id="doc-no-doi",
        chunk_text="Secondary reference passage.",
        document=doc_no_doi,
    )
    cits_sec = CitationValidator.build_citations([(chunk_sec, 0.7)])
    assert cits_sec[0].verification_status == "Secondary Reference"

    # Case: Missing both DOI and valid PSI ID -> Unverified
    inv_unverified = Investigation(
        id="inv-unv",
        psi_id=None,
        acronym="UNV",
        title="Unverified Inv",
        research_area="Combustion",
        doi=None,
    )
    doc_unverified = ResearchDocument(
        id="doc-unv",
        investigation_id="inv-unv",
        title="Unverified Doc",
        document_type="Report",
        doi=None,
        investigation=inv_unverified,
    )
    chunk_unv = EvidenceChunk(
        id="chunk-unv",
        document_id="doc-unv",
        chunk_text="Unverified passage text.",
        document=doc_unverified,
    )
    cits_unv = CitationValidator.build_citations([(chunk_unv, 0.5)])
    assert cits_unv[0].verification_status == "Unverified"


def test_validate_citations_match_chunks_discards_phantom_citations():
    """Verify that any citation referencing an unretrieved document is discarded."""
    real_chunk = EvidenceChunk(
        id="chunk-real",
        chunk_text="Valid retrieved chunk discussing flame spread in BASS experiment.",
    )
    real_citation = CitationItem(
        citation_id="CIT-001",
        investigation_acronym="BASS",
        psi_id="PSI-BASS-01",
        document_title="BASS Paper",
        doi="10.1016/j.proci.2014.05.077",
        excerpt="Valid retrieved chunk discussing flame spread in BASS experiment.",
        verification_status="Verified Source",
    )
    phantom_citation = CitationItem(
        citation_id="CIT-002",
        investigation_acronym="FABRICATED",
        psi_id="PSI-FAKE-99",
        document_title="Invented Paper on Non-Existent Combustion",
        doi="10.9999/fake.doi",
        excerpt="This is a fabricated excerpt that was never retrieved from the database.",
        verification_status="Verified Source",
    )

    validated = CitationValidator.validate_citations_match_chunks(
        citations=[real_citation, phantom_citation],
        chunks=[real_chunk],
    )

    assert len(validated) == 1
    assert validated[0].citation_id == "CIT-001"
    assert validated[0].investigation_acronym == "BASS"


def test_detect_partial_gravity_query():
    """Verify detection of lunar, Martian, and fractional gravity terminology."""
    assert CitationValidator.is_partial_gravity_query("What happens to flames in lunar gravity?") is True
    assert CitationValidator.is_partial_gravity_query("Flame behavior on Mars habitat") is True
    assert CitationValidator.is_partial_gravity_query("Extinction at 0.166g and 0.38g") is True
    assert CitationValidator.is_partial_gravity_query("Orbital ISS microgravity airflow") is False


def test_detect_out_of_domain_query():
    """Verify out-of-domain detection for queries lacking combustion domain terms."""
    # Query with combustion terms -> NOT out of domain even with low score
    assert CitationValidator.is_out_of_domain_query("PMMA flame quench airflow", top_score=0.2) is False

    # Out-of-domain query with low score -> Out of domain
    assert CitationValidator.is_out_of_domain_query("How to make chocolate cake recipe", top_score=0.2) is True
    assert CitationValidator.is_out_of_domain_query("Capital city of France", top_score=0.1) is True


def test_validate_doi_edge_cases():
    """Verify DOI pattern validation handles valid and invalid DOI forms."""
    assert CitationValidator.is_valid_doi("10.1016/j.proci.2014.05.077") is True
    assert CitationValidator.is_valid_doi("https://doi.org/10.1000/182") is True
    assert CitationValidator.is_valid_doi("http://doi.org/10.1000/182") is True
    assert CitationValidator.is_valid_doi("not-a-doi") is False
    assert CitationValidator.is_valid_doi("10.invalid") is False
    assert CitationValidator.is_valid_doi("") is False
    assert CitationValidator.is_valid_doi(None) is False


def test_classify_source_null_and_malformed_handling():
    """Verify robust 3-tier classification under null, partial, and malformed metadata."""
    # All null -> Unverified
    assert CitationValidator.classify_source(None, None, None, None) == "Unverified"

    # Fallback PSI-UNKNOWN and generic URL -> Unverified
    assert (
        CitationValidator.classify_source(
            doi=None,
            psi_id="PSI-UNKNOWN",
            document_title="NASA Technical Report",
            source_url="https://psi.nasa.gov/physci/repo",
        )
        == "Unverified"
    )

    # Valid DOI with title -> Secondary Reference (even without PSI ID)
    assert (
        CitationValidator.classify_source(
            doi="10.1016/j.combustflame.2020.01.001",
            psi_id="PSI-UNKNOWN",
            document_title="Droplet Combustion Experiment",
            source_url=None,
        )
        == "Secondary Reference"
    )

    # Full authoritative metadata -> Verified Source
    assert (
        CitationValidator.classify_source(
            doi="10.1016/j.proci.2014.05.077",
            psi_id="PSI-BASS-01",
            document_title="BASS Flight Data Summary",
            source_url="https://psi.nasa.gov/investigation/bass",
        )
        == "Verified Source"
    )


def test_validate_citations_match_chunks_chunk_id_mismatch():
    """Verify that a citation with an invalid or tampered chunk_id is discarded even if text is present."""
    real_chunk = EvidenceChunk(
        id="chunk-uuid-111",
        chunk_text="Experimental flame extinction measurements in BASS.",
    )
    tampered_cit = CitationItem(
        citation_id="CIT-001",
        investigation_acronym="BASS",
        psi_id="PSI-BASS-01",
        document_title="BASS Paper",
        excerpt="Experimental flame extinction measurements in BASS.",
        verification_status="Verified Source",
        chunk_id="chunk-uuid-tampered-999",
    )

    validated = CitationValidator.validate_citations_match_chunks(
        citations=[tampered_cit],
        chunks=[real_chunk],
    )
    assert len(validated) == 0


def test_validate_citations_deduplication():
    """Verify that duplicate citations are safely deduplicated."""
    chunk = EvidenceChunk(
        id="chunk-uuid-111",
        chunk_text="Experimental flame extinction measurements in BASS.",
    )
    cit1 = CitationItem(
        citation_id="CIT-001",
        investigation_acronym="BASS",
        psi_id="PSI-BASS-01",
        document_title="BASS Paper",
        excerpt="Experimental flame extinction measurements in BASS.",
        verification_status="Verified Source",
        chunk_id="chunk-uuid-111",
    )
    cit2 = CitationItem(
        citation_id="CIT-001",
        investigation_acronym="BASS",
        psi_id="PSI-BASS-01",
        document_title="BASS Paper",
        excerpt="Experimental flame extinction measurements in BASS.",
        verification_status="Verified Source",
        chunk_id="chunk-uuid-111",
    )

    validated = CitationValidator.validate_citations_match_chunks(
        citations=[cit1, cit2],
        chunks=[chunk],
    )
    assert len(validated) == 1


def test_validate_citations_empty_chunks():
    """Verify handling when retrieved chunks list is empty."""
    cit = CitationItem(
        citation_id="CIT-001",
        investigation_acronym="BASS",
        psi_id="PSI-BASS-01",
        document_title="BASS Paper",
        excerpt="Experimental flame extinction measurements in BASS.",
        verification_status="Verified Source",
    )
    assert CitationValidator.validate_citations_match_chunks([cit], []) == []


def test_sanitize_answer_inline_citations():
    """Verify hallucinated inline citations are removed while valid ones are preserved."""
    valid_cit = CitationItem(
        citation_id="CIT-001",
        investigation_acronym="BASS",
        psi_id="PSI-BASS-01",
        document_title="BASS Paper",
        excerpt="Valid excerpt",
        verification_status="Verified Source",
    )

    raw_answer = (
        "Flame spread slows significantly at lower forced convective flow rates [CIT-001]. "
        "However, some experiments suggest unverified behavior [CIT-999] and [CIT-42]."
    )

    sanitized = CitationValidator.sanitize_answer_inline_citations(raw_answer, [valid_cit])
    assert "[CIT-001]" in sanitized
    assert "[CIT-999]" not in sanitized
    assert "[CIT-42]" not in sanitized
    assert "[Unverified Reference Removed]" in sanitized


def test_partial_gravity_fraction_and_surface_detection():
    """Verify detection of various fractional-gravity and planetary surface phrases."""
    queries_pos = [
        "What is flame spread on lunar surface at 0.166g?",
        "Combustion dynamics at 1/6 g in lunar habitat",
        "Martian surface fire spread at 0.38 g",
        "Fractional gravity fire safety limits",
        "Reduced gravity flame propagation",
    ]
    for q in queries_pos:
        assert CitationValidator.is_partial_gravity_query(q) is True, f"Failed for: {q}"


def test_combustion_domain_terms_comprehensive():
    """Verify combustion domain recognition for various vocabulary words."""
    assert CitationValidator.has_combustion_domain_terms("How can astronauts extinguish a fire in space?") is True
    assert CitationValidator.has_combustion_domain_terms("Spacecraft smoke detection and aerosol monitoring") is True
    assert CitationValidator.has_combustion_domain_terms("What is solid material combustion rate?") is True
    assert CitationValidator.has_combustion_domain_terms("Oxygen concentration effect on polymer flammability") is True
    assert CitationValidator.has_combustion_domain_terms("Chocolate chip cookie recipe") is False
    assert CitationValidator.has_combustion_domain_terms("Stock market trends in 2026") is False
