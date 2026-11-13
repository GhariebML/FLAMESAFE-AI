# DATASET QUALITY FRAMEWORK, LINEAGE EXPLORER & ANALYTICAL WORKSPACE

## 1. Deterministic Dataset Coverage & Quality Formula (Priority 8)

Implemented in `backend/app/datasets/quality_and_lineage.py` (`DatasetQualityAndLineageService.compute_coverage_analysis`) and exposed at `GET /api/v1/datasets/{dataset_id}/coverage`.

Every dataset version is evaluated using transparent, deterministic metrics (never arbitrary random numbers):

- **`field_completeness`**: Mean non-null percentage across the 7 core schema fields (`investigation_acronym`, `run_name`, `fuel_type`, `parameter_name`, `normalized_value`, `normalized_unit`, `source_doi`).
- **`measurement_coverage`**: Percentage of records containing a valid numeric measurement (`normalized_value` or `original_value`).
- **`source_provenance_coverage`**: Percentage of records linked to both an investigation campaign and a source document/DOI/URL.
- **`doi_availability`**: Percentage of records backed by a verified publication or dataset DOI.
- **`page_reference_coverage`**: Percentage of records with an explicit `page_number` or `section_name` reference.
- **`unit_consistency`**: Percentage of distinct physical parameters whose rows all share a single normalized SI unit.
- **`duplicate_rate`**: Percentage of duplicate `(investigation_acronym, run_name, parameter_name, normalized_value, normalized_unit)` tuples.
- **`missing_measurement_rate`**: `100.0 - measurement_coverage`.

### Composite Quality Formula
$$Q = 0.25 \cdot \text{FieldCompleteness} + 0.20 \cdot \text{MeasurementCoverage} + 0.20 \cdot \text{ProvenanceCoverage} + 0.15 \cdot \text{UnitConsistency} + 0.10 \cdot \text{DOIAvailability} + 0.10 \cdot (100 - \text{DuplicateRate})$$

---

## 2. Six-Hop Dataset Lineage Explorer (Priority 8)

Implemented in `DatasetQualityAndLineageService.trace_lineage` (`GET /api/v1/datasets/{dataset_id}/lineage`). Every `DatasetItem` traces across 6 explicit provenance hops:

1. **Step 1 — Dataset Item**: `item_id`, `dataset_version_id`, `version_tag`, `conversion_formula`.
2. **Step 2 — Experimental Run**: `experimental_run_id`, `run_name`, `fuel_type`, `gravity_regime`, `oxygen_pct`, `pressure_kpa`, `airflow_cm_s`.
3. **Step 3 — Investigation**: `investigation_id`, `acronym`, `internal_catalog_id`, `source_repository`, official `source_record_id`, `verification_status`.
4. **Step 4 — Source Document**: `source_document_id`, `source_doi`, `dataset_doi`, `publication_dois`, `extraction_method`.
5. **Step 5 — Location Reference**: `page_number`, `section_name`.
6. **Step 6 — Original Source**: `repository`, `official_source_record_id`, `source_url`, `file_hashes` (SHA-256).

---

## 3. Dataset Version Diff Engine (Priority 8)

Implemented in `DatasetQualityAndLineageService.compute_version_diff` (`GET /api/v1/datasets/{dataset_id}/diff`), comparing any two versions (`v1` vs `v2`) and reporting:

- `added_records` & `added_count`
- `removed_records` & `removed_count`
- `modified_records` & `modified_count` (with `old_value`, `new_value`, `old_unit`, `new_unit`, `old_status`, `new_status`)
- `unchanged_count`
- `quality_score_delta`

---

## 4. Genuine Apache Parquet Export via PyArrow (Priority 2)

Implemented in `backend/app/datasets/storage_vault.py` using `pyarrow 26.0.1`:

- Removed `FLAMESAFE_COLUMNAR_PARQUET_FALLBACK_V1`.
- Writes genuine Apache Parquet (`PAR1`) binary files with an explicit 25-column `pyarrow.schema` and embedded schema metadata.
- Preserves `None` values as true Arrow nulls (`null`), never converting missing scientific measurements to `0.0`.
- If `pyarrow` is unavailable in an environment, `GET /api/v1/datasets/{id}/export?format=parquet` returns HTTP `501 Not Implemented` with a clear explanation rather than serving a custom JSON file with a `.parquet` extension.

---

## 5. Pandas & NumPy Analytical Data Workspace (Priority 9)

Implemented in `backend/app/datasets/analytics.py` (`POST /api/v1/datasets/{dataset_id}/analytics`):

- **Descriptive Statistics (`DERIVED_METRIC`)**: Partitioned strictly by `(parameter_name, normalized_unit)` (`mean`, `std`, `min`, `q25`, `median`, `q75`, `iqr`, `max`).
- **Group-By Analysis (`ANALYTICAL_INFERENCE`)**: Grouped by `investigation_acronym`, `fuel_type`, or `validation_status` within each `(parameter_name, normalized_unit)`.
- **Distribution Summaries**: NumPy histogram bin counts and bin edges.
- **Missing Value Analysis**: Exact missing/present counts and percentages per environmental and measurement column.
- **Unit-Compatibility Guardrail**: Blocks pooling or comparing measurements with different `parameter_name` or incompatible `normalized_unit`.
- **Mandatory Non-Causality Notice**: Every analytical response includes `ANALYTICAL_INFERENCE NOTICE` warning that observational statistics or correlations do not establish physical causality.
