# FlameSafe AI - Scientific Data Repository

This directory contains scientific seed data, schema-aligned sample records, and data pipelines for NASA Physical Sciences Informatics (PSI) combustion research.

---

## Directory Organization

```text
data/
├── README.md               # Scientific data guide and provenance documentation
├── seed/                   # Seed datasets loaded into PostgreSQL on initialization
│   ├── seed_investigations.json # Canonical NASA PSI combustion investigations
│   └── seed_documents.json      # Published peer-reviewed research papers and evidence chunks
├── samples/                # Sample JSON payloads for testing and API contract verification
│   ├── bass_sample.json         # BASS experimental configuration sample
│   ├── saffire_sample.json      # SAFFIRE large-scale test configuration sample
│   ├── flex_sample.json         # FLEX droplet combustion sample
│   └── sample_payloads.json     # Request/response validation payloads for all API endpoints
└── processed/              # Extracted and normalized artifacts from ingestion pipeline
```

---

## Verified Data Sources

Data included in this repository is derived from publicly accessible NASA scientific archives:

1. **NASA Physical Sciences Informatics (PSI) Repository**:
   - URL: [https://psi.nasa.gov/physci/repo](https://psi.nasa.gov/physci/repo)
   - Category: Combustion Science / Fire Safety
2. **NASA Technical Reports Server (NTRS)**:
   - URL: [https://ntrs.nasa.gov/](https://ntrs.nasa.gov/)
3. **NASA PSI Investigations by Research Area**:
   - URL: [https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/](https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/)

---

## Scientific Integrity Principles for Data

- **No Synthetic Numbers**: Experimental measurements must come directly from published literature or PSI test records.
- **Explicit Units**: Every measurement contains an explicit unit string (`cm/s`, `kPa`, `% O2`, `s`, `mm`).
- **Null Safety**: When a parameter was not recorded or measured during an experimental run, it is preserved as `null` and never coerced to `0` or inferred without documentation.
- **Traceability**: Every record links to its source publication, NASA PSI identifier, and DOI where available.
