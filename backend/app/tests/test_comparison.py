import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_compare_investigations(client: AsyncClient):
    list_res = await client.get("/api/v1/investigations")
    items = list_res.json()["data"]["items"]
    assert len(items) >= 2
    id1 = items[0]["id"]
    id2 = items[1]["id"]

    payload = {"investigation_ids": [id1, id2]}
    response = await client.post("/api/v1/compare", json=payload)
    assert response.status_code == 200
    res = response.json()["data"]
    assert len(res["investigations"]) == 2
    assert "parameter_matrix" in res
    assert len(res["parameter_matrix"]) > 0
