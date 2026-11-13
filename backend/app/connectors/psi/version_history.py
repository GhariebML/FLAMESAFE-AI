"""NASA PSI dataset and file version history tracking."""

from typing import Any

from app.connectors.psi.file_manifest import PSIFileManifestService


class PSIVersionHistoryService:
    """Tracks release versions and checksums of PSI manifest files."""

    @staticmethod
    def get_file_version_history(file_identifier: str) -> list[dict[str, Any]]:
        file_meta = PSIFileManifestService.get_file_by_id(file_identifier)
        if not file_meta:
            return []
        return [
            {
                "file_identifier": file_meta["file_identifier"],
                "version_tag": "v1.0-PSI-Baseline",
                "accessibility": file_meta.get("accessibility", "DIRECT_VERIFIED_SEED"),
                "file_size_bytes": file_meta.get("file_size_bytes", 0),
                "doi": file_meta.get("doi"),
            }
        ]
