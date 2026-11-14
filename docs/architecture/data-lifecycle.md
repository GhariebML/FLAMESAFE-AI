# Scientific Data Lifecycle

FlameSafe AI transforms heterogeneous NASA Physical Sciences Informatics (PSI) and NTRS publications into versioned, unit-consistent, provenance-tracked datasets.

```mermaid
flowchart LR
    S1["1. Source Discovery<br/>(NASA PSI & NTRS Catalog)"] --> S2["2. File Governance & Acquisition<br/>(Allowlist, SSRF guard, 25 MB auto cap, SHA-256)"]
    S2 --> S3["3. Document & Table Extraction<br/>(PyMuPDF / structured parsers)"]
    S3 --> S4["4. SI Schema Mapping<br/>(kPa, cm/s, K, % O2, g)"]
    S4 --> S5["5. Deterministic Validation<br/>(Physical bounds + Null preservation)"]
    S5 --> S6["6. Dataset Construction<br/>(Content fingerprint + Semantic Version)"]
    S6 --> S7["7. Export & Analytics<br/>(Parquet via PyArrow, CSV, JSON, Pandas workspace)"]
```

## Scientific Data Integrity Policies

- **Null Preservation:** Missing experimental measurements remain `null` (`None` in Python) and are rendered as `"Not recorded"` in the UI—never interpolated or silently coerced to `0`.
- **Download Governance:** `FLAMESAFE_AUTO_ACQUISITION_MAX_BYTES` (default `25 MB`) caps automated in-app file downloads; files exceeding NASA PSI's 1 GB bulk threshold (`NASA_PSI_BULK_EMAIL_THRESHOLD_BYTES`) are flagged for NASA PSI's official email-prepared download workflow.
- **Lineage & Versioning:** Every `DatasetItem` links back to its source `ExperimentalRun`, `Investigation`, `ResearchDocument` DOI, page/section reference, and unit conversion formula.
