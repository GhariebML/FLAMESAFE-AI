# FlameSafe AI — Dynamic Dataset Engine Specification

## 1. Overview

The **Dynamic Dataset Engine** (`backend/app/datasets/engine.py` and `backend/app/datasets/storage_vault.py`) transforms heterogeneous microgravity combustion records and NASA PSI file assets into **canonical, SI-normalized, deterministically validated, versioned, and exportable scientific datasets**.

---

## 2. Canonical Scientific Record Schema (`DatasetItem`)

Every row stored in `dataset_items` and exported to `CSV`, `JSON`, or `Parquet` adheres to the canonical schema:

- **Lineage & Identity**: `id`, `dataset_version_id`, `investigation_id`, `investigation_acronym`, `experimental_run_id`, `run_name`
- **Material & Atmosphere**: `fuel_type`, `gravity_regime`, `oxygen_pct` ($\%$), `pressure_kpa` ($\text{kPa}$), `airflow_cm_s` ($\text{cm/s}$)
- **Measurement & Unit Normalization**:
  - `parameter_name` (e.g., `flame_spread_rate`, `oxygen_concentration`, `droplet_burning_rate_constant`)
  - `original_value`, `original_unit`
  - `normalized_value`, `normalized_unit`, `conversion_formula`
  - `uncertainty`
- **Provenance & Governance**:
  - `source_document_id`, `source_doi`, `source_url`, `page_number`, `section_name`
  - `extraction_method` (`canonical_psi_table`, `psi_json_seed_extractor`)
  - `evidence_classification` (`VERIFIED_EXPERIMENTAL_DATA`, `PUBLISHED_FINDING`, `DERIVED_METRIC`, `ANALYTICAL_INFERENCE`, `AI_INTERPRETATION`, `UNVERIFIED`, `UNKNOWN`)
  - `validation_status` (`PASSED`, `PASSED_WITH_WARNINGS`, `NEEDS_HUMAN_REVIEW`, `REJECTED`)

---

## 3. Strict Null Handling & Deterministic Physical Validation

1. **Null Preservation Invariant**: Missing measurements or environmental parameters (`None` / `null`) are **never** coerced to `0.0`. Records with `normalized_value = None` are preserved as `null` and flagged as `NEEDS_HUMAN_REVIEW` so researchers can inspect incomplete runs without corrupting statistical means or minimums.
2. **Physical Range Gate**:
   - `oxygen_pct`: $[0.0, 100.0]\%$
   - `pressure_kpa`: $[0.0, 500.0]\text{ kPa}$
   - `airflow_cm_s`: $[0.0, 500.0]\text{ cm/s}$
   - Parameter-specific bounds (`flame_spread_rate` $\in [0, 500]$, `peak_temperature` $\in [200, 4000]\text{ K}$, etc.).
3. **Cryptographic Deduplication**: Each candidate record is hashed across `(investigation_acronym, run_name, parameter_name, normalized_value, oxygen_pct, pressure_kpa, airflow_cm_s)` to reject duplicate rows.
