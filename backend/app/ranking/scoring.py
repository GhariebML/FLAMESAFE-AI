from typing import List, Dict, Any, Optional
from app.schemas.ranking import RankingWeights, FactorBreakdown, RankedInvestigationItem
from app.models.investigation import Investigation


class RelevanceScorer:
    """
    Computes scientific relevance ranking based on multi-factor weighted scoring:
    R = w_d * D + w_f * F + w_c * C + w_m * M + w_q * Q

    Where:
    - D = Research domain relevance (0 - 100)
    - F = Fuel type compatibility (0 - 100)
    - C = Experimental conditions compatibility (0 - 100)
    - M = Mission applicability (0 - 100)
    - Q = Evidence and metadata quality (0 - 100)
    """

    DEFAULT_WEIGHTS = RankingWeights()

    @classmethod
    def calculate_score(
        cls,
        investigation: Investigation,
        query: str,
        target_environment: Optional[str] = None,
        fuel_category: Optional[str] = None,
        weights: Optional[RankingWeights] = None,
    ) -> RankedInvestigationItem:
        w = weights or cls.DEFAULT_WEIGHTS
        q_lower = query.lower()
        env_lower = target_environment.lower() if target_environment else ""
        fuel_lower = fuel_category.lower() if fuel_category else ""

        matched_factors: List[str] = []
        missing_factors: List[str] = []

        # 1. Research Domain Relevance (D)
        domain_score = 50.0  # Base prior
        inv_domain = (investigation.research_area or "").lower()
        inv_title = (investigation.title or "").lower()
        inv_desc = (investigation.description or "").lower()

        keywords = [k for k in q_lower.split() if len(k) > 3]
        matches = sum(1 for kw in keywords if kw in inv_domain or kw in inv_title or kw in inv_desc)

        if matches > 0:
            domain_score = min(100.0, 60.0 + (matches * 15.0))
            matched_factors.append(f"Query terms matched research domain/title ({matches} keywords)")
        else:
            missing_factors.append("No explicit keyword matches in domain description")

        # 2. Fuel Type Compatibility (F)
        fuel_score = 40.0
        available_fuels = [
            (run.fuel_type or "").lower() + " " + (run.fuel_name or "").lower()
            for run in investigation.experimental_runs
        ]
        all_fuels_str = " ".join(available_fuels)

        if fuel_lower:
            if fuel_lower in all_fuels_str:
                fuel_score = 95.0
                matched_factors.append(f"Direct match with target fuel '{fuel_category}'")
            else:
                fuel_score = 25.0
                missing_factors.append(f"No experimental runs with fuel category '{fuel_category}'")
        elif any(f in q_lower for f in ["solid", "polymer", "pmma", "fabric", "cotton", "droplet", "gas"]):
            for f in ["solid", "polymer", "pmma", "fabric", "cotton", "droplet", "gas"]:
                if f in q_lower and f in all_fuels_str:
                    fuel_score = 85.0
                    matched_factors.append(f"Inferred fuel type '{f}' matched experimental data")
                    break
        else:
            fuel_score = 60.0  # neutral

        # 3. Experimental Conditions Compatibility (C)
        condition_score = 50.0
        has_pressure = any(r.pressure_value is not None for r in investigation.experimental_runs)
        has_airflow = any(r.airflow_velocity is not None for r in investigation.experimental_runs)
        has_oxygen = any(r.oxygen_concentration is not None for r in investigation.experimental_runs)

        cond_matches = sum([has_pressure, has_airflow, has_oxygen])
        condition_score = min(100.0, 30.0 + (cond_matches * 23.0))
        if cond_matches >= 2:
            matched_factors.append(f"Multi-parameter experimental conditions recorded ({cond_matches}/3 key parameters)")
        else:
            missing_factors.append("Incomplete experimental environmental conditions recorded")

        # 4. Mission Applicability (M)
        mission_score = 50.0
        meta = investigation.metadata_payload or {}
        target_envs = [e.lower() for e in meta.get("target_environments", [])]

        if env_lower:
            if env_lower in target_envs or any(env_lower in e for e in target_envs):
                mission_score = 95.0
                matched_factors.append(f"Explicit applicability to target environment '{target_environment}'")
            elif "spacecraft" in env_lower and "space station" in " ".join(target_envs):
                mission_score = 80.0
                matched_factors.append("Applicable orbital environment analogy")
            else:
                mission_score = 35.0
                missing_factors.append(f"Target environment '{target_environment}' not explicitly tested")
        else:
            mission_score = 65.0

        # 5. Metadata & Evidence Quality (Q)
        quality_score = 50.0
        has_doi = bool(investigation.doi)
        has_runs = len(investigation.experimental_runs) > 0
        has_docs = len(investigation.research_documents) > 0
        has_psi = bool(investigation.psi_id)

        quality_pts = sum([has_doi * 25, has_runs * 25, has_docs * 25, has_psi * 25])
        quality_score = float(quality_pts)
        if quality_score >= 75.0:
            matched_factors.append("High metadata completeness with verified DOI and PSI ID")
        else:
            missing_factors.append("Limited external citations or documentation records")

        # Total Weighted Relevance Score
        relevance_score = (
            w.domain_relevance * domain_score
            + w.fuel_compatibility * fuel_score
            + w.condition_compatibility * condition_score
            + w.mission_applicability * mission_score
            + w.metadata_quality * quality_score
        )
        relevance_score = round(min(100.0, max(0.0, relevance_score)), 2)

        factor_breakdown = FactorBreakdown(
            domain_score=round(domain_score, 1),
            fuel_score=round(fuel_score, 1),
            condition_score=round(condition_score, 1),
            mission_score=round(mission_score, 1),
            quality_score=round(quality_score, 1),
        )

        explanation = (
            f"Ranked {relevance_score}/100. Matches on {len(matched_factors)} factors: "
            + ("; ".join(matched_factors[:2]) if matched_factors else "General combustion relevance")
            + "."
        )

        return RankedInvestigationItem(
            investigation_id=str(investigation.id),
            psi_id=investigation.psi_id,
            acronym=investigation.acronym,
            title=investigation.title,
            research_area=investigation.research_area,
            relevance_score=relevance_score,
            factor_breakdown=factor_breakdown,
            matched_factors=matched_factors,
            missing_factors=missing_factors,
            explanation=explanation,
            supporting_evidence_count=len(investigation.research_documents),
        )
