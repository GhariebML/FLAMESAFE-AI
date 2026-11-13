from typing import Any, Dict
from app.connectors.psi.discovery import PSIDiscoveryService, VERIFIED_PSI_CATALOG
from app.connectors.psi.file_manifest import PSIFileManifestService, VERIFIED_PSI_FILES
from app.connectors.psi.source_validator import ALLOWED_SCIENTIFIC_DOMAINS


class PSIConnectorClient:
    """
    Unified NASA PSI Connector Client providing health telemetry,
    rate-limited catalog access, and source verification metadata.
    """

    @staticmethod
    def health_check() -> Dict[str, Any]:
        return {
            "connector": "NASA_PSI_SOURCE_ADAPTER",
            "primary_repository": "https://psi.nasa.gov/physci/repo",
            "status": "ONLINE_HYBRID_CATALOG",
            "indexed_investigations": len(VERIFIED_PSI_CATALOG),
            "indexed_files": len(VERIFIED_PSI_FILES),
            "allowlisted_domains": sorted(ALLOWED_SCIENTIFIC_DOMAINS),
            "supports_user_handoff": True,
        }


__all__ = [
    "PSIConnectorClient",
    "PSIDiscoveryService",
    "PSIFileManifestService",
]
