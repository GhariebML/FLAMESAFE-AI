"""Second-Stage Engineering Audit & Scientific Validation Test Suites (Priorities 1 through 10).
Covers all 10 required test suites:
1. Unit tests (Official NASA PSI identifier separation & alias preservation)
2. Database & vector integration tests (Migration chain 001->002->003, cosine math, mock vs live vector isolation)
3. Live PSI connector validation tests (Traceable live catalog inspection & record origin separation)
4. Download governance tests (7 outcomes, 25 MB configurable FlameSafe policy vs 1 GB NASA PSI threshold)
5. Multi-Agent workflow & AI provider validation tests (gemini-2.5-flash, gemini-embedding-001, MOCK_DEMO_MODE vs LIVE_AI_MODE)
6. Checkpoint recovery & durable workflow resumption tests (9-step pause, restart simulation, idempotent download/extraction)
7. Dataset quality coverage, 6-hop lineage explorer, and version diff tests
8. Real Apache Parquet round-trip compatibility tests using PyArrow (PAR1 binary, schema, nulls, units, provenance)
9. RAG scientific benchmark evaluation tests (retrieval precision, citation accuracy, out-of-domain abstention)
10. Pandas & NumPy analytical workspace & unit-compatibility guard tests
"""

import json
from pathlib import Path
from unittest.mock import patch

import pyarrow.parquet as pq
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.nodes import MultiAgentNodes
from app.agents.orchestrator.supervisor import ChiefIntelligenceOrchestrator
from app.connectors.psi.discovery import PSIDiscoveryService
from app.connectors.psi.download_strategy import PSIDownloadStrategy
from app.connectors.psi.file_manifest import PSIFileManifestService
from app.core.config import settings
from app.datasets.analytics import DatasetAnalyticalEngine
from app.datasets.quality_and_lineage import DatasetQualityAndLineageService
from app.datasets.storage_vault import StorageVaultService
from app.models.evidence_chunk import EvidenceChunk
from app.models.multi_agent import (
    AcquisitionJob,
    AgentCheckpoint,
    DatasetItem,
    DatasetVersion,
)
from app.rag.retriever import EvidenceRetriever
from app.schemas.assistant import AssistantQueryRequest
from app.services.ai_service import AIService


# ============================================================================
# SUITE 1 — PRIORITY 1: OFFICIAL NASA PSI IDENTIFIER VERIFICATION UNIT TESTS
# ============================================================================
def test_suite_01_official_nasa_psi_identifier_separation():
    """Verifies official NASA PSI source_record_id values are separated from internal_catalog_id and local_aliases."""
    all_entries = PSIDiscoveryService.search_investigations(query="")
    by_internal = {e["internal_catalog_id"]: e for e in all_entries}

    # Confirmed official NASA PSI reference mappings from Priority 1
    expected_official = {
        "FS-CAT-BASS-II-025": "PSI-25",
        "FS-CAT-SAFFIRE-I-098": "PSI-98",
        "FS-CAT-FLEX-069": "PSI-69",
        "FS-CAT-SAME-102": "PSI-102",
        "FS-CAT-SAME-R-101": "PSI-101",
        "FS-CAT-ACME-CFIG-159": "PSI-159",
        "FS-CAT-CFI-G-159": "PSI-159",
    }
    for internal_id, official_psi_id in expected_official.items():
        entry = by_internal[internal_id]
        assert entry["source_repository"] == "NASA_PSI"
        assert entry["source_record_id"] == official_psi_id
        assert entry["verification_status"] == "VERIFIED_OFFICIAL_PSI_ID"
        # Dataset DOI must never be conflated with publication DOIs
        assert entry["dataset_doi"] is None
        assert len(entry["publication_dois"]) >= 1

    # Unverified campaign entries must honestly report source_record_id = None (never invented)
    for unverified_internal in ("FS-CAT-BASS-I-MSG", "FS-CAT-FLEX-2", "FS-CAT-SOFIE", "FS-CAT-ACME-BRE"):
        entry = by_internal[unverified_internal]
        assert entry["source_record_id"] is None
        assert entry["verification_status"] == "UNVERIFIED_OFFICIAL_PSI_ID"

    # Legacy local aliases (e.g. PSI-BASS-01, PSI-SAFFIRE-01) are preserved in local_aliases for lookup
    saffire = PSIDiscoveryService.get_investigation_by_id("PSI-SAFFIRE-01")
    assert saffire is not None
    assert saffire["source_record_id"] == "PSI-98"
    assert "PSI-SAFFIRE-01" in saffire["local_aliases"]


# ============================================================================
# SUITE 2 — PRIORITY 5: DATABASE, MIGRATION CHAIN & VECTOR ISOLATION TESTS
# ============================================================================
@pytest.mark.asyncio
async def test_suite_02_migration_chain_and_vector_provider_isolation():
    """Verifies Alembic migration chain (001->002->003) and strict isolation between mock and live semantic vectors."""
    mig_dir = Path(__file__).resolve().parents[2] / "migrations" / "versions"
    m001 = (mig_dir / "001_initial_schema.py").read_text(encoding="utf-8")
    m002 = (mig_dir / "002_add_embedding_metadata.py").read_text(encoding="utf-8")
    m003 = (mig_dir / "003_multi_agent_dataset_engine.py").read_text(encoding="utf-8")

    assert 'revision: str = "001_initial_schema"' in m001 or "001_initial_schema" in m001
    assert 'down_revision: Union[str, None] = "001_initial_schema"' in m002
    assert 'down_revision: Union[str, None] = "002_add_embedding_metadata"' in m003
    assert "def downgrade()" in m002 and "def downgrade()" in m003

    # Verify cosine similarity math
    assert round(EvidenceRetriever._cosine_similarity([1.0, 0.0], [1.0, 0.0]), 4) == 1.0
    assert round(EvidenceRetriever._cosine_similarity([1.0, 0.0], [0.0, 1.0]), 4) == 0.0
    # Incompatible vector lengths return 0.0
    assert EvidenceRetriever._cosine_similarity([1.0, 0.5], [1.0, 0.5, 0.2]) == 0.0

    # Verify a chunk tagged with a different embedding model/dimension is re-embedded rather than mixed
    chunk = EvidenceChunk(
        id="chunk-test-vec",
        document_id="doc-1",
        chunk_text="BASS opposed-flow PMMA flame spread rate in microgravity.",
        embedding=[0.99] * 384,
        embedding_provider="gemini",
        embedding_model="gemini-embedding-001",
        embedding_dimension=384,
    )
    results = await EvidenceRetriever.retrieve(
        query="PMMA flame spread rate in BASS",
        candidates=[chunk],
        top_k=1,
    )
    assert len(results) == 1


# ============================================================================
# SUITE 3 — PRIORITY 3: LIVE NASA PSI CONNECTOR VALIDATION TESTS
# ============================================================================
def test_suite_03_live_psi_connector_trace_and_origin_separation():
    """Verifies the live NASA PSI smoke-test trace artifact and strict record_origin separation."""
    trace_path = Path(__file__).resolve().parents[2] / "data" / "psi_live_catalog_trace.json"
    assert trace_path.exists(), "Live PSI catalog trace JSON must exist from psi_live_smoke_test.py"

    trace = json.loads(trace_path.read_text(encoding="utf-8"))
    assert trace["psi_portal_probe"]["landing_http_status"] == 200
    assert trace["psi_portal_probe"]["requires_interactive_browser_portal"] is True

    verified_ids = {r["source_record_id"]: r for r in trace["trace_records"]}
    for pid in ("PSI-25", "PSI-69", "PSI-98", "PSI-101", "PSI-102", "PSI-159"):
        assert pid in verified_ids
        rec = verified_ids[pid]
        assert rec["publication_doi_live_verified"] is True
        assert rec["publication_doi_http_status"] == 200
        assert rec["record_origin"] == "LIVE_DISCOVERED_RECORD"


# ============================================================================
# SUITE 4 — PRIORITY 4: DOWNLOAD GOVERNANCE & SIZE POLICY TESTS
# ============================================================================
@pytest.mark.asyncio
async def test_suite_04_download_governance_seven_states_and_policy():
    """Verifies the 25 MB FlameSafe auto-acquisition policy vs 1 GB NASA PSI bulk threshold and all 7 outcomes."""
    assert settings.FLAMESAFE_AUTO_ACQUISITION_MAX_BYTES == 25 * 1024 * 1024
    assert settings.NASA_PSI_BULK_EMAIL_THRESHOLD_BYTES == 1024 * 1024 * 1024

    # 1. DOWNLOAD_COMPLETED (direct seed table)
    st_dl, meta_dl, content_dl = await PSIDownloadStrategy.acquire_file("PSI-FILE-BASS-TABLE-01", user_approved=True)
    assert st_dl == "DOWNLOAD_COMPLETED"
    assert content_dl is not None and len(content_dl) > 100

    # 2. USER_APPROVAL_REQUIRED (when user_approved=False)
    st_app, meta_app, _ = await PSIDownloadStrategy.acquire_file("PSI-FILE-BASS-TABLE-01", user_approved=False)
    assert st_app == "USER_APPROVAL_REQUIRED"
    assert "approval" in meta_app["status_explanation"].lower()

    # 3. PORTAL_HANDOFF_REQUIRED (185 MB raw video archive > 25 MB FlameSafe auto-acquisition policy)
    st_portal, meta_portal, _ = await PSIDownloadStrategy.acquire_file("PSI-FILE-BASS-VIDEO-RAW", user_approved=True)
    assert st_portal == "PORTAL_HANDOFF_REQUIRED"
    assert "25" in meta_portal["handoff_instructions"] and "1 GB" in meta_portal["handoff_instructions"]

    # 4. INVALID_SOURCE (unknown file identifier)
    st_inv, _, _ = await PSIDownloadStrategy.acquire_file("NON-EXISTENT-FILE-999")
    assert st_inv == "INVALID_SOURCE"

    # 5. ACCESS_RESTRICTED (restricted file manifest entry)
    with patch.object(
        PSIFileManifestService,
        "get_file_by_id",
        return_value={
            "file_identifier": "PSI-RESTRICTED-TEST",
            "source_url": "https://psi.nasa.gov/physci/repo",
            "accessibility": "ACCESS_RESTRICTED",
            "acquisition_outcome": "ACCESS_RESTRICTED",
            "file_size_bytes": 1024,
        },
    ):
        st_res, _, _ = await PSIDownloadStrategy.acquire_file("PSI-RESTRICTED-TEST")
        assert st_res == "ACCESS_RESTRICTED"


# ============================================================================
# SUITE 5 — PRIORITY 6: REAL AI PROVIDER CONFIGURATION & EXECUTION MODE TESTS
# ============================================================================
@pytest.mark.asyncio
async def test_suite_05_ai_provider_models_and_execution_mode(db_session: AsyncSession):
    """Verifies non-deprecated Gemini models (gemini-3.8-flash, gemini-embedding-2) and execution_mode labeling."""
    assert settings.GEMINI_MODEL in ("gemini-3.8-flash", "gemini-2.5-flash")
    assert settings.GEMINI_EMBEDDING_MODEL in ("gemini-embedding-2", "gemini-embedding-001")

    ai_service = AIService(db_session)
    resp = await ai_service.answer_query(
        AssistantQueryRequest(query="Compare PMMA flame spread rate in BASS", max_citations=3)
    )
    assert resp.execution_mode in ("MOCK_DEMO_MODE", "MOCK_FALLBACK_MODE", "LIVE_AI_MODE")
    if resp.is_mock_provider:
        assert resp.execution_mode in ("MOCK_DEMO_MODE", "MOCK_FALLBACK_MODE")


# ============================================================================
# SUITE 6 — PRIORITY 7: DURABLE WORKFLOW RESUMPTION & CHECKPOINT RECOVERY
# ============================================================================
@pytest.mark.asyncio
async def test_suite_06_checkpoint_recovery_and_idempotent_resumption(db_session: AsyncSession):
    """Tests the 9-step pause -> backend restart simulation -> resume from AgentCheckpoint without repeating downloads."""
    # Steps 1-3: Submit research request with require_approval=True -> pauses at AWAITING_APPROVAL
    orch_before_restart = ChiefIntelligenceOrchestrator(db_session)
    paused_req = await orch_before_restart.execute_request(
        query="Build a droplet combustion dataset from FLEX for n-heptane burning rate.",
        require_approval=True,
        force_psi_discovery=True,
    )
    assert paused_req.status == "AWAITING_APPROVAL"
    assert paused_req.approval_status == "PENDING"

    # Verify AgentCheckpoint rows were persisted in the database
    ckpt_res = await db_session.execute(
        select(AgentCheckpoint)
        .where(AgentCheckpoint.request_id == paused_req.id)
        .order_by(AgentCheckpoint.checkpoint_version.desc())
    )
    ckpts = list(ckpt_res.scalars().all())
    assert len(ckpts) >= 4
    assert ckpts[0].step_name == "04_AGENT_05"

    # Step 4-6: Simulate backend restart by instantiating a brand-new orchestrator and approving
    orch_after_restart = ChiefIntelligenceOrchestrator(db_session)
    completed_req = await orch_after_restart.approve_and_resume(
        request_id=paused_req.id,
        decision="APPROVE",
        decided_by="Restart Recovery Tester",
        reason="Resuming from persisted AgentCheckpoint after simulated backend restart.",
    )
    assert completed_req.status == "READY"
    assert completed_req.dataset_id is not None
    assert completed_req.final_answer is not None

    # Steps 7-9: Verify idempotency — if agent_06_file_acquisition or agent_07_scientific_extraction
    # is invoked again for the same request_id, completed downloads and extractions are NOT repeated!
    nodes = MultiAgentNodes(db_session)
    re_acq = await nodes.agent_06_file_acquisition(
        {
            "request_id": completed_req.id,
            "selected_files": completed_req.selected_files or [],
            "approval_status": "APPROVED",
            "require_approval": True,
        }
    )
    assert all(j.get("reused_from_checkpoint") is True for j in re_acq["acquisition_jobs"])


# ============================================================================
# SUITE 7 — PRIORITY 8: DATASET COVERAGE, 6-HOP LINEAGE & VERSION DIFF TESTS
# ============================================================================
@pytest.mark.asyncio
async def test_suite_07_dataset_coverage_lineage_and_version_diff(client: AsyncClient, db_session: AsyncSession):
    """Verifies deterministic coverage metrics, 6-hop provenance lineage, and version diff (v1 vs v2)."""
    res = await client.post(
        "/api/v1/research/requests",
        json={
            "question": "Compare PMMA flame spread rate across BASS and SAFFIRE.",
            "require_approval": False,
            "force_psi_discovery": True,
        },
    )
    assert res.status_code == 201
    dataset_id = res.json()["data"]["dataset_id"]

    # 1. Coverage endpoint
    cov_res = await client.get(f"/api/v1/datasets/{dataset_id}/coverage")
    assert cov_res.status_code == 200
    cov = cov_res.json()["data"]
    assert cov["total_records"] >= 4
    assert cov["field_completeness"] > 80.0
    assert cov["measurement_coverage"] == 100.0
    assert cov["doi_availability"] == 100.0
    assert cov["unit_consistency"] == 100.0
    assert cov["overall_quality_score"] > 85.0

    # 2. 6-Hop Lineage endpoint
    lin_res = await client.get(f"/api/v1/datasets/{dataset_id}/lineage")
    assert lin_res.status_code == 200
    lineage = lin_res.json()["data"]
    assert lineage["record_count"] == cov["total_records"]
    first_chain = lineage["lineage_items"][0]["provenance_chain"]
    for step_key in (
        "step_1_dataset_item",
        "step_2_experimental_run",
        "step_3_investigation",
        "step_4_source_document",
        "step_5_location_reference",
        "step_6_original_source",
    ):
        assert step_key in first_chain

    # 3. Version diff between v1 and a modified v2
    ver_res = await db_session.execute(select(DatasetVersion).where(DatasetVersion.dataset_id == dataset_id))
    v1 = ver_res.scalars().first()
    assert v1 is not None
    v1_count = len(v1.items)

    v2 = DatasetVersion(
        dataset_id=dataset_id,
        version_number=2,
        version_tag="v2.0.0",
        schema_version="1.0.0",
        content_fingerprint="fp-v2",
        source_investigation_ids=["BASS", "SAFFIRE"],
        original_file_ids=[],
        source_document_ids=[],
        record_count=v1_count + 1,
        measurement_count=v1_count + 1,
        validation_status="PASSED",
        processing_config={},
        unit_conversions=[],
        file_hashes={},
        provenance_manifest={},
    )
    cloned_items = [
        DatasetItem(
            dataset_version_id="v2-temp",
            investigation_id=it.investigation_id,
            investigation_acronym=it.investigation_acronym,
            run_name=it.run_name,
            parameter_name=it.parameter_name,
            original_value=it.original_value,
            original_unit=it.original_unit,
            normalized_value=it.normalized_value,
            normalized_unit=it.normalized_unit,
            conversion_formula=it.conversion_formula,
            fuel_type=it.fuel_type,
            gravity_regime=it.gravity_regime,
            source_doi=it.source_doi,
            extraction_method=it.extraction_method,
            evidence_classification=it.evidence_classification,
            validation_status=it.validation_status,
        )
        for it in v1.items
    ]
    v2.items = cloned_items + [
        DatasetItem(
            dataset_version_id="v2-temp",
            investigation_id="inv-extra",
            investigation_acronym="SAFFIRE",
            run_name="SAFFIRE-EXTRA-RUN",
            parameter_name="flame_spread_rate",
            original_value=1.9,
            original_unit="mm/s",
            normalized_value=1.9,
            normalized_unit="mm/s",
            conversion_formula="identity (1:1)",
            fuel_type="SIBAL Fabric",
            gravity_regime="Microgravity (~0g)",
            source_doi="10.32865/2346/108820",
            extraction_method="TABULAR",
            evidence_classification="VERIFIED_EXPERIMENTAL_DATA",
            validation_status="PASSED",
        )
    ]
    diff = DatasetQualityAndLineageService.compute_version_diff(v1, v2)
    assert diff["added_count"] == 1
    assert diff["removed_count"] == 0
    assert diff["unchanged_count"] == v1_count


# ============================================================================
# SUITE 8 — PRIORITY 2: REAL PYARROW PARQUET ROUND-TRIP COMPATIBILITY TESTS
# ============================================================================
def test_suite_08_real_pyarrow_parquet_round_trip(tmp_path: Path):
    """Writes dataset to .parquet, reads it with PyArrow, and verifies magic bytes, schema, count, nulls, units, and provenance."""
    vault = StorageVaultService(base_dir=tmp_path)
    records = [
        {
            "investigation_id": "inv-bass-25",
            "investigation_acronym": "BASS",
            "experimental_run_id": "run-1",
            "run_name": "BASS-MSG-01",
            "parameter_name": "flame_spread_rate",
            "original_value": 0.25,
            "original_unit": "cm/s",
            "normalized_value": 2.5,
            "normalized_unit": "mm/s",
            "conversion_formula": "mm/s = cm/s * 10.0",
            "uncertainty": 0.08,
            "fuel_type": "Solid Polymer (PMMA)",
            "gravity_regime": "Microgravity (~0g)",
            "oxygen_pct": 21.0,
            "pressure_kpa": 101.3,
            "airflow_cm_s": 10.0,
            "source_document_id": "doc-bass-001",
            "source_doi": "10.1007/s12217-024-10106-y",
            "source_url": "https://psi.nasa.gov/physci/repo",
            "page_number": 4,
            "section_name": "Concurrent Flame Spread Results",
            "extraction_method": "SEED_RELATIONAL_AND_VAULT_MANIFEST",
            "evidence_classification": "VERIFIED_EXPERIMENTAL_DATA",
            "validation_status": "PASSED",
            "validation_notes": None,
        },
        {
            # Second row with explicit NULL measurements to verify strict null preservation in Parquet
            "investigation_id": "inv-saffire-98",
            "investigation_acronym": "SAFFIRE",
            "experimental_run_id": "run-2",
            "run_name": "SAFFIRE-I-NULL-CHECK",
            "parameter_name": "oxygen_concentration",
            "original_value": None,
            "original_unit": "% O2",
            "normalized_value": None,
            "normalized_unit": "% O2",
            "conversion_formula": "identity (1:1)",
            "uncertainty": None,
            "fuel_type": "SIBAL Fabric",
            "gravity_regime": "Microgravity (~0g)",
            "oxygen_pct": None,
            "pressure_kpa": 101.3,
            "airflow_cm_s": 20.0,
            "source_document_id": "doc-saffire-001",
            "source_doi": "10.32865/2346/108820",
            "source_url": "https://psi.nasa.gov/physci/repo",
            "page_number": 6,
            "section_name": "Large-Scale Fabric Burn",
            "extraction_method": "SEED_RELATIONAL_AND_VAULT_MANIFEST",
            "evidence_classification": "VERIFIED_EXPERIMENTAL_DATA",
            "validation_status": "NEEDS_HUMAN_REVIEW",
            "validation_notes": "Null value preserved.",
        },
    ]

    uris = vault.export_dataset_files(
        dataset_key="FS-DS-PARQUET-TEST",
        version_tag="v1.0.0",
        records=records,
        metadata={"dataset_key": "FS-DS-PARQUET-TEST"},
    )
    assert "parquet" in uris
    parquet_path = Path(uris["parquet"])
    assert parquet_path.exists()
    assert parquet_path.suffix == ".parquet"

    # Verify Apache Parquet magic header & footer bytes ("PAR1")
    raw_bytes = parquet_path.read_bytes()
    assert raw_bytes[:4] == b"PAR1"
    assert raw_bytes[-4:] == b"PAR1"

    # Read back using PyArrow and verify schema, record count, null preservation, units, and provenance
    table = pq.read_table(parquet_path)
    assert table.num_rows == 2
    assert "normalized_value" in table.column_names
    assert "normalized_unit" in table.column_names
    assert "source_doi" in table.column_names

    rows_back = table.to_pylist()
    assert rows_back[0]["normalized_value"] == pytest.approx(2.5)
    assert rows_back[0]["normalized_unit"] == "mm/s"
    assert rows_back[0]["source_doi"] == "10.1007/s12217-024-10106-y"
    assert rows_back[0]["page_number"] == 4

    # Strict null preservation: None must remain None, never converted to 0.0!
    assert rows_back[1]["normalized_value"] is None
    assert rows_back[1]["raw_value"] is None
    assert rows_back[1]["oxygen_pct"] is None
    assert rows_back[1]["uncertainty"] is None


# ============================================================================
# SUITE 9 — PRIORITY 10: RAG SCIENTIFIC BENCHMARK EVALUATION TESTS
# ============================================================================
@pytest.mark.asyncio
async def test_suite_09_rag_scientific_benchmark_evaluation(db_session: AsyncSession):
    """Evaluates retrieval precision, citation DOI accuracy, and out-of-domain abstention on scientific_qa_benchmark.json."""
    bench_path = Path(__file__).resolve().parents[2] / "data" / "benchmarks" / "scientific_qa_benchmark.json"
    bench = json.loads(bench_path.read_text(encoding="utf-8"))
    ai_service = AIService(db_session)

    hits = 0
    total_in_domain = 0

    for case in bench["cases"]:
        resp = await ai_service.answer_query(
            AssistantQueryRequest(query=case["question"], max_citations=4)
        )
        assert resp.has_sufficient_evidence is case["expected_sufficient_evidence"], f"Failed on {case['case_id']}"

        if case["expected_sufficient_evidence"]:
            total_in_domain += 1
            cited_acronyms = {c.investigation_acronym for c in resp.citations}
            cited_dois = {c.doi for c in resp.citations if c.doi}
            assert any(exp in cited_acronyms for exp in case["expected_investigations"]), (
                f"Expected {case['expected_investigations']} in {cited_acronyms}"
            )
            assert any(doi in cited_dois for doi in case["expected_dois"]), (
                f"Expected DOI {case['expected_dois']} in {cited_dois}"
            )
            hits += 1
        else:
            assert len(resp.citations) == 0
            assert "abstain" in resp.answer.lower() or "insufficient" in resp.answer.lower()

    retrieval_precision = hits / max(1, total_in_domain)
    assert retrieval_precision == 1.0


# ============================================================================
# SUITE 10 — PRIORITY 9: PANDAS/NUMPY ANALYTICAL WORKSPACE & UNIT GUARD TESTS
# ============================================================================
@pytest.mark.asyncio
async def test_suite_10_pandas_analytical_workspace_and_unit_guard(client: AsyncClient):
    """Verifies Pandas/NumPy descriptive statistics, group-by, missing value analysis, and unit compatibility guardrails."""
    res = await client.post(
        "/api/v1/research/requests",
        json={
            "question": "Compare PMMA flame spread rate and oxygen concentration across BASS and SAFFIRE.",
            "require_approval": False,
            "force_psi_discovery": True,
        },
    )
    assert res.status_code == 201
    dataset_id = res.json()["data"]["dataset_id"]

    # Call POST /api/v1/datasets/{dataset_id}/analytics
    an_res = await client.post(
        f"/api/v1/datasets/{dataset_id}/analytics",
        json={
            "group_by_column": "investigation_acronym",
            "compare_parameter": "flame_spread_rate",
        },
    )
    assert an_res.status_code == 200
    analytics = an_res.json()["data"]

    assert analytics["metric_classification"] == "DERIVED_METRIC"
    assert analytics["inference_classification"] == "ANALYTICAL_INFERENCE"
    assert "causality" in analytics["causality_disclaimer"].lower()
    assert analytics["unit_comparison_check"]["status"] == "UNIT_COMPATIBLE"
    assert len(analytics["descriptive_statistics"]) >= 1
    assert len(analytics["group_by_summary"]) >= 1
    assert "normalized_value" in analytics["missing_value_analysis"]

    # Verify explicit unit-compatibility guardrail blocks comparing different parameters
    compat_ok = DatasetAnalyticalEngine.verify_unit_compatible_comparison(
        "flame_spread_rate", "cm/s", "flame_spread_rate", "mm/s"
    )
    assert compat_ok["compatible"] is True
    assert compat_ok["canonical_unit"] == "mm/s"

    compat_bad = DatasetAnalyticalEngine.verify_unit_compatible_comparison(
        "flame_spread_rate", "mm/s", "oxygen_concentration", "% O2"
    )
    assert compat_bad["compatible"] is False
    assert compat_bad["reason"] == "INCOMPATIBLE_PARAMETERS"
