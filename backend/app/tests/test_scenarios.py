import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_scenario_analysis(client: AsyncClient):
    payload = {
        "environment": "Lunar Habitat",
        "fuel_type": "Solid Polymer",
        "oxygen_concentration": 28.0,
        "pressure_value": 56.5,
        "pressure_unit": "kPa",
        "airflow_velocity": 5.0,
        "airflow_unit": "cm/s",
        "fire_safety_focus": "Flammability",
    }
    response = await client.post("/api/v1/scenarios/analyze", json=payload)
    assert response.status_code == 200
    res = response.json()["data"]
    assert res["target_environment"] == "Lunar Habitat"
    assert "Lunar" in res["gravity_context"]
    assert len(res["condition_matches"]) > 0
    assert len(res["research_gaps"]) > 0
    assert "safety_advisory" in res
