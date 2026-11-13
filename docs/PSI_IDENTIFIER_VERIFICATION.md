# NASA PSI IDENTIFIER & DOI VERIFICATION REPORT

## 1. Identifier Separation Architecture

To prevent local FlameSafe catalog identifiers or general campaign acronyms from being misrepresented as official NASA Physical Sciences Informatics (PSI) identifiers, every catalog entry in `backend/app/connectors/psi/discovery.py` and `data/seed/seed_investigations.json` now implements the following strict schema:

- `internal_catalog_id`: FlameSafe internal catalog primary key (`FS-CAT-...`).
- `source_repository`: `"NASA_PSI"`.
- `source_record_id`: Official verified NASA PSI record identifier (`PSI-25`, `PSI-69`, `PSI-98`, `PSI-101`, `PSI-102`, `PSI-159`), or `None` when a standalone NASA PSI record ID is unverified.
- `local_aliases`: Legacy local aliases (`PSI-BASS-01`, `PSI-SAFFIRE-01`, `PSI-FLEX-01`, `PSI-SAME-01`, `PSI-ACME-01`) preserved separately for backward compatibility.
- `dataset_doi`: Distinct NASA PSI dataset DOI (`None` unless independently verified as a dataset-level DOI).
- `publication_dois`: Peer-reviewed scientific paper DOIs verified against live Crossref (`https://api.crossref.org/works/{doi}`), kept strictly distinct from `dataset_doi`.
- `source_url`: Official repository URL (`https://psi.nasa.gov/physci/repo`).
- `last_verified_at`: UTC timestamp of verification.

---

## 2. Complete Catalog Audit Table

| Internal Catalog ID | Acronym | Official `source_record_id` | Verification Status | Legacy `local_aliases` | Live-Verified `publication_dois` (Crossref HTTP 200) | `dataset_doi` |
|---|---|---|---|---|---|---|
| `FS-CAT-BASS-II-025` | `BASS-II` | **`PSI-25`** | `VERIFIED_OFFICIAL_PSI_ID` | `BASS-II`, `PSI-25`, `PSI-BASS-II-01` | `10.1007/s12217-024-10106-y`, `10.1016/j.combustflame.2017.03.001` | `None` |
| `FS-CAT-BASS-I-MSG` | `BASS` | **`None`** (Companion to `PSI-25`) | `UNVERIFIED_OFFICIAL_PSI_ID` | `BASS`, `BASS-I`, `PSI-BASS-01` | `10.2514/6.2012-3492`, `10.1007/s12217-024-10106-y` | `None` |
| `FS-CAT-SAFFIRE-I-098` | `SAFFIRE` | **`PSI-98`** | `VERIFIED_OFFICIAL_PSI_ID` | `SAFFIRE`, `SAFFIRE-I`, `PSI-98`, `PSI-SAFFIRE-01` | `10.32865/2346/108820`, `10.1007/s10694-019-00941-6` | `None` |
| `FS-CAT-FLEX-069` | `FLEX` | **`PSI-69`** | `VERIFIED_OFFICIAL_PSI_ID` | `FLEX`, `PSI-69`, `PSI-FLEX-01` | `10.1016/j.combustflame.2015.01.012`, `10.1016/j.combustflame.2009.09.012` | `None` |
| `FS-CAT-FLEX-2` | `FLEX-2` | **`None`** | `UNVERIFIED_OFFICIAL_PSI_ID` | `FLEX-2`, `PSI-FLEX-2-01` | `10.1016/j.combustflame.2015.01.012` | `None` |
| `FS-CAT-SAME-102` | `SAME` | **`PSI-102`** | `VERIFIED_OFFICIAL_PSI_ID` | `SAME`, `PSI-102`, `PSI-SAME-01` | `10.2514/6.2013-3433`, `10.2514/6.2012-3536` | `None` |
| `FS-CAT-SAME-R-101` | `SAME-R` | **`PSI-101`** | `VERIFIED_OFFICIAL_PSI_ID` | `SAME-R`, `PSI-101`, `PSI-SAME-R-01` | `10.2514/6.2012-3536`, `10.2514/6.2013-3433` | `None` |
| `FS-CAT-ACME-CFIG-159` | `ACME` | **`PSI-159`** (CFI-G record) | `VERIFIED_OFFICIAL_PSI_ID` | `ACME`, `PSI-159`, `PSI-ACME-01` | `10.1016/j.combustflame.2016.02.012`, `10.1016/j.proci.2014.05.064` | `None` |
| `FS-CAT-CFI-G-159` | `CFI-G` | **`PSI-159`** | `VERIFIED_OFFICIAL_PSI_ID` | `CFI-G`, `ACME CFI-G`, `PSI-159`, `PSI-CFI-G-01` | `10.1016/j.combustflame.2016.02.012` | `None` |
| `FS-CAT-SOFIE` | `SOFIE` | **`None`** | `UNVERIFIED_OFFICIAL_PSI_ID` | `SOFIE`, `PSI-SOFIE-01` | `[]` | `None` |
| `FS-CAT-ACME-BRE` | `BRE` | **`None`** | `UNVERIFIED_OFFICIAL_PSI_ID` | `BRE`, `ACME-BRE`, `PSI-BRE-01` | `10.1016/j.proci.2014.05.064` | `None` |

---

## 3. Audit Finding on Initial Baseline Seed DOIs

During live HTTP verification (`backend/scripts/psi_live_smoke_test.py`) against `https://api.crossref.org/works/{doi}`, the 5 DOIs originally present in the initial hackathon seed (`data/seed/seed_investigations.json` and `seed_documents.json`) were found to be synthetic placeholders (`10.2514/1.A34167` returned HTTP 404, while `10.1016/j.proci.2014.05.077`, `10.1016/j.combustflame.2013.06.023`, `10.4271/2009-01-2481`, and `10.1016/j.combustflame.2018.04.015` resolved to unrelated articles).

All 5 have been remediated across `discovery.py`, `file_manifest.py`, `live_inspector.py`, `seed_investigations.json`, and `seed_documents.json` using real, Crossref-verified microgravity combustion publications:

- **BASS / BASS-II (`PSI-25`)**: `10.1007/s12217-024-10106-y` (*Effects of Confinement on Opposed-Flow Flame Spread over Cellulose and Polymeric Solids in Microgravity*, Microgravity Science and Technology, 2024) & `10.2514/6.2012-3492`.
- **SAFFIRE-I (`PSI-98`)**: `10.32865/2346/108820` (*Spacecraft Fire Safety Predictions using Validated Saffire Model*) & `10.1007/s10694-019-00941-6` (*Introduction to Special Issue on Spacecraft Fire Safety*, Fire Technology).
- **FLEX (`PSI-69`)**: `10.1016/j.combustflame.2015.01.012` (*Cool-flame extinction during n-alkane droplet combustion in microgravity*, Combustion and Flame, 2015).
- **SAME / SAME-R (`PSI-102` / `PSI-101`)**: `10.2514/6.2013-3433` (*Smoke Aerosol Measurement Experiment-2: Comparison of Flight Experiment Results with Ground Test Results*, AIAA) & `10.2514/6.2012-3536` (*Particle Morphology and Size Results from the Smoke Aerosol Measurement Experiment-2*, AIAA).
- **ACME / CFI-G (`PSI-159`)**: `10.1016/j.combustflame.2016.02.012` (*Analysis of CH\* concentration and flame heat release rate in laminar coflow diffusion flames under microgravity and normal gravity*, Combustion and Flame, 2016).
