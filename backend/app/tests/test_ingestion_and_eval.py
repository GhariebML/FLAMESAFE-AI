import pytest
from app.ingestion.extractors.pdf_extractor import PDFExtractor, PYMUPDF_AVAILABLE
from app.ingestion.pipeline import ScientificIngestionPipeline


@pytest.mark.asyncio
async def test_sources_catalog_and_filtering(client):
    """Verify /api/v1/sources returns all 5 seeded documents, 8 chunks, and supports filters."""
    res = await client.get("/api/v1/sources")
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["total_sources"] >= 5
    assert data["total_documents"] == 5
    assert data["total_evidence_chunks"] == 8
    assert len(data["evidence_items"]) == 8

    bass_res = await client.get("/api/v1/sources?investigation=BASS")
    assert bass_res.status_code == 200
    bass_items = bass_res.json()["data"]["evidence_items"]
    assert len(bass_items) >= 1
    assert all(item["investigation_acronym"] == "BASS" for item in bass_items)

    soot_res = await client.get("/api/v1/sources?query=soot")
    assert soot_res.status_code == 200
    soot_items = soot_res.json()["data"]["evidence_items"]
    assert any(item["investigation_acronym"] == "ACME" for item in soot_items)


@pytest.mark.asyncio
async def test_investigations_multifacet_filtering_and_sorting(client):
    """Verify fuel_type filtering and title sorting on /api/v1/investigations."""
    res = await client.get("/api/v1/investigations?fuel_type=Solid+Polymer&sort_by=title")
    assert res.status_code == 200
    items = res.json()["data"]["items"]
    assert len(items) >= 1
    for item in items:
        assert any("solid polymer" in f.lower() for f in item["primary_fuel_types"])
        assert len(item["gravity_regimes"]) >= 1
    titles = [item["title"] for item in items]
    assert titles == sorted(titles)


@pytest.mark.asyncio
async def test_ingestion_pipeline_validation_dedup_and_isolation(db_session):
    """Verify PDF validation, invalid DOI rejection, batch isolation, and deduplication."""
    # 1. PDFExtractor byte validation
    assert PDFExtractor.validate_pdf_bytes(b"") is False
    assert PDFExtractor.validate_pdf_bytes(b"not a pdf stream") is False
    assert PDFExtractor.validate_pdf_bytes(b"%PDF-1.7 valid prefix") is True

    pipeline = ScientificIngestionPipeline(db_session)
    bass_id = "e0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c"

    batch_items = [
        {
            "investigation_id": bass_id,
            "title": "Malformed Stream Test",
            "file_bytes": b"corrupt-non-pdf-payload",
        },
        {
            "investigation_id": bass_id,
            "title": "Invalid DOI Test",
            "doi": "invalid-doi-format",
            "file_bytes": b"%PDF-1.4 dummy",
        },
    ]

    if PYMUPDF_AVAILABLE:
        import fitz

        pdf_doc = fitz.open()
        page = pdf_doc.new_page()
        page.insert_text(
            (72, 72),
            "Results\nMicrogravity PMMA flame spread testing at 21% oxygen showed quenching near 0 cm/s.",
        )
        valid_pdf_bytes = pdf_doc.tobytes()
        pdf_doc.close()

        batch_items.append(
            {
                "investigation_id": bass_id,
                "title": "BASS Synthetic Validation Note",
                "doi": "10.1016/j.proci.2026.01.001",
                "file_bytes": valid_pdf_bytes,
            }
        )
        batch_items.append(
            {
                "investigation_id": bass_id,
                "title": "BASS Synthetic Validation Note",
                "doi": "10.1016/j.proci.2026.01.001",
                "file_bytes": valid_pdf_bytes,
            }
        )

    report = await pipeline.ingest_batch(batch_items)
    assert report.failed == 2
    if PYMUPDF_AVAILABLE:
        assert report.succeeded == 1
        assert report.skipped_duplicates == 1
        assert report.total_chunks_persisted >= 1


@pytest.mark.asyncio
async def test_rag_scientific_evaluation_suite(client):
    """Verify domain retrieval, DOI provenance, abstention, and partial-gravity advisories."""
    # 1. BASS quench limit
    bass_q = await client.post(
        "/api/v1/assistant/query",
        json={"query": "What quench blowoff extinction limits were observed for PMMA in BASS?"},
    )
    assert bass_q.status_code == 200
    bass_data = bass_q.json()["data"]
    assert bass_data["has_sufficient_evidence"] is True
    assert bass_data["is_mock_provider"] is True
    assert any(c.get("doi") == "10.1007/s12217-024-10106-y" for c in bass_data["citations"])

    # 2. SAME smoke particulate detection
    same_q = await client.post(
        "/api/v1/assistant/query",
        json={"query": "How do smoke particle morphology and ionization detectors respond in SAME?"},
    )
    assert same_q.status_code == 200
    same_data = same_q.json()["data"]
    assert same_data["has_sufficient_evidence"] is True
    assert any(c.get("doi") == "10.2514/6.2013-3433" for c in same_data["citations"])

    # 3. ACME methane soot and radiative extinction
    acme_q = await client.post(
        "/api/v1/assistant/query",
        json={"query": "How do soot radiation and laminar diffusion flames behave in ACME methane experiments?"},
    )
    assert acme_q.status_code == 200
    acme_data = acme_q.json()["data"]
    assert acme_data["has_sufficient_evidence"] is True
    assert any(c.get("doi") == "10.1016/j.combustflame.2016.02.012" for c in acme_data["citations"])

    # 4. Out-of-domain abstention
    ood_q = await client.post(
        "/api/v1/assistant/query",
        json={"query": "Forecast quarterly cryptocurrency stock prices for next year"},
    )
    assert ood_q.status_code == 200
    ood_data = ood_q.json()["data"]
    assert ood_data["has_sufficient_evidence"] is False
    assert ood_data["citations"] == []

    # 5. Lunar partial-gravity advisory
    lunar_q = await client.post(
        "/api/v1/assistant/query",
        json={"query": "Does BASS solid PMMA flammability data apply to a Lunar habitat?"},
    )
    assert lunar_q.status_code == 200
    lunar_data = lunar_q.json()["data"]
    assert "0.166g" in lunar_data["scientific_uncertainty_note"]


@pytest.mark.asyncio
async def test_scenario_lunar_rover_and_ranking_completeness(client):
    """Verify Lunar Rover extrapolated regime classification and ranking completeness metric."""
    scen_res = await client.post(
        "/api/v1/scenarios/analyze",
        json={
            "environment": "Lunar Rover",
            "fuel_type": "Solid Polymer",
            "oxygen_concentration": 32.0,
            "pressure_value": 56.5,
            "pressure_unit": "kPa",
        },
    )
    assert scen_res.status_code == 200
    scen_data = scen_res.json()["data"]
    statuses = [m["experimental_data_status"] for m in scen_data["condition_matches"]]
    assert "Extrapolated Regime" in statuses
    assert len(scen_data["recommended_research_directions"]) >= 1

    rank_res = await client.post(
        "/api/v1/rank",
        json={"query": "solid polymer flame spread oxygen flammability", "target_environment": "Spacecraft"},
    )
    assert rank_res.status_code == 200
    results = rank_res.json()["data"]["results"]
    assert len(results) >= 1
    assert 0.0 <= results[0]["measurement_completeness"] <= 100.0
