from app.models.investigation import Investigation
from app.rag.citations import CitationValidator
from app.schemas.ranking import FactorBreakdown, RankedInvestigationItem, RankingWeights


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
        target_environment: str | None = None,
        fuel_category: str | None = None,
        weights: RankingWeights | None = None,
    ) -> RankedInvestigationItem:
        w = weights.normalized() if weights else cls.DEFAULT_WEIGHTS
        q_lower = (query or "").lower()
        env_lower = target_environment.lower() if target_environment else ""
        fuel_lower = fuel_category.lower() if fuel_category else ""

        matched_factors: list[str] = []
        missing_factors: list[str] = []

        # 1. Research Domain Relevance (D)
        inv_domain = (investigation.research_area or "").lower()
        inv_title = (investigation.title or "").lower()
        inv_desc = (investigation.description or "").lower()
        inv_objectives = (investigation.objectives or "").lower()

        keywords = [k for k in q_lower.split() if len(k) > 2]
        matches = sum(
            1 for kw in keywords if kw in inv_domain or kw in inv_title or kw in inv_desc or kw in inv_objectives
        )

        if matches > 0:
            domain_score = min(100.0, 50.0 + (matches * 15.0))
            matched_factors.append(f"Query terms matched research domain/title/objectives ({matches} keywords)")
        else:
            if any(term in inv_domain for term in ["combustion", "fire", "flame", "flammability", "smoke"]):
                domain_score = 35.0
            else:
                domain_score = 15.0
            missing_factors.append("No explicit keyword matches in domain description or objectives")

        # 2. Fuel Type Compatibility (F)
        runs = list(investigation.experimental_runs or [])
        available_fuels = [f"{(run.fuel_type or '').lower()} {(run.fuel_name or '').lower()}".strip() for run in runs]
        all_fuels_str = " ".join(available_fuels).strip()

        if not runs:
            fuel_score = 10.0
            missing_factors.append("No experimental runs or fuel samples recorded")
        elif fuel_lower:
            if fuel_lower in all_fuels_str:
                fuel_score = 95.0
                matched_factors.append(f"Direct match with target fuel '{fuel_category}'")
            elif any(syn in all_fuels_str for syn in fuel_lower.split() if len(syn) > 3):
                fuel_score = 75.0
                matched_factors.append(f"Partial fuel category match for '{fuel_category}'")
            else:
                fuel_score = 25.0
                missing_factors.append(f"No experimental runs with fuel category '{fuel_category}'")
        else:
            inferred_fuel = None
            for f in [
                "solid polymer",
                "solid",
                "polymer",
                "pmma",
                "fabric",
                "cotton",
                "nomex",
                "droplet",
                "heptane",
                "methanol",
                "gas",
                "methane",
                "propane",
            ]:
                if f in q_lower and f in all_fuels_str:
                    inferred_fuel = f
                    break

            if inferred_fuel:
                fuel_score = 85.0
                matched_factors.append(f"Inferred fuel type '{inferred_fuel}' matched experimental runs")
            elif all_fuels_str:
                fuel_score = 55.0
            else:
                fuel_score = 20.0
                missing_factors.append("No specific fuel types recorded in runs")

        # 3. Experimental Conditions Compatibility (C)
        if not runs:
            condition_score = 0.0
            missing_factors.append("No experimental runs recorded for condition analysis")
        else:
            has_pressure = any(r.pressure_value is not None for r in runs)
            has_airflow = any(r.airflow_velocity is not None for r in runs)
            has_oxygen = any(r.oxygen_concentration is not None for r in runs)

            recorded_params = []
            if has_pressure:
                recorded_params.append("chamber pressure")
            if has_airflow:
                recorded_params.append("forced airflow")
            if has_oxygen:
                recorded_params.append("oxygen concentration")

            cond_matches = len(recorded_params)
            condition_score = min(100.0, 25.0 + (cond_matches * 25.0))
            if cond_matches >= 2:
                matched_factors.append(
                    f"Environmental conditions documented: {', '.join(recorded_params)} ({cond_matches}/3 key parameters)"
                )
            elif cond_matches == 1:
                matched_factors.append(f"Single environmental condition documented: {recorded_params[0]}")
                missing_factors.append("Partial experimental environmental conditions recorded (1/3 key parameters)")
            else:
                missing_factors.append("Zero key environmental parameters recorded in experimental runs")

        # 4. Mission Applicability (M)
        meta = investigation.metadata_payload or {}
        target_envs = [str(e).lower() for e in meta.get("target_environments", [])]

        if env_lower:
            if env_lower in target_envs or any(env_lower in e for e in target_envs):
                mission_score = 95.0
                matched_factors.append(f"Explicit applicability to target environment '{target_environment}'")
            elif ("spacecraft" in env_lower or "station" in env_lower) and any(
                "station" in e or "spacecraft" in e or "iss" in e for e in target_envs
            ):
                mission_score = 80.0
                matched_factors.append("Applicable orbital spacecraft environment analogy")
            elif ("lunar" in env_lower or "moon" in env_lower or "mars" in env_lower) and any(
                "lunar" in e or "mars" in e for e in target_envs
            ):
                mission_score = 90.0
                matched_factors.append(f"Applicable surface planetary environment '{target_environment}'")
            else:
                mission_score = 25.0
                missing_factors.append(f"Target environment '{target_environment}' not explicitly tested")
        else:
            inferred_env = None
            for env_candidate in ["spacecraft", "iss", "lunar", "moon", "mars"]:
                if env_candidate in q_lower:
                    inferred_env = env_candidate
                    break
            if inferred_env and any(inferred_env in e for e in target_envs):
                mission_score = 85.0
                matched_factors.append(f"Inferred environment '{inferred_env}' matched investigation scope")
            elif target_envs:
                mission_score = 65.0
            else:
                mission_score = 45.0

        # 5. Metadata & Evidence Quality (Q)
        has_doi = CitationValidator.is_valid_doi(investigation.doi)
        has_psi = bool(
            investigation.psi_id and investigation.psi_id != "PSI-UNKNOWN" and investigation.psi_id.startswith("PSI-")
        )
        has_runs = len(runs) > 0
        docs = list(investigation.research_documents or [])
        has_docs = len(docs) > 0

        quality_pts = sum([has_doi * 25, has_runs * 25, has_docs * 25, has_psi * 25])
        quality_score = float(quality_pts)

        quality_details = []
        if has_doi:
            quality_details.append("valid DOI")
        if has_psi:
            quality_details.append("canonical PSI ID")
        if has_runs:
            quality_details.append(f"{len(runs)} experimental runs")
        if has_docs:
            quality_details.append(f"{len(docs)} research documents")

        if quality_score >= 75.0:
            matched_factors.append(f"High metadata completeness: {', '.join(quality_details)}")
        elif quality_score >= 50.0:
            matched_factors.append(f"Moderate metadata completeness: {', '.join(quality_details)}")
            missing_factors.append("Missing verified external DOI or canonical PSI registration")
        else:
            missing_factors.append("Limited external citations, runs, or documentation records")

        # Total Weighted Relevance Score Calculation: R = w_d*D + w_f*F + w_c*C + w_m*M + w_q*Q
        domain_weighted = round(w.domain_relevance * domain_score, 2)
        fuel_weighted = round(w.fuel_compatibility * fuel_score, 2)
        condition_weighted = round(w.condition_compatibility * condition_score, 2)
        mission_weighted = round(w.mission_applicability * mission_score, 2)
        quality_weighted = round(w.metadata_quality * quality_score, 2)

        total_score = domain_weighted + fuel_weighted + condition_weighted + mission_weighted + quality_weighted
        relevance_score = round(min(100.0, max(0.0, total_score)), 2)

        factor_breakdown = FactorBreakdown(
            domain_score=round(domain_score, 1),
            fuel_score=round(fuel_score, 1),
            condition_score=round(condition_score, 1),
            mission_score=round(mission_score, 1),
            quality_score=round(quality_score, 1),
            domain_weighted=domain_weighted,
            fuel_weighted=fuel_weighted,
            condition_weighted=condition_weighted,
            mission_weighted=mission_weighted,
            quality_weighted=quality_weighted,
        )

        explanation = (
            f"Relevance Score: {relevance_score:.1f}/100 [Domain: {domain_score:.1f} (w={w.domain_relevance:.2f}), "
            f"Fuel: {fuel_score:.1f} (w={w.fuel_compatibility:.2f}), "
            f"Conditions: {condition_score:.1f} (w={w.condition_compatibility:.2f}), "
            f"Mission: {mission_score:.1f} (w={w.mission_applicability:.2f}), "
            f"Quality: {quality_score:.1f} (w={w.metadata_quality:.2f})]. "
            + ("; ".join(matched_factors[:2]) if matched_factors else "General research alignment")
            + "."
        )

        return RankedInvestigationItem(
            investigation_id=str(investigation.id or "unknown-id"),
            psi_id=investigation.psi_id or "PSI-UNKNOWN",
            acronym=investigation.acronym or "UNKNOWN",
            title=investigation.title or "Untitled Investigation",
            research_area=investigation.research_area or "Combustion Science",
            relevance_score=relevance_score,
            factor_breakdown=factor_breakdown,
            matched_factors=matched_factors,
            missing_factors=missing_factors,
            explanation=explanation,
            supporting_evidence_count=len(docs),
            doi=investigation.doi,
            measurement_completeness=100.0,
        )
