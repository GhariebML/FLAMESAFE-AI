from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.investigation_repo import InvestigationRepository
from app.repositories.document_repo import DocumentRepository
from app.schemas.scenario import (
    ScenarioRequest,
    ScenarioAnalysisResponse,
    ConditionMatchReport,
    EvidenceSnippet,
)
from app.ingestion.normalizers.unit_normalizer import UnitNormalizer


class ScenarioService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.inv_repo = InvestigationRepository(session)
        self.doc_repo = DocumentRepository(session)

    async def analyze_scenario(self, req: ScenarioRequest) -> ScenarioAnalysisResponse:
        norm_press, press_unit = UnitNormalizer.normalize_pressure(req.pressure_value, req.pressure_unit)
        norm_flow, flow_unit = UnitNormalizer.normalize_velocity(req.airflow_velocity, req.airflow_unit)
        norm_o2 = UnitNormalizer.normalize_oxygen(req.oxygen_concentration)

        investigations, _ = await self.inv_repo.list_investigations(limit=50)

        env = req.environment.lower()
        is_partial_gravity = False
        if "lunar rover" in env:
            gravity_context = "Lunar Surface Mobile Rover (~0.166 g, compact enclosed cabin volume)"
            is_partial_gravity = True
        elif "lunar" in env:
            gravity_context = "Lunar Surface Habitat (~0.166 g / One-sixth terrestrial g)"
            is_partial_gravity = True
        elif "mars rover" in env:
            gravity_context = "Martian Surface Pressurized Rover (~0.38 g, vibration & dust-exposed seals)"
            is_partial_gravity = True
        elif "mars" in env:
            gravity_context = "Martian Surface Habitat (~0.38 g / Three-eighths terrestrial g)"
            is_partial_gravity = True
        elif "station" in env:
            gravity_context = "Long-Duration Orbital Space Station (~10^-6 g)"
        else:
            gravity_context = "Orbital Spacecraft Cabin (~10^-6 g)"

        # Dynamically evaluate against recorded runs in database
        all_o2 = []
        all_press = []
        all_flow = []
        matched_acronyms = []
        fuel_req = (req.fuel_type or "").lower()
        focus_req = (req.fire_safety_focus or "").lower()

        for inv in investigations:
            inv_match = False
            for r in inv.experimental_runs:
                if r.oxygen_concentration is not None:
                    all_o2.append(r.oxygen_concentration)
                if r.pressure_value is not None:
                    all_press.append(r.pressure_value)
                if r.airflow_velocity is not None:
                    all_flow.append(r.airflow_velocity)

                fuel_str = f"{r.fuel_type} {r.fuel_name}".lower()
                if fuel_req and any(tok in fuel_str for tok in fuel_req.split() if len(tok) > 2):
                    inv_match = True
            if focus_req and focus_req in (inv.research_area or "").lower():
                inv_match = True
            if inv_match and inv.acronym not in matched_acronyms:
                matched_acronyms.append(inv.acronym)

        if not matched_acronyms:
            matched_acronyms = ["BASS", "SAFFIRE", "SAME"]
        elif "SAFFIRE" not in matched_acronyms and ("habitat" in env or "spacecraft" in env):
            matched_acronyms.append("SAFFIRE")

        # 1. Gravity Regime Classification
        condition_matches: List[ConditionMatchReport] = [
            ConditionMatchReport(
                parameter="Gravity Regime",
                scenario_input=gravity_context,
                experimental_data_status="Extrapolated Regime" if is_partial_gravity else "Exact Match",
                notes=(
                    "Indexed NASA experiments (BASS, SAFFIRE, FLEX, SAME, ACME) were conducted in orbital microgravity (~0g). "
                    "Partial-gravity buoyant plume interactions at 0.166g or 0.38g require analytical Froude/Grashof scaling."
                    if is_partial_gravity
                    else "Directly matches orbital microgravity flight experiments aboard ISS and Cygnus."
                ),
            )
        ]

        # 2. Oxygen Concentration Classification
        if norm_o2 is None:
            o2_status = "Unsupported Condition"
            o2_note = "No oxygen concentration specified in scenario configuration."
        elif all_o2 and (min(all_o2) - 1.0) <= norm_o2 <= (max(all_o2) + 1.0):
            o2_status = "Exact Match"
            o2_note = f"Directly covered by empirical runs spanning {min(all_o2)}% to {max(all_o2)}% O2."
        elif 15.0 <= norm_o2 <= 36.0:
            o2_status = "Partial Match" if norm_o2 <= 25.0 else "Extrapolated Regime"
            o2_note = (
                "Exploration hypoxic/enriched oxygen atmosphere (28-34% O2) exceeds the 18.5%-21.0% O2 baseline "
                "in currently seeded runs; flame spread velocity increases non-linearly with O2 mole fraction."
            )
        else:
            o2_status = "Unsupported Condition"
            o2_note = f"Oxygen concentration ({norm_o2}% O2) lies outside supported spacecraft experimental bounds."

        condition_matches.append(
            ConditionMatchReport(
                parameter="Atmospheric Oxygen Concentration",
                scenario_input=f"{norm_o2}% O2" if norm_o2 is not None else "Not specified",
                experimental_data_status=o2_status,
                notes=o2_note,
            )
        )

        # 3. Cabin Pressure Classification
        if norm_press is None:
            p_status = "Unsupported Condition"
            p_note = "No atmospheric pressure specified."
        elif all_press and (min(all_press) - 3.0) <= norm_press <= (max(all_press) + 3.0):
            p_status = "Exact Match"
            p_note = f"Directly matches ISS/Cygnus pressure regime ({min(all_press)} - {max(all_press)} kPa)."
        elif 45.0 <= norm_press < 95.0:
            p_status = "Extrapolated Regime"
            p_note = "Reduced cabin pressure (e.g., 56.5 kPa exploration atmosphere) alters thermal diffusivity and radiative heat loss limits relative to 101.3 kPa baselines."
        else:
            p_status = "Unsupported Condition"
            p_note = f"Pressure ({norm_press} {press_unit}) is outside indexed experimental chamber envelopes."

        condition_matches.append(
            ConditionMatchReport(
                parameter="Cabin Pressure",
                scenario_input=f"{norm_press} {press_unit}" if norm_press is not None else "Not specified",
                experimental_data_status=p_status,
                notes=p_note,
            )
        )

        # 4. Ventilation Airflow Classification
        if norm_flow is None:
            f_status = "Unsupported Condition"
            f_note = "No ventilation velocity specified."
        elif all_flow and min(all_flow) <= norm_flow <= max(all_flow):
            f_status = "Exact Match"
            f_note = f"Directly bracketed by empirical forced-flow runs ({min(all_flow)} to {max(all_flow)} cm/s)."
        elif 0.0 <= norm_flow <= 35.0:
            f_status = "Partial Match"
            f_note = "Near empirical forced convection envelope; high flow rates transition from oxygen-supply enhancement to convective blowoff."
        else:
            f_status = "Unsupported Condition"
            f_note = f"Airflow velocity ({norm_flow} {flow_unit}) exceeds tested microgravity duct velocities."

        condition_matches.append(
            ConditionMatchReport(
                parameter="Ventilation Airflow",
                scenario_input=f"{norm_flow} {flow_unit}" if norm_flow is not None else "Not specified",
                experimental_data_status=f_status,
                notes=f_note,
            )
        )

        chunks = await self.doc_repo.get_all_chunks()
        evidence_snippets: List[EvidenceSnippet] = []
        for c in chunks:
            doc = c.document
            inv = doc.investigation if doc else None
            acronym = inv.acronym if inv else "NASA-PSI"
            if acronym in matched_acronyms or len(evidence_snippets) < 3:
                evidence_snippets.append(
                    EvidenceSnippet(
                        investigation_acronym=acronym,
                        document_title=doc.title if doc else "NASA Investigation Paper",
                        doi=doc.doi if doc else None,
                        page_number=c.page_number,
                        excerpt=c.chunk_text[:240] + ("..." if len(c.chunk_text) > 240 else ""),
                        relevance_rationale=(
                            f"Empirical benchmark from {acronym} ({c.section_name or 'Results'}) "
                            "documenting convective flow, oxygen limits, or post-burn aerosol behavior."
                        ),
                    )
                )
            if len(evidence_snippets) >= 4:
                break

        research_gaps = [
            f"Absence of long-duration physical combustion test points under genuine {gravity_context}.",
            "Limited empirical data coupling elevated oxygen (28-34% O2) with reduced cabin pressure (55-70 kPa) for thick composite polymers.",
            "Insufficient characterization of smoke aerosol coagulation mixed with electrostatic lunar/Martian regolith dust inside habitat airlocks.",
        ]

        scientific_limitations = [
            "Microgravity data (0g) lacks buoyant upward convection present in Lunar (0.166g) and Martian (0.38g) environments.",
            "Material flammability ratings based on terrestrial 1g upward flame tests (NASA-STD-6001) can be non-conservative in low-velocity forced ventilation.",
            "Analytical extrapolations do not replace physical verification in partial-gravity centrifuge facilities or lunar surface payloads.",
        ]

        recommended_directions = [
            "Conduct coupled pressure-oxygen flammability boundary mapping (LOC vs airflow velocity) for candidate habitat polymers.",
            "Calibrate multi-wavelength optical smoke detectors using SAME particle size distributions (0.35-0.45 microns) to prevent dust-induced false alarms.",
            "Incorporate SAFFIRE post-fire CO and particulate scrubbing decay time constants into emergency egress and cabin depressurization protocols.",
        ]

        scenario_summary = (
            f"Evaluated fire safety regime for '{req.environment}' ({gravity_context}) with target material "
            f"'{req.fuel_type or 'General Spacecraft Materials'}'. Cross-referenced {len(matched_acronyms)} NASA investigation programs "
            f"({', '.join(matched_acronyms)})."
        )

        return ScenarioAnalysisResponse(
            scenario_summary=scenario_summary,
            target_environment=req.environment,
            gravity_context=gravity_context,
            relevant_investigations=matched_acronyms,
            condition_matches=condition_matches,
            supporting_evidence=evidence_snippets,
            research_gaps=research_gaps,
            scientific_limitations=scientific_limitations,
            recommended_research_directions=recommended_directions,
        )
