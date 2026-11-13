# LIVE NASA PSI CONNECTOR & DOWNLOAD GOVERNANCE VALIDATION

## 1. Separation of Record Origins & File Availability (Priority 3)

The NASA PSI Connector (`backend/app/connectors/psi/`) strictly separates:

- **`LOCAL_SEED_RECORD`**: Curated local microgravity combustion seed records (`seed_investigations.json` and `seed_documents.json`).
- **`METADATA_VERIFIED_RECORD`**: Official NASA PSI catalog metadata records (`PSI-25`, `PSI-69`, `PSI-98`, `PSI-101`, `PSI-102`, `PSI-159`) verified against NASA PSI, NTRS, and Crossref.
- **`LIVE_DISCOVERED_RECORD`**: Records retrieved via live HTTP inspection (`PSILiveConnectorInspector`).
- **`DIRECT_DOWNLOAD_AVAILABLE`**: Structured experimental tables and publication digests directly downloadable without interactive portal login.
- **`PORTAL_HANDOFF_REQUIRED`**: Raw optical video or bulk archives hosted behind the interactive `https://psi.nasa.gov/physci/repo/` SPA portal or exceeding FlameSafe's configurable auto-acquisition size limit.

---

## 2. Live Smoke-Test Execution & Trace Artifact

Executed via `backend/scripts/psi_live_smoke_test.py` (`backend/app/connectors/psi/live_inspector.py`), saving a traceable JSON artifact to `backend/data/psi_live_catalog_trace.json`:

1. **NASA PSI Landing Probe**: `GET https://psi.nasa.gov` -> HTTP `200` (resolves to `https://science.nasa.gov/biological-physical/data/`).
2. **NASA PSI Repository Portal Probe**: `GET https://psi.nasa.gov/physci/repo/` -> HTTP `200` (interactive browser portal shell; raw bulk file downloads require interactive portal session -> classified as `PORTAL_HANDOFF_REQUIRED`).
3. **NASA Technical Reports Server (NTRS) Live API Search**: `GET https://ntrs.nasa.gov/api/citations/search?q=...` -> HTTP `200`, returning live NASA technical reports (`20210011385` for `PSI-25` BASS-II, `20150023456` for `PSI-69` FLEX, `20170000230` for `PSI-98` SAFFIRE, `20130000422` for `PSI-101`/`PSI-102` SAME).
4. **Live Crossref DOI Verification**: `GET https://api.crossref.org/works/{doi}` -> HTTP `200` verified across all 6 official reference investigations (`PSI-25`, `PSI-69`, `PSI-98`, `PSI-101`, `PSI-102`, `PSI-159`).

---

## 3. Download Governance & Size Policy Separation (Priority 4)

Configured in `backend/app/core/config.py` and enforced in `backend/app/connectors/psi/download_strategy.py`:

- **FlameSafe Application Safety Limit (`FLAMESAFE_AUTO_ACQUISITION_MAX_BYTES = 26,214,400` bytes / 25 MB)**: Configurable application-level safety policy preventing autonomous background agents from downloading multi-hundred-megabyte raw video archives without explicit user portal handoff.
- **Official NASA PSI Bulk Email Threshold (`NASA_PSI_BULK_EMAIL_THRESHOLD_BYTES = 1,073,741,824` bytes / 1 GB)**: Documented separately so the 25 MB application safety policy is never misrepresented as NASA PSI's 1 GB email-prepared download threshold.
- **Seven Explicit Governance States**:
  1. `DIRECT_DOWNLOAD_AVAILABLE`
  2. `USER_APPROVAL_REQUIRED`
  3. `PORTAL_HANDOFF_REQUIRED`
  4. `ACCESS_RESTRICTED`
  5. `INVALID_SOURCE`
  6. `DOWNLOAD_FAILED`
  7. `DOWNLOAD_COMPLETED`
