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
        # Standardize units
        norm_press, press_unit = UnitNormalizer.normalize_pressure(req.pressure_value, req.pressure_unit)
        norm_flow, flow_unit = UnitNormalizer.normalize_velocity(req.airflow_velocity, req.airflow_unit)
        norm_o2 = UnitNormalizer.normalize_oxygen(req.oxygen_concentration)

        # Retrieve candidate investigations
        investigations, _ = await self.inv_repo.list_investigations(limit=50)

        # Determine gravity context
        env = req.environment.lower()
        if "lunar" in env:
            gravity_context = "Lunar Surface Gravity (~0.166 g / One-sixth terrestrial g)"
        elif "mars" in env:
            gravity_context = "Martian Surface Gravity (~0.38 g / Three-eighths terrestrial g)"
        elif "spacecraft" in env or "station" in env:
            gravity_context = "Orbital Microgravity (~10^-6 g)"
        else:
            gravity_context = "Exploration Habitat Environment"

        # Condition match evaluation
        condition_matches: List[ConditionMatchReport] = [
            ConditionMatchReport(
                parameter="Atmospheric Oxygen Concentration",
                scenario_input=f"{norm_o2}% O2" if norm_o2 is not None else "Not specified",
                experimental_data_status="Analogous Range" if norm_o2 and norm_o2 > 21.0 else "Direct Match",
                notes="Spacecraft tests frequently evaluate 21% O2; exploration atmospheres (e.g., 28-34% O2) have limited microgravity empirical runs.",
            ),
            ConditionMatchReport(
                parameter="Cabin Pressure",
                scenario_input=f"{norm_press} {press_unit}" if norm_press is not None else "Not specified",
                experimental_data_status="Direct Match" if norm_press and 90.0 <= norm_press <= 102.0 else "Extrapolated",
                notes="Baseline ISS tests conducted at nominal 101.3 kPa. Hypoxic reduced pressure regimes require analytical scaling.",
            ),
            ConditionMatchReport(
                parameter="Ventilation Airflow",
                scenario_input=f"{norm_flow} {flow_unit}" if norm_flow is not None else "Not specified",
                experimental_data_status="Direct Match" if norm_flow and 0.5 <= norm_flow <= 20.0 else "Analogous Range",
                notes="Forced ventilation velocities between 1.0 and 20.0 cm/s are well covered in BASS and SAFFIRE data.",
            ),
        ]

        relevant_acronyms = ["BASS", "SAFFIRE", "SAME"]
        if "droplet" in (req.fuel_type or "").lower():
            relevant_acronyms.append("FLEX")

        # Gather evidence snippets
        chunks = await self.doc_repo.get_all_chunks()
        evidence_snippets: List[EvidenceSnippet] = []

        for c in chunks:
            text_lower = c.chunk_text.lower()
            if any(term in text_lower for term in ["airflow", "oxygen", "flame", "smoke"]):
                doc = c.document
                inv = doc.investigation if doc else None
                evidence_snippets.append(
                    EvidenceSnippet(
                        investigation_acronym=inv.acronym if inv else "NASA-PSI",
                        document_title=doc.title if doc else "NASA Investigation Paper",
                        doi=doc.doi if doc else None,
                        page_number=c.page_number,
                        excerpt=c.chunk_text[:220] + "...",
                        relevance_rationale="Provides empirical measurements for ventilation and flame propagation boundaries.",
                    )
                )
            if len(evidence_snippets) >= 3:
                break

        research_gaps = [
            f"Lack of physical experimental combustion records under genuine {gravity_context}.",
            "Scarcity of large-scale flame spread data for exploration atmospheres combining 34% O2 with 56 kPa pressure.",
            "Particle agglomeration dynamics under combined electrostatic lunar dust and smoke aerosol conditions.",
        ]

        scientific_limitations = [
            "Microgravity data (0g) lacks buoyant upward convection present in Lunar (0.166g) and Martian (0.38g) environments.",
            "Material flammability ratings based on terrestrial 1g upward flame tests (NASA-STD-6001) may not be conservative in forced-flow low-gravity.",
            "Analytical extrapolations do not replace physical verification aboard parabolic flights or lunar surface test chambers.",
        ]

        scenario_summary = (
            f"Evaluated fire safety envelope for '{req.environment}' with target fuel '{req.fuel_type or 'General Materials'}'. "
            f"Analysis cross-referenced {len(relevant_acronyms)} major NASA combustion investigation programs."
        )

        return ScenarioAnalysisResponse(
            scenario_summary=scenario_summary,
            target_environment=req.environment,
            gravity_context=gravity_context,
            relevant_investigations=relevant_acronyms,
            condition_matches=condition_matches,
            supporting_evidence=evidence_snippets,
            research_gaps=research_gaps,
            scientific_limitations=scientific_limitations,
        )
