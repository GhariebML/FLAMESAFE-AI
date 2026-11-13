import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_rank_investigations(client: AsyncClient):
    payload = {
        "query": "solid polymer flammability in low ventilation microgravity",
        "target_environment": "Spacecraft",
        "fuel_category": "Solid Polymer",
    }
    response = await client.post("/api/v1/rank", json=payload)
    assert response.status_code == 200
    res = response.json()["data"]
    assert len(res["results"]) > 0
    top = res["results"][0]
    assert 0 <= top["relevance_score"] <= 100
    assert "factor_breakdown" in top
    assert top["factor_breakdown"]["domain_score"] >= 0
    assert "scientific_disclaimer" in res
