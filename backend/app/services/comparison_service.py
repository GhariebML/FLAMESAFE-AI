from typing import List, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.investigation_repo import InvestigationRepository
from app.schemas.comparison import (
    ComparisonRequest,
    ComparisonResponse,
    InvestigationComparisonProfile,
    ParameterComparisonItem,
)
from app.core.exceptions import InvalidComparisonError


class ComparisonService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = InvestigationRepository(session)

    async def compare_investigations(self, req: ComparisonRequest) -> ComparisonResponse:
        if len(req.investigation_ids) < 2:
            raise InvalidComparisonError("At least 2 investigations are required for comparison.")

        investigations = await self.repo.get_by_ids(req.investigation_ids)
        if len(investigations) < len(req.investigation_ids):
            found_ids = (
                {str(i.id) for i in investigations}
                .union({i.psi_id for i in investigations})
                .union({i.acronym for i in investigations})
            )
            missing = [i for i in req.investigation_ids if i not in found_ids]
            raise InvalidComparisonError(f"Investigations not found: {missing}")

        profiles: List[InvestigationComparisonProfile] = []
        flame_spread_by_inv: Dict[str, str] = {}

        for inv in investigations:
            fuels = list({r.fuel_name for r in inv.experimental_runs if r.fuel_name})
            gravity = list({r.gravity_regime for r in inv.experimental_runs if r.gravity_regime})
            o2_vals = [r.oxygen_concentration for r in inv.experimental_runs if r.oxygen_concentration is not None]
            press_vals = [r.pressure_value for r in inv.experimental_runs if r.pressure_value is not None]
            flow_vals = [r.airflow_velocity for r in inv.experimental_runs if r.airflow_velocity is not None]

            sensors = set()
            spread_rates: List[float] = []
            total_meas_count = 0

            for r in inv.experimental_runs:
                if r.sensor_types:
                    sensors.update(r.sensor_types)
                for m in r.measurements:
                    total_meas_count += 1
                    if "flame spread rate" in m.metric_name.lower() and m.metric_value is not None and m.unit == "cm/s":
                        spread_rates.append(m.metric_value)

            if spread_rates:
                flame_spread_by_inv[inv.acronym] = (
                    f"{min(spread_rates)} - {max(spread_rates)} cm/s"
                    if len(spread_rates) > 1
                    else f"{spread_rates[0]} cm/s"
                )
            else:
                flame_spread_by_inv[inv.acronym] = "Not recorded"

            meta = inv.metadata_payload or {}
            limitations = []
            if "Microgravity Science Glovebox" in meta.get("facility", ""):
                limitations.append("Physical sample size limited by glovebox volume constraints")
            if "Uncrewed" in meta.get("platform", ""):
                limitations.append("Autonomous telemetry only; no direct crew intervention during burn")
            if not limitations:
                limitations.append("Microgravity (0g) baseline; does not include partial planetary gravity")

            numeric_metrics: Dict[str, Optional[float]] = {
                "avg_oxygen_pct": round(sum(o2_vals) / len(o2_vals), 2) if o2_vals else None,
                "avg_pressure_kpa": round(sum(press_vals) / len(press_vals), 2) if press_vals else None,
                "avg_airflow_cm_s": round(sum(flow_vals) / len(flow_vals), 2) if flow_vals else None,
                "max_flame_spread_cm_s": max(spread_rates) if spread_rates else None,
                "runs_count": float(len(inv.experimental_runs)),
                "measurements_count": float(total_meas_count),
                "sensor_diversity": float(len(sensors)),
            }

            profiles.append(
                InvestigationComparisonProfile(
                    id=str(inv.id),
                    psi_id=inv.psi_id,
                    acronym=inv.acronym,
                    title=inv.title,
                    research_area=inv.research_area,
                    gravity_regime=gravity[0] if gravity else "Microgravity",
                    primary_fuel_types=fuels or ["Not recorded"],
                    typical_oxygen_range=f"{min(o2_vals)}% - {max(o2_vals)}%" if o2_vals else "Not recorded",
                    typical_pressure_range=f"{min(press_vals)} - {max(press_vals)} kPa" if press_vals else "Not recorded",
                    typical_airflow_range=f"{min(flow_vals)} - {max(flow_vals)} cm/s" if flow_vals else "Not recorded",
                    measurement_capabilities=sorted(list(sensors)) if sensors else ["Optical Video", "Radiometry"],
                    identified_limitations=limitations,
                    doi=inv.doi,
                    numeric_metrics=numeric_metrics,
                )
            )

        matrix: List[ParameterComparisonItem] = [
            ParameterComparisonItem(
                parameter_name="research_area",
                display_name="Research Area & Domain",
                values_by_investigation={p.acronym: p.research_area for p in profiles},
                is_compatible_for_direct_diff=False,
                notes="Comparative domain categorization",
            ),
            ParameterComparisonItem(
                parameter_name="gravity_regime",
                display_name="Gravity Regime",
                values_by_investigation={p.acronym: p.gravity_regime for p in profiles},
                is_compatible_for_direct_diff=True,
                notes="All tests conducted under orbital microgravity conditions",
            ),
            ParameterComparisonItem(
                parameter_name="primary_fuels",
                display_name="Tested Fuel Types & Materials",
                values_by_investigation={p.acronym: ", ".join(p.primary_fuel_types) for p in profiles},
                is_compatible_for_direct_diff=False,
                notes="Materials vary between solid polymers, fabrics, liquid droplets, wire insulation, and gases",
            ),
            ParameterComparisonItem(
                parameter_name="oxygen_concentration",
                display_name="Oxygen Concentration Range",
                unit="% O2",
                values_by_investigation={p.acronym: p.typical_oxygen_range for p in profiles},
                is_compatible_for_direct_diff=True,
                notes="Normalized volume percentage (% O2)",
            ),
            ParameterComparisonItem(
                parameter_name="pressure_range",
                display_name="Chamber Atmospheric Pressure",
                unit="kPa",
                values_by_investigation={p.acronym: p.typical_pressure_range for p in profiles},
                is_compatible_for_direct_diff=True,
                notes="Standardized to kilopascals (kPa)",
            ),
            ParameterComparisonItem(
                parameter_name="airflow_velocity",
                display_name="Forced Airflow Velocity",
                unit="cm/s",
                values_by_investigation={p.acronym: p.typical_airflow_range for p in profiles},
                is_compatible_for_direct_diff=True,
                notes="Standardized forced ventilation velocity (cm/s)",
            ),
            ParameterComparisonItem(
                parameter_name="flame_spread_rate",
                display_name="Measured Flame Spread Rate",
                unit="cm/s",
                values_by_investigation=flame_spread_by_inv,
                is_compatible_for_direct_diff=True,
                notes="Only directly comparable across solid fuel spread tests; 'Not recorded' for droplet/smoke/gas regimes",
            ),
        ]

        summary = (
            f"Comparing {len(profiles)} NASA investigations: "
            + ", ".join([f"{p.acronym} ({p.research_area})" for p in profiles])
            + ". Quantitative parameters have been normalized to standard SI/aerospace units (% O2, kPa, cm/s); missing metrics remain explicitly labeled as 'Not recorded'."
        )

        comparison_limitations = [
            "Direct numerical difference is only valid across identical fuel phases and sample geometries.",
            "Missing parameters are marked as 'Not recorded' and are never coerced to zero.",
            "Experiments conducted in orbital microgravity (ISS/Cygnus) do not account for Lunar (0.166g) or Martian (0.38g) partial gravity.",
        ]

        return ComparisonResponse(
            investigations=profiles,
            parameter_matrix=matrix,
            scientific_summary=summary,
            comparison_limitations=comparison_limitations,
        )
