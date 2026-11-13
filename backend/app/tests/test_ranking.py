import pytest
from httpx import AsyncClient

from app.models.experimental_run import ExperimentalRun
from app.models.investigation import Investigation
from app.models.research_document import ResearchDocument
from app.ranking.explainability import RankingExplainability
from app.ranking.scoring import RelevanceScorer
from app.schemas.ranking import RankedInvestigationItem, RankingWeights


@pytest.mark.asyncio
async def test_rank_investigations(client: AsyncClient):
    """Verify endpoint execution with standard query and filters."""
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
    assert "detailed_summary" in res
    assert len(res["detailed_summary"]) > 20


@pytest.mark.asyncio
async def test_ranking_api_custom_weights(client: AsyncClient):
    """Verify endpoint supports custom weight configurations."""
    payload = {
        "query": "airflow extinction velocity of fabric flames",
        "weights": {
            "domain_relevance": 0.50,
            "fuel_compatibility": 0.30,
            "condition_compatibility": 0.10,
            "mission_applicability": 0.05,
            "metadata_quality": 0.05,
        },
    }
    response = await client.post("/api/v1/rank", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["applied_weights"]["domain_relevance"] == 0.50
    assert data["applied_weights"]["fuel_compatibility"] == 0.30
    assert len(data["results"]) > 0


def test_ranking_mathematical_precision():
    """Verify R = 0.30D + 0.25F + 0.20C + 0.15M + 0.10Q calculation precision."""
    inv = Investigation(
        id="inv-math-01",
        psi_id="PSI-MATH-01",
        acronym="MATH",
        title="Solid PMMA Flammability in Microgravity",
        research_area="Combustion Science",
        doi="10.1016/j.proci.2018.01.001",
        metadata_payload={"target_environments": ["Spacecraft", "Space Station"]},
    )
    run1 = ExperimentalRun(
        id="run-01",
        investigation_id="inv-math-01",
        fuel_type="Solid Polymer",
        fuel_name="PMMA",
        pressure_value=101.3,
        airflow_velocity=5.0,
        oxygen_concentration=21.0,
    )
    doc1 = ResearchDocument(
        id="doc-01",
        investigation_id="inv-math-01",
        title="PMMA Burning Rates Report",
        document_type="Paper",
    )
    inv.experimental_runs = [run1]
    inv.research_documents = [doc1]

    weights = RankingWeights(
        domain_relevance=0.30,
        fuel_compatibility=0.25,
        condition_compatibility=0.20,
        mission_applicability=0.15,
        metadata_quality=0.10,
    )

    item = RelevanceScorer.calculate_score(
        investigation=inv,
        query="PMMA flammability under microgravity airflow",
        target_environment="Spacecraft",
        fuel_category="PMMA",
        weights=weights,
    )

    fb = item.factor_breakdown
    expected_r = round(
        0.30 * fb.domain_score
        + 0.25 * fb.fuel_score
        + 0.20 * fb.condition_score
        + 0.15 * fb.mission_score
        + 0.10 * fb.quality_score,
        2,
    )

    assert item.relevance_score == expected_r
    assert fb.domain_weighted is not None
    assert fb.fuel_weighted is not None
    assert fb.condition_weighted is not None
    assert fb.mission_weighted is not None
    assert fb.quality_weighted is not None


def test_ranking_custom_weights_and_normalization():
    """Verify weight normalization ensures sum to 1.0."""
    unnormalized = RankingWeights(
        domain_relevance=0.60,
        fuel_compatibility=0.40,
        condition_compatibility=0.40,
        mission_applicability=0.30,
        metadata_quality=0.30,
    )
    norm = unnormalized.normalized()
    total = (
        norm.domain_relevance
        + norm.fuel_compatibility
        + norm.condition_compatibility
        + norm.mission_applicability
        + norm.metadata_quality
    )
    assert pytest.approx(total, 0.001) == 1.0
    assert norm.domain_relevance == 0.30
    assert norm.fuel_compatibility == 0.20


def test_ranking_missing_values_edge_cases():
    """Verify scorer robustness against null fields and empty collections."""
    inv_empty = Investigation(
        id="inv-null",
        psi_id="PSI-UNKNOWN",
        acronym=None,
        title=None,
        research_area=None,
        description=None,
        doi=None,
        metadata_payload=None,
    )
    inv_empty.experimental_runs = []
    inv_empty.research_documents = []

    item = RelevanceScorer.calculate_score(
        investigation=inv_empty,
        query="combustion extinction limits",
        target_environment="Lunar Surface",
        fuel_category="Heptane",
    )

    assert 0 <= item.relevance_score <= 100
    assert item.title == "Untitled Investigation"
    assert item.acronym == "UNKNOWN"
    assert item.factor_breakdown.quality_score == 0.0
    assert item.factor_breakdown.condition_score == 0.0
    assert len(item.missing_factors) > 0


def test_ranking_tie_breaking_determinism():
    """Verify deterministic tie-breaking by quality_score, documents count, and acronym."""
    inv_a = Investigation(
        id="inv-a",
        psi_id="PSI-ALPHA",
        acronym="ALPHA",
        title="Alpha Investigation",
        research_area="Combustion",
        doi="10.1000/182",
    )
    inv_a.experimental_runs = []
    inv_a.research_documents = [ResearchDocument(id="d1", investigation_id="inv-a", title="Doc 1", document_type="Report")]

    inv_b = Investigation(
        id="inv-b",
        psi_id="PSI-BETA",
        acronym="BETA",
        title="Beta Investigation",
        research_area="Combustion",
        doi="10.1000/182",
    )
    inv_b.experimental_runs = []
    inv_b.research_documents = []

    item_a = RelevanceScorer.calculate_score(inv_a, query="combustion")
    item_b = RelevanceScorer.calculate_score(inv_b, query="combustion")

    # Simulate sorting identical relevance scores
    items = [item_b, item_a]
    items.sort(
        key=lambda x: (
            -x.relevance_score,
            -x.factor_breakdown.quality_score,
            -x.supporting_evidence_count,
            x.acronym or "",
        )
    )

    # item_a has higher quality and supporting documents, so must sort first
    assert items[0].acronym == "ALPHA"


def test_ranking_non_existent_domain_and_fuel():
    """Verify gracefully low scores for completely unindexed domains and fuels."""
    inv = Investigation(
        id="inv-bass",
        psi_id="PSI-BASS-01",
        acronym="BASS",
        title="Burning and Suppression of Solids",
        research_area="Combustion Science",
        doi="10.1016/j.proci.2014.05.077",
    )
    inv.experimental_runs = [
        ExperimentalRun(
            id="r1",
            investigation_id="inv-bass",
            fuel_type="Solid",
            fuel_name="Cotton Fabric",
        )
    ]
    inv.research_documents = []

    item = RelevanceScorer.calculate_score(
        investigation=inv,
        query="superconducting cryogenic quantum entanglement",
        target_environment="Deep Core of Jupiter",
        fuel_category="Plutonium Hydride",
    )

    assert item.relevance_score < 40.0
    assert any("No experimental runs with fuel category" in m for m in item.missing_factors)
    assert any("not explicitly tested" in m for m in item.missing_factors)


def test_ranking_explainability_methods():
    """Verify explainability helper outputs."""
    item1 = RankedInvestigationItem(
        investigation_id="inv-1",
        psi_id="PSI-BASS",
        acronym="BASS",
        title="BASS Experiment",
        research_area="Combustion",
        relevance_score=85.5,
        factor_breakdown={
            "domain_score": 90.0,
            "fuel_score": 85.0,
            "condition_score": 80.0,
            "mission_score": 85.0,
            "quality_score": 90.0,
            "domain_weighted": 27.0,
            "fuel_weighted": 21.25,
            "condition_weighted": 16.0,
            "mission_weighted": 12.75,
            "quality_weighted": 9.0,
        },
        matched_factors=["Target fuel match", "Orbital environment match"],
        missing_factors=["No pressure data"],
        explanation="Test explanation",
        supporting_evidence_count=3,
    )
    item2 = RankedInvestigationItem(
        investigation_id="inv-2",
        psi_id="PSI-FLEX",
        acronym="FLEX",
        title="FLEX Experiment",
        research_area="Combustion",
        relevance_score=72.0,
        factor_breakdown={
            "domain_score": 70.0,
            "fuel_score": 70.0,
            "condition_score": 70.0,
            "mission_score": 75.0,
            "quality_score": 80.0,
            "domain_weighted": 21.0,
            "fuel_weighted": 17.5,
            "condition_weighted": 14.0,
            "mission_weighted": 11.25,
            "quality_weighted": 8.0,
        },
        matched_factors=["Combustion domain match"],
        missing_factors=["No direct fuel match"],
        explanation="Test explanation 2",
        supporting_evidence_count=1,
    )

    # 1. Factor breakdown explanation
    fb_text = RankingExplainability.explain_factor_breakdown(item1)
    assert "Overall Relevance: 85.5/100" in fb_text
    assert "Domain [90.0" in fb_text
    assert "Target fuel match" in fb_text

    # 2. Detailed summary
    summary = RankingExplainability.generate_detailed_summary([item1, item2], query="BASS flammability")
    assert "Top match is BASS" in summary
    assert "85.5/100" in summary

    # 3. Pairwise comparison
    comp = RankingExplainability.explain_comparison(item1, item2)
    assert "BASS outranked FLEX by +13.5 points" in comp
