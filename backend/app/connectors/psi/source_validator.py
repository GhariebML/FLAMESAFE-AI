import ipaddress
import os
import re
from typing import Tuple
from urllib.parse import urlparse

ALLOWED_SCIENTIFIC_DOMAINS = {
    "psi.nasa.gov",
    "www.nasa.gov",
    "nasa.gov",
    "ntrs.nasa.gov",
    "doi.org",
    "dx.doi.org",
}

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "text/csv",
    "application/json",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "image/png",
    "image/jpeg",
}

MAX_DOWNLOAD_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB hard ceiling for automated acquisition


class PSISourceValidator:
    """
    Deterministic security and provenance validator for scientific source URLs,
    filenames, MIME types, and archive entries.
    """

    @staticmethod
    def validate_source_url(url: str) -> Tuple[bool, str]:
        if not url or not isinstance(url, str):
            return False, "Empty or invalid URL"

        if url.startswith("seed://"):
            # Internal verified seed vault reference (e.g., seed://BASS/experimental_table.json)
            clean_path = url[len("seed://") :]
            if ".." in clean_path or clean_path.startswith("/") or "\\" in clean_path:
                return False, "Path traversal detected in seed URI"
            return True, "Verified local seed vault URI"

        try:
            parsed = urlparse(url)
        except Exception as exc:
            return False, f"Malformed URL: {exc}"

        if parsed.scheme not in ("https",):
            return False, f"Disallowed URL scheme '{parsed.scheme}'; only HTTPS or seed:// is permitted"

        hostname = (parsed.hostname or "").lower()
        if not hostname:
            return False, "Missing hostname"

        # Block literal IP addresses (SSRF protection)
        try:
            ip = ipaddress.ip_address(hostname)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
                return False, f"SSRF protection blocked non-public IP address: {hostname}"
            return False, "Direct IP URLs are disallowed; must use allowlisted scientific domain"
        except ValueError:
            pass

        if hostname not in ALLOWED_SCIENTIFIC_DOMAINS and not any(
            hostname.endswith("." + dom) for dom in ALLOWED_SCIENTIFIC_DOMAINS
        ):
            return False, f"Domain '{hostname}' is not in the FlameSafe AI scientific allowlist"

        return True, "Allowlisted scientific domain"

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        base = os.path.basename(filename or "artifact.dat")
        sanitized = re.sub(r"[^A-Za-z0-9._-]", "_", base)
        if sanitized.startswith(".") or ".." in sanitized:
            sanitized = "safe_" + sanitized.lstrip(".")
        return sanitized[:180] or "artifact.dat"

    @staticmethod
    def validate_content_metadata(mime_type: str, size_bytes: int) -> Tuple[bool, str]:
        clean_mime = (mime_type or "").split(";")[0].strip().lower()
        if clean_mime not in ALLOWED_MIME_TYPES:
            return False, f"Unsupported or untrusted MIME type '{clean_mime}'"
        if size_bytes < 0:
            return False, "Negative content length"
        if size_bytes > MAX_DOWNLOAD_SIZE_BYTES:
            return (
                False,
                f"File size ({size_bytes} bytes) exceeds automated acquisition ceiling ({MAX_DOWNLOAD_SIZE_BYTES} bytes); user-assisted handoff required",
            )
        return True, "Valid content metadata"
