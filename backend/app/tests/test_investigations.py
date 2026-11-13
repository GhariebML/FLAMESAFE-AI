import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_investigations(client: AsyncClient):
    response = await client.get("/api/v1/investigations")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["total"] >= 1
    items = data["items"]
    assert any(item["acronym"] == "BASS" for item in items)


@pytest.mark.asyncio
async def test_get_investigation_detail(client: AsyncClient):
    # Fetch list first to obtain valid ID
    list_res = await client.get("/api/v1/investigations")
    first_id = list_res.json()["data"]["items"][0]["id"]

    response = await client.get(f"/api/v1/investigations/{first_id}")
    assert response.status_code == 200
    detail = response.json()["data"]
    assert "experimental_runs" in detail
    assert "research_documents" in detail
    assert "data_sources" in detail
