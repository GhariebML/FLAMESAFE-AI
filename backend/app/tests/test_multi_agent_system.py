"""Comprehensive automated tests for the 11-Agent Scientific Data Intelligence System,
NASA PSI Source Connector, Dynamic Dataset Engine, and Human-in-the-Loop Governance.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.nodes import MultiAgentNodes
from app.connectors.psi.discovery import PSIDiscoveryService
from app.connectors.psi.download_strategy import PSIDownloadStrategy
from app.connectors.psi.file_manifest import PSIFileManifestService
from app.connectors.psi.source_validator import PSISourceValidator
from app.datasets.engine import DynamicDatasetEngine


@pytest.mark.asyncio
async def test_agent_02_query_understanding(db_session: AsyncSession):
    """Verifies Agent 02 parses fuel types, gravity regimes, campaigns, and variables of interest."""
    nodes = MultiAgentNodes(db_session)
    state = {
        "request_id": "req-test-02",
        "user_query": "Compare opposed flame spread rate and oxygen extinction limits for PMMA in BASS and SAFFIRE under lunar partial gravity.",
    }
    out = await nodes.agent_02_query_understanding(state)
    intent = out["research_intent"]

    assert out["workflow_status"] == "CHECKING_EXISTING_DATA"
    assert "BASS" in intent["target_investigations"]
    assert "SAFFIRE" in intent["target_investigations"]
    assert "PMMA" in intent["fuel_type"]
    assert "Lunar" in intent["gravity_regime"]
    assert "flame_spread_rate" in intent["variables_of_interest"]
    assert "oxygen_concentration" in intent["variables_of_interest"]


@pytest.mark.asyncio
async def test_psi_connector_discovery_and_endpoints(client: AsyncClient):
    """Verifies Agent 04 NASA PSI discovery across the 11 verified campaigns and /api/v1/psi endpoints."""
    all_campaigns = PSIDiscoveryService.search_investigations(query="")
    acronyms = {c["acronym"] for c in all_campaigns}
    assert len(all_campaigns) == 11
    for expected in ("BASS", "BASS-II", "SAFFIRE", "FLEX", "FLEX-2", "SAME", "SAME-R", "ACME", "CFI-G", "SOFIE", "BRE"):
        assert expected in acronyms

    # Test API endpoint GET /api/v1/psi/investigations/search
    res = await client.get("/api/v1/psi/investigations/search?query=droplet+heptane")
    assert res.status_code == 200
    data = res.json()["data"]
    assert len(data) >= 1
    assert data[0]["acronym"] in ("FLEX", "FLEX-2")

    # Test API endpoint GET /api/v1/psi/investigations/{id}
    inv_res = await client.get("/api/v1/psi/investigations/BASS")
    assert inv_res.status_code == 200
    assert inv_res.json()["data"]["psi_id"] == "PSI-BASS-01"


@pytest.mark.asyncio
async def test_agent_05_file_selection_formula_and_video_exclusion(client: AsyncClient):
    """Verifies Agent 05 computes F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A and excludes bulky raw video archives."""
    scored = PSIFileManifestService.score_and_select_files(
        user_question="Compare PMMA flame spread rate and oxygen extinction limits in BASS",
        research_intent={
            "fuel_type": "Solid Polymer (PMMA)",
            "variables_of_interest": ["oxygen_concentration", "flame_spread_rate", "airflow_velocity"],
        },
        target_acronyms=["BASS"],
    )
    assert len(scored) >= 3

    by_id = {f["file_identifier"]: f for f in scored}
    table_file = by_id["PSI-FILE-BASS-TABLE-01"]
    video_file = by_id["PSI-FILE-BASS-VIDEO-RAW"]

    # Verify exact mathematical formula F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A
    sb = table_file["score_breakdown"]
    expected_f = round(
        0.35 * sb["question_relevance_q"]
        + 0.25 * sb["file_type_relevance_t"]
        + 0.20 * sb["content_coverage_c"]
        + 0.10 * sb["provenance_quality_p"]
        + 0.10 * sb["accessibility_a"],
        2,
    )
    assert sb["priority_score_f"] == expected_f
    assert table_file["selected"] is True
    assert video_file["selected"] is False
    assert "Excluded" in video_file["selection_rationale"]

    # Verify endpoint GET /api/v1/psi/investigations/BASS/files
    res = await client.get("/api/v1/psi/investigations/BASS/files")
    assert res.status_code == 200
    assert len(res.json()["data"]) >= 3


@pytest.mark.asyncio
async def test_agent_06_security_ssrf_and_acquisition_handoff(client: AsyncClient):
    """Verifies SSRF protection, domain allowlist enforcement, SHA-256 vault storage, and user portal handoff."""
    # 1. SSRF & untrusted domain blocking
    ok_loopback, reason_loopback = PSISourceValidator.validate_source_url("http://127.0.0.1:8000/internal")
    assert ok_loopback is False
    assert "HTTPS" in reason_loopback or "allowlist" in reason_loopback.lower() or "private" in reason_loopback.lower()

    ok_private, _ = PSISourceValidator.validate_source_url("https://192.168.1.10/secret.csv")
    assert ok_private is False

    ok_evil, _ = PSISourceValidator.validate_source_url("https://malicious.example.com/psi_data.json")
    assert ok_evil is False

    ok_nasa, _ = PSISourceValidator.validate_source_url("https://psi.nasa.gov/physci/repo")
    assert ok_nasa is True

    # 2. Path traversal sanitization
    clean_name = PSISourceValidator.sanitize_filename("../../etc/passwd")
    assert ".." not in clean_name
    assert "/" not in clean_name

    # 3. Direct seed acquisition vs User-assisted portal handoff via POST /api/v1/acquisitions
    res = await client.post(
        "/api/v1/acquisitions",
        json={
            "file_identifiers": [
                "PSI-FILE-BASS-TABLE-01",
                "PSI-FILE-BASS-VIDEO-RAW",
            ]
        },
    )
    assert res.status_code == 201
    jobs = res.json()["data"]
    assert len(jobs) == 2

    job_table = next(j for j in jobs if j["file_identifier"] == "PSI-FILE-BASS-TABLE-01")
    job_video = next(j for j in jobs if j["file_identifier"] == "PSI-FILE-BASS-VIDEO-RAW")

    assert job_table["status"] == "DOWNLOADED"
    assert job_table["sha256_hash"] is not None
    assert len(job_table["sha256_hash"]) == 64

    assert job_video["status"] == "USER_HANDOFF_REQUIRED"
    assert "psi.nasa.gov" in (job_video["handoff_instructions"] or "")


@pytest.mark.asyncio
async def test_dataset_engine_validation_and_null_preservation():
    """Verifies Agents 08 & 09 preserve null values (never converting null to 0), normalize units, and reject out-of-bounds data."""
    engine = DynamicDatasetEngine()

    raw_records = [
        {
            "investigation_acronym": "BASS",
            "run_name": "BASS-RUN-VALID",
            "fuel_type": "PMMA",
            "oxygen_pct": 21.0,
            "pressure_kpa": 101.3,
            "airflow_cm_s": 10.0,
            "parameter_name": "flame_spread_rate",
            "raw_value": 2.4,
            "raw_unit": "mm/s",
            "source_doi": "10.1016/j.proci.2014.05.077",
            "source_file_name": "BASS_table.json",
        },
        {
            # Missing value record: raw_value is None -> must remain None, never 0!
            "investigation_acronym": "BASS",
            "run_name": "BASS-RUN-NULL",
            "fuel_type": "PMMA",
            "oxygen_pct": None,
            "pressure_kpa": 101.3,
            "airflow_cm_s": 5.0,
            "parameter_name": "flame_spread_rate",
            "raw_value": None,
            "raw_unit": "mm/s",
            "source_doi": "10.1016/j.proci.2014.05.077",
            "source_file_name": "BASS_table.json",
        },
        {
            # Impossible oxygen concentration (145% O2) -> must be REJECTED deterministically
            "investigation_acronym": "BASS",
            "run_name": "BASS-RUN-INVALID-O2",
            "fuel_type": "PMMA",
            "oxygen_pct": 145.0,
            "pressure_kpa": 101.3,
            "airflow_cm_s": 5.0,
            "parameter_name": "flame_spread_rate",
            "raw_value": 3.1,
            "raw_unit": "mm/s",
            "source_doi": "10.1016/j.proci.2014.05.077",
            "source_file_name": "BASS_table.json",
        },
    ]

    mapped = engine.map_to_canonical_schema(raw_records)
    assert mapped[1]["normalized_value"] is None
    assert mapped[1]["oxygen_pct"] is None

    validated, report = engine.validate_canonical_records(mapped)
    assert validated[0]["validation_status"] == "PASSED"
    assert validated[1]["validation_status"] == "NEEDS_HUMAN_REVIEW"
    assert validated[1]["normalized_value"] is None
    assert validated[2]["validation_status"] == "REJECTED"
    assert report["passed_count"] == 1
    assert report["quarantined_count"] == 1
    assert report["rejected_count"] == 1
    assert report["null_handling_verified"] is True


@pytest.mark.asyncio
async def test_end_to_end_11_agent_research_workflow_and_exports(client: AsyncClient):
    """Executes the full 11-Agent LangGraph workflow via POST /api/v1/research/requests and verifies dataset exports."""
    res = await client.post(
        "/api/v1/research/requests",
        json={
            "question": "Compare opposed and concurrent flame spread rates and oxygen limits for PMMA across BASS and SAFFIRE.",
            "require_approval": False,
            "force_psi_discovery": True,
        },
    )
    assert res.status_code == 201
    req_data = res.json()["data"]

    assert req_data["status"] == "READY"
    assert req_data["dataset_id"] is not None
    assert req_data["dataset_version_id"] is not None
    assert req_data["final_answer"] is not None
    assert len(req_data["discovered_investigations"]) >= 2
    assert len(req_data["selected_files"]) >= 1
    assert len(req_data["agent_runs"]) >= 9
    assert len(req_data["workflow_events"]) >= 9

    dataset_id = req_data["dataset_id"]

    # Verify GET /api/v1/datasets/{dataset_id}
    ds_res = await client.get(f"/api/v1/datasets/{dataset_id}")
    assert ds_res.status_code == 200
    ds_detail = ds_res.json()["data"]
    assert ds_detail["latest_version"]["version_tag"] == "v1.0.0"
    assert len(ds_detail["items"]) >= 4
    assert ds_detail["quality_report"]["null_handling_verified"] is True

    # Verify GET /api/v1/datasets/{dataset_id}/versions
    ver_res = await client.get(f"/api/v1/datasets/{dataset_id}/versions")
    assert ver_res.status_code == 200
    assert len(ver_res.json()["data"]) == 1

    # Verify POST /api/v1/datasets/{dataset_id}/analyze
    an_res = await client.post(f"/api/v1/datasets/{dataset_id}/analyze")
    assert an_res.status_code == 200
    assert len(an_res.json()["data"]["parameter_summaries"]) >= 1

    # Verify multi-format exports (JSON, CSV, Parquet)
    for fmt in ("json", "csv", "parquet"):
        exp_res = await client.get(f"/api/v1/datasets/{dataset_id}/export?format={fmt}")
        assert exp_res.status_code == 200
        assert len(exp_res.content) > 50


@pytest.mark.asyncio
async def test_human_in_the_loop_approval_and_rejection_workflow(client: AsyncClient):
    """Verifies pausing at AWAITING_APPROVAL when require_approval=True, then approving or rejecting."""
    # 1. Create request with require_approval=True
    pause_res = await client.post(
        "/api/v1/research/requests",
        json={
            "question": "Build a droplet combustion dataset from FLEX for heptane burning rate.",
            "require_approval": True,
            "force_psi_discovery": True,
        },
    )
    assert pause_res.status_code == 201
    paused = pause_res.json()["data"]
    assert paused["status"] == "AWAITING_APPROVAL"
    assert paused["approval_status"] == "PENDING"
    assert paused["dataset_id"] is None

    request_id = paused["id"]

    # 2. Approve and resume workflow -> transitions from AWAITING_APPROVAL to READY
    approve_res = await client.post(
        f"/api/v1/research/requests/{request_id}/approve",
        json={
            "decision": "APPROVE",
            "decided_by": "Mission Safety Lead",
            "reason": "Approved FLEX tabular seed manifest.",
        },
    )
    assert approve_res.status_code == 200
    resumed = approve_res.json()["data"]
    assert resumed["status"] == "READY"
    assert resumed["approval_status"] == "APPROVED"
    assert resumed["dataset_id"] is not None
    assert resumed["final_answer"] is not None

    # 3. Create another request with require_approval=True and test REJECT
    reject_init = await client.post(
        "/api/v1/research/requests",
        json={
            "question": "Analyze ACME gaseous coflow soot volume fraction.",
            "require_approval": True,
            "force_psi_discovery": True,
        },
    )
    reject_req_id = reject_init.json()["data"]["id"]
    reject_res = await client.post(
        f"/api/v1/research/requests/{reject_req_id}/approve",
        json={
            "decision": "REJECT",
            "decided_by": "Mission Safety Lead",
            "reason": "Deferred acquisition.",
        },
    )
    assert reject_res.status_code == 200
    assert reject_res.json()["data"]["status"] == "CANCELLED"
    assert reject_res.json()["data"]["approval_status"] == "REJECTED"
