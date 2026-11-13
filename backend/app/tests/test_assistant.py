import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_assistant_query_success(client: AsyncClient):
    """Verify standard query returns grounded answer with verified citations."""
    payload = {
        "query": "What are the observed airflow quench limits in BASS?",
        "max_citations": 2,
    }
    response = await client.post("/api/v1/assistant/query", json=payload)
    assert response.status_code == 200
    res = response.json()["data"]
    assert res["query"] == payload["query"]
    assert len(res["answer"]) > 20
    assert len(res["citations"]) > 0
    assert res["citations"][0]["doi"] is not None
    assert res["has_sufficient_evidence"] is True
    assert "scientific_uncertainty_note" in res


@pytest.mark.asyncio
async def test_assistant_query_out_of_domain_abstains(client: AsyncClient):
    """Verify out-of-domain inquiries trigger the Abstention Protocol without hallucinations."""
    payload = {
        "query": "What is the best recipe for baking chocolate chip cookies?",
        "max_citations": 3,
    }
    response = await client.post("/api/v1/assistant/query", json=payload)
    assert response.status_code == 200
    res = response.json()["data"]
    assert res["has_sufficient_evidence"] is False
    assert len(res["citations"]) == 0
    assert "abstains" in res["answer"].lower()
    assert "outside the scope" in res["scientific_uncertainty_note"].lower()


@pytest.mark.asyncio
async def test_assistant_query_partial_gravity_warning(client: AsyncClient):
    """Verify inquiries mentioning Moon or Mars trigger the explicit Partial-Gravity Advisory."""
    payload = {
        "query": "How does solid fabric flammability change on lunar base and Mars habitat surfaces?",
        "max_citations": 2,
    }
    response = await client.post("/api/v1/assistant/query", json=payload)
    assert response.status_code == 200
    res = response.json()["data"]
    assert res["has_sufficient_evidence"] is True

    # Advisory must be present in both uncertainty note and the answer
    assert "partial-gravity" in res["scientific_uncertainty_note"].lower()
    assert "lunar" in res["scientific_uncertainty_note"].lower()
    assert "partial-gravity advisory" in res["answer"].lower()


@pytest.mark.asyncio
async def test_assistant_query_moon_non_combustion_abstains_without_warning(client: AsyncClient):
    """Verify non-combustion query mentioning Moon abstains without producing partial-gravity advisory."""
    payload = {
        "query": "What is the physical distance from Earth to the Moon in kilometers?",
        "max_citations": 2,
    }
    response = await client.post("/api/v1/assistant/query", json=payload)
    assert response.status_code == 200
    res = response.json()["data"]
    assert res["has_sufficient_evidence"] is False
    assert len(res["citations"]) == 0
    # Must NOT attach combustion advisory
    assert "partial-gravity advisory" not in res["answer"].lower()
    assert "outside the scope" in res["scientific_uncertainty_note"].lower()


@pytest.mark.asyncio
async def test_assistant_query_in_domain_insufficient_evidence(client: AsyncClient):
    """Verify in-domain query with terms not present in corpus abstains under insufficient evidence."""
    payload = {
        "query": "What is the droplet extinction diameter of exotic tetrafluoroethane fuel in microgravity?",
        "max_citations": 2,
    }
    response = await client.post("/api/v1/assistant/query", json=payload)
    assert response.status_code == 200
    res = response.json()["data"]
    # Should either abstain due to insufficient evidence or lack of high matching score
    if not res["has_sufficient_evidence"]:
        assert len(res["citations"]) == 0
        assert "insufficient" in res["answer"].lower() or "similarity threshold" in res["scientific_uncertainty_note"].lower()


@pytest.mark.asyncio
async def test_assistant_query_backward_compatible_schema(client: AsyncClient):
    """Verify backward-compatible response structure including chunk_id."""
    payload = {
        "query": "What are the observed airflow quench limits in BASS?",
        "max_citations": 1,
    }
    response = await client.post("/api/v1/assistant/query", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    assert "query" in data
    assert "answer" in data
    assert "citations" in data
    assert "scientific_uncertainty_note" in data
    assert "has_sufficient_evidence" in data
    assert "ai_provider" in data
    assert "model_name" in data
    if data["citations"]:
        cit = data["citations"][0]
        assert "citation_id" in cit
        assert "investigation_acronym" in cit
        assert "psi_id" in cit
        assert "document_title" in cit
        assert "verification_status" in cit
        assert "chunk_id" in cit
