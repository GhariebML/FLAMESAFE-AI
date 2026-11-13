import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_assistant_query(client: AsyncClient):
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
    assert "scientific_uncertainty_note" in res
