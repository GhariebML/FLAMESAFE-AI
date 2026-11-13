"""Advanced Dataset Quality Framework, Lineage Explorer, and Version Diff Engine (Priority 8).
Provides deterministic, scientifically transparent metrics and end-to-end provenance tracing:
Dataset Item -> Experimental Run -> Investigation (internal_catalog_id + source_record_id) ->
Source Document -> Page / Table / Section -> Original Source FileAsset (SHA-256).
"""

from typing import Any

from app.connectors.psi.discovery import PSIDiscoveryService
from app.models.multi_agent import DatasetItem, DatasetVersion


class DatasetQualityAndLineageService:
    """Deterministic coverage analysis, end-to-end lineage tracing, and version diff calculation."""

    CORE_FIELDS = [
        "investigation_acronym",
        "run_name",
        "fuel_type",
        "parameter_name",
        "normalized_value",
        "normalized_unit",
        "source_doi",
    ]

    @classmethod
    def compute_coverage_analysis(cls, version: DatasetVersion) -> dict[str, Any]:
        """Computes transparent, deterministic coverage and quality metrics for a DatasetVersion."""
        items: list[DatasetItem] = list(version.items or [])
        total = len(items)
        if total == 0:
            return {
                "dataset_id": version.dataset_id,
                "version_id": version.id,
                "version_tag": version.version_tag,
                "total_records": 0,
                "field_completeness": 0.0,
                "measurement_coverage": 0.0,
                "source_provenance_coverage": 0.0,
                "doi_availability": 0.0,
                "page_reference_coverage": 0.0,
                "unit_consistency": 0.0,
                "duplicate_rate": 0.0,
                "missing_measurement_rate": 100.0,
                "overall_quality_score": 0.0,
                "validation_status_breakdown": {"PASS": 0, "PASSED": 0, "WARNING": 0, "REJECTED": 0},
                "field_level_completeness": {},
                "parameter_coverage": {},
            }

        field_counts: dict[str, int] = {f: 0 for f in cls.CORE_FIELDS}
        for item in items:
            for f in cls.CORE_FIELDS:
                val = getattr(item, f, None)
                if val is not None and str(val).strip() != "":
                    field_counts[f] += 1

        field_level = {
            f: round((cnt / total) * 100.0, 2)
            for f, cnt in field_counts.items()
        }
        field_completeness = round(sum(field_level.values()) / len(cls.CORE_FIELDS), 2)

        with_measurement = sum(
            1 for it in items if it.normalized_value is not None or it.original_value is not None
        )
        measurement_coverage = round((with_measurement / total) * 100.0, 2)
        missing_measurement_rate = round(100.0 - measurement_coverage, 2)

        with_provenance = sum(
            1
            for it in items
            if (it.source_doi or it.source_url or it.source_document_id) and it.investigation_acronym
        )
        source_provenance_coverage = round((with_provenance / total) * 100.0, 2)

        doi_count = 0
        page_ref_count = 0
        unit_map: dict[str, set[str]] = {}
        seen_signatures: set[tuple[Any, ...]] = set()
        duplicate_count = 0
        status_breakdown: dict[str, int] = {"PASSED": 0, "WARNING": 0, "REJECTED": 0}
        param_counts: dict[str, int] = {}

        for it in items:
            status = (it.validation_status or "PASSED").upper()
            if status == "PASS":
                status = "PASSED"
            status_breakdown[status] = status_breakdown.get(status, 0) + 1

            p_name = it.parameter_name or "unknown"
            param_counts[p_name] = param_counts.get(p_name, 0) + 1
            if it.normalized_unit:
                unit_map.setdefault(p_name, set()).add(it.normalized_unit)

            cat = PSIDiscoveryService.get_investigation_by_id(it.investigation_acronym or "")
            has_doi = (
                bool(it.source_doi and "10." in str(it.source_doi))
                or bool(cat and (cat.get("publication_dois") or cat.get("dataset_doi")))
            )
            if has_doi:
                doi_count += 1

            if it.page_number is not None or (it.section_name and str(it.section_name).strip() != ""):
                page_ref_count += 1

            sig = (
                it.investigation_acronym,
                it.run_name,
                it.parameter_name,
                it.normalized_value,
                it.normalized_unit,
            )
            if sig in seen_signatures:
                duplicate_count += 1
            else:
                seen_signatures.add(sig)

        doi_availability = round((doi_count / total) * 100.0, 2)
        page_reference_coverage = round((page_ref_count / total) * 100.0, 2)

        consistent_params = sum(1 for p, u_set in unit_map.items() if len(u_set) <= 1)
        unit_consistency = (
            round((consistent_params / len(unit_map)) * 100.0, 2) if unit_map else 100.0
        )
        duplicate_rate = round((duplicate_count / total) * 100.0, 2)

        overall_quality = round(
            0.25 * field_completeness
            + 0.20 * measurement_coverage
            + 0.20 * source_provenance_coverage
            + 0.15 * unit_consistency
            + 0.10 * doi_availability
            + 0.10 * max(0.0, 100.0 - duplicate_rate),
            2,
        )

        return {
            "dataset_id": version.dataset_id,
            "version_id": version.id,
            "version_tag": version.version_tag,
            "total_records": total,
            "field_completeness": field_completeness,
            "measurement_coverage": measurement_coverage,
            "source_provenance_coverage": source_provenance_coverage,
            "doi_availability": doi_availability,
            "page_reference_coverage": page_reference_coverage,
            "unit_consistency": unit_consistency,
            "duplicate_rate": duplicate_rate,
            "missing_measurement_rate": missing_measurement_rate,
            "overall_quality_score": overall_quality,
            "quality_formula": (
                "Q = 0.25*field_completeness + 0.20*measurement_coverage + 0.20*source_provenance_coverage "
                "+ 0.15*unit_consistency + 0.10*doi_availability + 0.10*(100 - duplicate_rate)"
            ),
            "validation_status_breakdown": status_breakdown,
            "field_level_completeness": field_level,
            "parameter_coverage": param_counts,
        }

    @classmethod
    def trace_lineage(cls, version: DatasetVersion) -> dict[str, Any]:
        """Traces each DatasetItem across the 6-hop provenance chain required by Priority 8:
        Dataset Item -> Experimental Run -> Investigation -> Source Document -> Page/Table/Section -> Original Source.
        """
        items: list[DatasetItem] = list(version.items or [])
        lineage_nodes: list[dict[str, Any]] = []
        file_hashes = version.file_hashes or {}

        for idx, it in enumerate(items, start=1):
            acronym = it.investigation_acronym or "UNKNOWN"
            cat = PSIDiscoveryService.get_investigation_by_id(acronym) or {}
            internal_cat_id = cat.get("internal_catalog_id") or f"FS-CAT-{acronym}"
            official_psi_id = cat.get("source_record_id")
            pub_dois = cat.get("publication_dois") or ([it.source_doi] if it.source_doi else [])
            dataset_doi = cat.get("dataset_doi")
            source_url = it.source_url or cat.get("source_url") or "https://psi.nasa.gov/physci/repo"

            lineage_nodes.append(
                {
                    "item_id": it.id,
                    "row_index": idx,
                    "parameter_name": it.parameter_name,
                    "normalized_value": it.normalized_value,
                    "normalized_unit": it.normalized_unit,
                    "validation_status": it.validation_status,
                    "provenance_chain": {
                        "step_1_dataset_item": {
                            "item_id": it.id,
                            "dataset_version_id": version.id,
                            "version_tag": version.version_tag,
                            "conversion_formula": it.conversion_formula,
                        },
                        "step_2_experimental_run": {
                            "experimental_run_id": it.experimental_run_id,
                            "run_name": it.run_name,
                            "fuel_type": it.fuel_type,
                            "gravity_regime": it.gravity_regime,
                            "oxygen_pct": it.oxygen_pct,
                            "pressure_kpa": it.pressure_kpa,
                            "airflow_cm_s": it.airflow_cm_s,
                        },
                        "step_3_investigation": {
                            "investigation_id": it.investigation_id,
                            "acronym": acronym,
                            "internal_catalog_id": internal_cat_id,
                            "source_repository": cat.get("source_repository", "NASA_PSI"),
                            "source_record_id": official_psi_id,
                            "verification_status": cat.get(
                                "verification_status",
                                "VERIFIED_OFFICIAL_PSI_ID" if official_psi_id else "UNVERIFIED_OFFICIAL_PSI_ID",
                            ),
                        },
                        "step_4_source_document": {
                            "source_document_id": it.source_document_id,
                            "source_doi": it.source_doi,
                            "dataset_doi": dataset_doi,
                            "publication_dois": pub_dois,
                            "extraction_method": it.extraction_method,
                        },
                        "step_5_location_reference": {
                            "page_number": it.page_number,
                            "section_name": it.section_name or "Experimental Measurement Table",
                        },
                        "step_6_original_source": {
                            "repository": "NASA Physical Sciences Informatics (PSI)",
                            "official_source_record_id": official_psi_id,
                            "source_url": source_url,
                            "file_hashes": file_hashes,
                        },
                    },
                }
            )

        return {
            "dataset_id": version.dataset_id,
            "version_id": version.id,
            "version_tag": version.version_tag,
            "record_count": len(lineage_nodes),
            "lineage_items": lineage_nodes,
        }

    @classmethod
    def compute_version_diff(
        cls,
        version_a: DatasetVersion,
        version_b: DatasetVersion,
    ) -> dict[str, Any]:
        """Computes a deterministic record-by-record diff between two DatasetVersions (e.g., v1 vs v2)."""
        items_a = {
            (it.investigation_acronym, it.run_name, it.parameter_name): it
            for it in (version_a.items or [])
        }
        items_b = {
            (it.investigation_acronym, it.run_name, it.parameter_name): it
            for it in (version_b.items or [])
        }

        keys_a = set(items_a.keys())
        keys_b = set(items_b.keys())

        added_keys = sorted(keys_b - keys_a)
        removed_keys = sorted(keys_a - keys_b)
        common_keys = sorted(keys_a & keys_b)

        added_records = [
            {
                "investigation_acronym": k[0],
                "run_name": k[1],
                "parameter_name": k[2],
                "normalized_value": items_b[k].normalized_value,
                "normalized_unit": items_b[k].normalized_unit,
            }
            for k in added_keys
        ]
        removed_records = [
            {
                "investigation_acronym": k[0],
                "run_name": k[1],
                "parameter_name": k[2],
                "normalized_value": items_a[k].normalized_value,
                "normalized_unit": items_a[k].normalized_unit,
            }
            for k in removed_keys
        ]

        modified_records: list[dict[str, Any]] = []
        unchanged_count = 0
        for k in common_keys:
            ia = items_a[k]
            ib = items_b[k]
            if (
                ia.normalized_value != ib.normalized_value
                or ia.normalized_unit != ib.normalized_unit
                or ia.validation_status != ib.validation_status
            ):
                modified_records.append(
                    {
                        "investigation_acronym": k[0],
                        "run_name": k[1],
                        "parameter_name": k[2],
                        "old_value": ia.normalized_value,
                        "new_value": ib.normalized_value,
                        "old_unit": ia.normalized_unit,
                        "new_unit": ib.normalized_unit,
                        "old_status": ia.validation_status,
                        "new_status": ib.validation_status,
                    }
                )
            else:
                unchanged_count += 1

        cov_a = cls.compute_coverage_analysis(version_a)
        cov_b = cls.compute_coverage_analysis(version_b)

        return {
            "dataset_id": version_a.dataset_id,
            "base_version": version_a.version_tag,
            "target_version": version_b.version_tag,
            "base_record_count": len(items_a),
            "target_record_count": len(items_b),
            "added_count": len(added_records),
            "removed_count": len(removed_records),
            "modified_count": len(modified_records),
            "unchanged_count": unchanged_count,
            "quality_score_delta": round(
                cov_b["overall_quality_score"] - cov_a["overall_quality_score"], 2
            ),
            "added_records": added_records,
            "removed_records": removed_records,
            "modified_records": modified_records,
        }
