import ipaddress
import os
import re
from typing import Optional, Tuple
from urllib.parse import urlparse

from app.core.config import settings


class PSISourceValidator:
    """
    Security & Provenance Validator for NASA PSI and Scientific Source Connectors.
    Enforces:
    - Domain allowlisting (prevents SSRF and arbitrary internet scraping)
    - HTTPS enforcement for external URLs
    - Private/loopback IP rejection
    - Path traversal sanitization
    - Configurable FlameSafe application safety cap (settings.FLAMESAFE_AUTO_ACQUISITION_MAX_BYTES, default 25 MB)
      while documenting NASA PSI's 1 GB bulk email-delivery threshold (settings.NASA_PSI_BULK_EMAIL_THRESHOLD_BYTES).
    """

    ALLOWED_SCIENTIFIC_DOMAINS = {
        "psi.nasa.gov",
        "ntrs.nasa.gov",
        "data.nasa.gov",
        "science.nasa.gov",
        "osdr.nasa.gov",
        "doi.org",
        "dx.doi.org",
        "api.crossref.org",
    }

    ALLOWED_MIME_TYPES = {
        "application/pdf",
        "text/csv",
        "application/json",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/zip",
    }

    # Configurable FlameSafe application safety policy (NOT an official NASA PSI limit)
    MAX_DOWNLOAD_SIZE_BYTES = settings.FLAMESAFE_AUTO_ACQUISITION_MAX_BYTES
    # NASA PSI documented large-download threshold (1 GB -> prepared download delivered via email)
    NASA_PSI_EMAIL_PREPARED_THRESHOLD_BYTES = settings.NASA_PSI_BULK_EMAIL_THRESHOLD_BYTES

    FILENAME_SANITIZE_PATTERN = re.compile(r"[^A-Za-z0-9._-]")

    @classmethod
    def validate_source_url(cls, url: str) -> Tuple[bool, str]:
        if not url or not isinstance(url, str):
            return False, "Empty or non-string URL."

        if url.startswith("seed://"):
            return True, "Verified local FlameSafe seed reference."

        try:
            parsed = urlparse(url.strip())
        except Exception as exc:
            return False, f"Malformed URL: {exc}"

        if parsed.scheme.lower() != "https":
            return False, f"Insecure scheme '{parsed.scheme}'. Only HTTPS or internal seed:// URIs are permitted."

        hostname = (parsed.hostname or "").lower()
        if not hostname:
            return False, "Missing hostname in URL."

        try:
            ip_obj = ipaddress.ip_address(hostname)
            if (
                ip_obj.is_private
                or ip_obj.is_loopback
                or ip_obj.is_link_local
                or ip_obj.is_multicast
                or ip_obj.is_reserved
            ):
                return False, f"SSRF protection blocked private/reserved IP address: {hostname}"
        except ValueError:
            pass

        if hostname in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
            return False, "SSRF protection blocked localhost target."

        domain_allowed = any(
            hostname == allowed or hostname.endswith(f".{allowed}")
            for allowed in cls.ALLOWED_SCIENTIFIC_DOMAINS
        )
        if not domain_allowed:
            return False, f"Hostname '{hostname}' is not in the FlameSafe scientific domain allowlist."

        return True, "Valid allowlisted scientific URL."

    @classmethod
    def sanitize_filename(cls, raw_filename: str) -> str:
        base = os.path.basename(raw_filename.strip().replace("\\", "/"))
        sanitized = cls.FILENAME_SANITIZE_PATTERN.sub("_", base)
        sanitized = sanitized.lstrip(".")
        return sanitized or "scientific_artifact.bin"

    @classmethod
    def validate_content_metadata(
        cls,
        mime_type: Optional[str],
        content_length: Optional[int],
    ) -> Tuple[bool, str]:
        if mime_type:
            clean_mime = mime_type.split(";")[0].strip().lower()
            if clean_mime not in cls.ALLOWED_MIME_TYPES:
                return False, f"Disallowed MIME type '{clean_mime}'."

        limit_bytes = settings.FLAMESAFE_AUTO_ACQUISITION_MAX_BYTES
        if content_length is not None:
            if content_length < 0:
                return False, "Negative content length is invalid."
            if content_length > limit_bytes:
                if content_length > settings.NASA_PSI_BULK_EMAIL_THRESHOLD_BYTES:
                    return (
                        False,
                        f"File size ({content_length} bytes) exceeds both FlameSafe's configurable auto-acquisition safety cap "
                        f"({limit_bytes} bytes) and NASA PSI's 1 GB threshold ({settings.NASA_PSI_BULK_EMAIL_THRESHOLD_BYTES} bytes), "
                        "which uses prepared download links delivered via email.",
                    )
                return (
                    False,
                    f"File size ({content_length} bytes) exceeds FlameSafe's configurable automatic acquisition safety policy "
                    f"({limit_bytes} bytes). Manual portal handoff or policy override required.",
                )

        return True, "Content metadata within FlameSafe safety bounds."


ALLOWED_SCIENTIFIC_DOMAINS = PSISourceValidator.ALLOWED_SCIENTIFIC_DOMAINS
MAX_DOWNLOAD_SIZE_BYTES = PSISourceValidator.MAX_DOWNLOAD_SIZE_BYTES

