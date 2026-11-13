# FlameSafe AI — Security, Provenance & Scientific Governance

## 1. External Acquisition Security Controls (`PSISourceValidator`)

1. **Strict Domain Allowlist**:
   - Outbound scientific acquisition is restricted to `ALLOWED_SCIENTIFIC_DOMAINS`:
     `psi.nasa.gov`, `ntrs.nasa.gov`, `data.nasa.gov`, `science.nasa.gov`, `doi.org`, `dx.doi.org`, and internal `seed://` URIs.
   - Any non-allowlisted domain (e.g., `https://malicious.example.com`) is deterministically rejected with `BLOCKED_DOMAIN`.
2. **SSRF & Private Network Protection**:
   - `PSISourceValidator.validate_source_url` rejects non-HTTPS schemes (`http://`, `file://`, `ftp://`), `localhost`, loopback addresses (`127.0.0.1`, `::1`), and RFC-1918 / link-local IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254`).
3. **Path Traversal & Size Bounds**:
   - `PSISourceValidator.sanitize_filename` strips directory separators and `..` sequences.
   - `MAX_DOWNLOAD_SIZE_BYTES = 25 * 1024 * 1024` (25 MB) prevents automated memory/disk exhaustion; larger archives transition to `USER_HANDOFF_REQUIRED`.

---

## 2. Human-in-the-Loop Governance (`DatasetApproval`)

When a research request is created with `require_approval = True`:
- Execution halts cleanly after Agent 05 (`SELECTING_FILES`) in state `AWAITING_APPROVAL`.
- A `DatasetApproval` record is persisted with the candidate file manifest and estimated byte size.
- Researchers can inspect the file score breakdown ($F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A$), uncheck unwanted files, and submit `APPROVE`, `MODIFY_PLAN`, or `REJECT`.
