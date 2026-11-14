# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in **FlameSafe AI**, please report it responsibly through the repository's GitHub issue tracker or pull request review process, without publicly disclosing active exploit details before a fix is available.

## Implemented Security Controls

- **SSRF Protection:** `PSISourceValidator` (`backend/app/connectors/psi/source_validator.py`) enforces an allowlisted HTTPS domain policy for NASA PSI/NTRS acquisitions and blocks loopback/private IP targets (`localhost`, `127.0.0.1`, `0.0.0.0`, `::1`).
- **Download Governance:** `FLAMESAFE_AUTO_ACQUISITION_MAX_BYTES` (default `25 MB`) caps automated file downloads to prevent worker memory/disk exhaustion.
- **Secret Sanitization:** `sanitize_secret()` (`backend/app/rag/generator.py`) strips API keys from error logs and telemetry payloads.
- **HTTP Security Headers:** Configured in `frontend/vercel.json` (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`).
- **Secret Hygiene:** `.env`, `backend/.env`, `frontend/.env`, `.env.*`, and `*.db` files are excluded via `.gitignore`.
