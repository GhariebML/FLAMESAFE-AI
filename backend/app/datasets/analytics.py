"""Scientific Analytical Data Workspace powered by Pandas & NumPy (Priority 9).
Provides:
- Descriptive statistics (mean, std, min, median, IQR, max)
- Group-by analysis (by investigation, fuel/material, or parameter)
- Distribution summaries (quantiles & histogram bins)
- Missing value analysis
- Unit-aware comparison guardrails (never compares incompatible units or parameters without normalization)
- Dataset filtering
- Explicit DERIVED_METRIC and ANALYTICAL_INFERENCE labeling with non-causality notice.
"""

from typing import Any

import numpy as np
import pandas as pd

from app.datasets.engine import UnitNormalizer
from app.models.multi_agent import DatasetItem, DatasetVersion


class DatasetAnalyticalEngine:
    """Executes deterministic Pandas & NumPy analysis over canonical FlameSafe DatasetVersions."""

    MANDATORY_CAUSALITY_DISCLAIMER = (
        "ANALYTICAL_INFERENCE NOTICE: Descriptive statistics and group-by comparisons represent "
        "DERIVED_METRIC summaries over observational microgravity experiments. Statistical differences or "
        "correlations across campaigns do NOT establish physical causality without controlled boundary conditions."
    )

    @staticmethod
    def _items_to_dataframe(items: list[DatasetItem]) -> pd.DataFrame:
        rows = [
            {
                "row_index": idx,
                "investigation_acronym": it.investigation_acronym,
                "run_name": it.run_name,
                "fuel_type": it.fuel_type,
                "gravity_regime": it.gravity_regime,
                "oxygen_pct": it.oxygen_pct,
                "pressure_kpa": it.pressure_kpa,
                "airflow_cm_s": it.airflow_cm_s,
                "parameter_name": it.parameter_name,
                "original_value": it.original_value,
                "original_unit": it.original_unit,
                "normalized_value": it.normalized_value,
                "normalized_unit": it.normalized_unit,
                "uncertainty": it.uncertainty,
                "validation_status": it.validation_status,
                "source_doi": it.source_doi,
                "section_name": it.section_name,
            }
            for idx, it in enumerate(items, start=1)
        ]
        if not rows:
            return pd.DataFrame(
                columns=[
                    "row_index",
                    "investigation_acronym",
                    "run_name",
                    "fuel_type",
                    "gravity_regime",
                    "oxygen_pct",
                    "pressure_kpa",
                    "airflow_cm_s",
                    "parameter_name",
                    "original_value",
                    "original_unit",
                    "normalized_value",
                    "normalized_unit",
                    "uncertainty",
                    "validation_status",
                    "source_doi",
                    "section_name",
                ]
            )
        return pd.DataFrame(rows)

    @classmethod
    def run_analytics(
        cls,
        version: DatasetVersion,
        filter_investigation: str | None = None,
        filter_parameter: str | None = None,
        filter_material: str | None = None,
        group_by_column: str = "investigation_acronym",
        compare_parameter: str | None = None,
    ) -> dict[str, Any]:
        """Runs Pandas/NumPy analytical pipeline with unit-compatibility guardrails."""
        df = cls._items_to_dataframe(list(version.items or []))
        total_unfiltered = int(len(df))

        if not df.empty:
            if filter_investigation:
                df = df[df["investigation_acronym"].str.upper() == filter_investigation.strip().upper()]
            if filter_parameter:
                norm_fp = filter_parameter.strip().lower().replace(" ", "_")
                df = df[df["parameter_name"].str.lower().str.replace(" ", "_") == norm_fp]
            if filter_material:
                df = df[df["fuel_type"].str.lower().str.contains(filter_material.strip().lower(), na=False)]

        filtered_count = int(len(df))

        # 1. Missing value analysis across columns
        missing_analysis: dict[str, dict[str, Any]] = {}
        if filtered_count > 0:
            for col in [
                "oxygen_pct",
                "pressure_kpa",
                "airflow_cm_s",
                "normalized_value",
                "uncertainty",
                "source_doi",
            ]:
                null_cnt = int(df[col].isna().sum())
                missing_analysis[col] = {
                    "missing_count": null_cnt,
                    "present_count": filtered_count - null_cnt,
                    "missing_pct": round((null_cnt / filtered_count) * 100.0, 2),
                }

        # 2. Unit-aware descriptive statistics per (parameter_name, normalized_unit)
        descriptive_stats: list[dict[str, Any]] = []
        distribution_summaries: list[dict[str, Any]] = []

        if filtered_count > 0:
            valid_df = df[df["normalized_value"].notna()].copy()
            if not valid_df.empty:
                for (param_name, norm_unit), grp in valid_df.groupby(
                    ["parameter_name", "normalized_unit"], dropna=False
                ):
                    vals = grp["normalized_value"].astype(float).to_numpy()
                    if vals.size == 0:
                        continue
                    q25, q50, q75 = np.percentile(vals, [25, 50, 75])
                    std_val = float(np.std(vals, ddof=1)) if vals.size > 1 else 0.0
                    descriptive_stats.append(
                        {
                            "parameter_name": str(param_name),
                            "normalized_unit": str(norm_unit or ""),
                            "sample_count": int(vals.size),
                            "mean": round(float(np.mean(vals)), 4),
                            "std": round(std_val, 4),
                            "min": round(float(np.min(vals)), 4),
                            "q25": round(float(q25), 4),
                            "median": round(float(q50), 4),
                            "q75": round(float(q75), 4),
                            "iqr": round(float(q75 - q25), 4),
                            "max": round(float(np.max(vals)), 4),
                            "label": "DERIVED_METRIC",
                        }
                    )

                    counts, bin_edges = np.histogram(vals, bins=min(4, max(1, int(vals.size))))
                    distribution_summaries.append(
                        {
                            "parameter_name": str(param_name),
                            "normalized_unit": str(norm_unit or ""),
                            "bin_counts": [int(c) for c in counts.tolist()],
                            "bin_edges": [round(float(e), 4) for e in bin_edges.tolist()],
                            "label": "DERIVED_METRIC",
                        }
                    )

        # 3. Group-by analysis (always partitioned by parameter_name + normalized_unit + group_by_column)
        col_map = {
            "investigation_acronym": "investigation_acronym",
            "material_or_fuel": "fuel_type",
            "fuel_type": "fuel_type",
            "validation_status": "validation_status",
        }
        g_col = col_map.get(group_by_column, "investigation_acronym")
        group_by_results: list[dict[str, Any]] = []
        if filtered_count > 0:
            valid_df = df[df["normalized_value"].notna()].copy()
            if not valid_df.empty:
                for (g_val, p_name, n_unit), grp in valid_df.groupby(
                    [g_col, "parameter_name", "normalized_unit"], dropna=False
                ):
                    vals = grp["normalized_value"].astype(float).to_numpy()
                    if vals.size == 0:
                        continue
                    group_by_results.append(
                        {
                            "group_by_column": g_col,
                            "group_value": str(g_val),
                            "parameter_name": str(p_name),
                            "normalized_unit": str(n_unit or ""),
                            "count": int(vals.size),
                            "mean": round(float(np.mean(vals)), 4),
                            "min": round(float(np.min(vals)), 4),
                            "max": round(float(np.max(vals)), 4),
                            "label": "DERIVED_METRIC",
                        }
                    )

        # 4. Unit-Aware Comparison Guardrail check
        unit_comparison_check: dict[str, Any] = {
            "status": "UNIT_COMPATIBLE",
            "compared_parameter": compare_parameter or filter_parameter or "ALL_SEPARATED_BY_PARAMETER",
            "message": "All statistics are strictly partitioned by canonical parameter_name and normalized SI unit.",
            "label": "ANALYTICAL_INFERENCE",
        }
        if compare_parameter:
            norm_cp = compare_parameter.strip().lower().replace(" ", "_")
            sub = df[df["parameter_name"].str.lower().str.replace(" ", "_") == norm_cp]
            if sub.empty:
                unit_comparison_check = {
                    "status": "PARAMETER_NOT_FOUND",
                    "compared_parameter": compare_parameter,
                    "message": f"Parameter '{compare_parameter}' is not present in the filtered dataset.",
                    "label": "ANALYTICAL_INFERENCE",
                }
            else:
                distinct_units = [str(u) for u in sub["normalized_unit"].dropna().unique().tolist()]
                if len(distinct_units) > 1:
                    unit_comparison_check = {
                        "status": "INCOMPATIBLE_UNITS_BLOCKED",
                        "compared_parameter": compare_parameter,
                        "distinct_units_detected": distinct_units,
                        "message": (
                            f"Blocked direct pooling across incompatible units {distinct_units} for '{compare_parameter}'. "
                            "Unit normalization is required prior to cross-run aggregation."
                        ),
                        "label": "ANALYTICAL_INFERENCE",
                    }

        return {
            "dataset_id": version.dataset_id,
            "version_id": version.id,
            "version_tag": version.version_tag,
            "total_unfiltered_records": total_unfiltered,
            "filtered_record_count": filtered_count,
            "applied_filters": {
                "investigation_acronym": filter_investigation,
                "parameter_name": filter_parameter,
                "material_or_fuel": filter_material,
                "group_by_column": g_col,
            },
            "metric_classification": "DERIVED_METRIC",
            "inference_classification": "ANALYTICAL_INFERENCE",
            "causality_disclaimer": cls.MANDATORY_CAUSALITY_DISCLAIMER,
            "unit_comparison_check": unit_comparison_check,
            "descriptive_statistics": descriptive_stats,
            "group_by_summary": group_by_results,
            "distribution_summaries": distribution_summaries,
            "missing_value_analysis": missing_analysis,
        }

    @staticmethod
    def verify_unit_compatible_comparison(
        param_a: str,
        unit_a: str,
        param_b: str,
        unit_b: str,
    ) -> dict[str, Any]:
        """Explicit guardrail verifying whether two measurements can be directly compared."""
        p_a = (param_a or "").strip().lower()
        p_b = (param_b or "").strip().lower()
        if p_a != p_b:
            return {
                "compatible": False,
                "reason": "INCOMPATIBLE_PARAMETERS",
                "message": f"Cannot directly compare '{p_a}' with '{p_b}'.",
            }

        _, norm_unit_a = UnitNormalizer.normalize(1.0, unit_a)
        _, norm_unit_b = UnitNormalizer.normalize(1.0, unit_b)
        if p_a in ("flame_spread_rate", "burn_rate"):
            if norm_unit_a == "cm/s":
                norm_unit_a = "mm/s"
            if norm_unit_b == "cm/s":
                norm_unit_b = "mm/s"

        if norm_unit_a != norm_unit_b:
            return {
                "compatible": False,
                "reason": "INCOMPATIBLE_UNITS",
                "message": (
                    f"Cannot directly compare unnormalized unit '{unit_a}' ({norm_unit_a}) "
                    f"with '{unit_b}' ({norm_unit_b})."
                ),
            }
        return {
            "compatible": True,
            "canonical_parameter": p_a,
            "canonical_unit": norm_unit_a,
            "message": "Parameters and normalized SI units are compatible for quantitative comparison.",
        }
