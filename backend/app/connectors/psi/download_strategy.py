import hashlib
import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple
from app.connectors.psi.source_validator import PSISourceValidator
from app.connectors.psi.file_manifest import PSIFileManifestService


class PSIDownloadStrategy:
    """
    AGENT 06 — Deterministic Scientific Acquisition Strategy.
    Supports:
    1. Verified local seed vault materialization (seed://...)
    2. User-assisted NASA PSI portal handoff for restricted or >25MB archives
    3. Allowlisted HTTPS validation with SSRF and MIME checks
    """

    @staticmethod
    def _load_seed_payload(acronym: str, seed_kind: str) -> bytes:
        base_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
            "data",
            "seed",
        )
        inv_path = os.path.join(base_dir, "seed_investigations.json")
        doc_path = os.path.join(base_dir, "seed_documents.json")

        payload: Dict[str, Any] = {
            "investigation_acronym": acronym,
            "seed_kind": seed_kind,
            "generated_from": "NASA PSI Verified Seed Repository",
        }
        if "experimental_table" in seed_kind and os.path.exists(inv_path):
            with open(inv_path, "r", encoding="utf-8") as f:
                invs = json.load(f)
                matched = [i for i in invs if i.get("acronym", "").upper() == acronym.upper()]
                payload["records"] = matched
        elif "publication" in seed_kind and os.path.exists(doc_path):
            with open(doc_path, "r", encoding="utf-8") as f:
                docs = json.load(f)
                matched = [
                    d for d in docs if acronym.upper() in d.get("title", "").upper() or acronym.lower() in d.get("id", "").lower()
                ]
                payload["documents"] = matched
        return json.dumps(payload, indent=2).encode("utf-8")

    @classmethod
    async def acquire_file(cls, file_identifier: str) -> Tuple[str, Dict[str, Any], Optional[bytes]]:
        """
        Returns (status, metadata_dict, content_bytes_or_None).
        Status is one of: 'DOWNLOADED', 'USER_HANDOFF_REQUIRED', 'BLOCKED_DOMAIN', 'FAILED'
        """
        meta = PSIFileManifestService.get_file_by_id(file_identifier)
        if not meta:
            return (
                "FAILED",
                {
                    "file_identifier": file_identifier,
                    "error_message": f"File '{file_identifier}' not found in verified PSI catalog.",
                },
                None,
            )

        source_url = meta["source_url"]
        valid_url, url_reason = PSISourceValidator.validate_source_url(source_url)
        if not valid_url:
            return (
                "BLOCKED_DOMAIN",
                {
                    "file_identifier": file_identifier,
                    "investigation_acronym": meta["investigation_acronym"],
                    "source_url": source_url,
                    "error_message": url_reason,
                },
                None,
            )

        if meta.get("requires_user_handoff") or meta.get("accessibility") == "USER_ASSISTED_PSI_PORTAL":
            return (
                "USER_HANDOFF_REQUIRED",
                {
                    "file_identifier": file_identifier,
                    "investigation_acronym": meta["investigation_acronym"],
                    "source_url": source_url,
                    "handoff_instructions": (
                        f"File '{meta['file_name']}' ({meta['file_category']}) requires authenticated NASA PSI portal "
                        f"download or exceeds the 25 MB automated limit. Visit {source_url}, request the archive link "
                        f"for {meta['psi_investigation_id']}, and place the downloaded file in the local Raw Data Vault."
                    ),
                },
                None,
            )

        mime_ok, mime_reason = PSISourceValidator.validate_content_metadata(
            meta["mime_type"], meta.get("file_size_bytes") or 0
        )
        if not mime_ok:
            return (
                "FAILED",
                {
                    "file_identifier": file_identifier,
                    "investigation_acronym": meta["investigation_acronym"],
                    "source_url": source_url,
                    "error_message": mime_reason,
                },
                None,
            )

        if source_url.startswith("seed://"):
            parts = source_url[len("seed://") :].split("/", 1)
            acronym = parts[0]
            seed_kind = parts[1] if len(parts) > 1 else "experimental_table.json"
            content_bytes = cls._load_seed_payload(acronym, seed_kind)
            sha256_hash = hashlib.sha256(content_bytes).hexdigest()
            return (
                "DOWNLOADED",
                {
                    "file_identifier": file_identifier,
                    "investigation_acronym": meta["investigation_acronym"],
                    "file_name": PSISourceValidator.sanitize_filename(meta["file_name"]),
                    "source_url": source_url,
                    "http_status": 200,
                    "content_type": meta["mime_type"],
                    "bytes_downloaded": len(content_bytes),
                    "sha256_hash": sha256_hash,
                    "downloaded_at": datetime.now(timezone.utc).isoformat(),
                },
                content_bytes,
            )

        return (
            "USER_HANDOFF_REQUIRED",
            {
                "file_identifier": file_identifier,
                "investigation_acronym": meta["investigation_acronym"],
                "source_url": source_url,
                "handoff_instructions": (
                    f"External URL '{source_url}' requires browser session verification on NASA PSI."
                ),
            },
            None,
        )
