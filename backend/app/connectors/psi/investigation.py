"""NASA PSI investigation entity lookup and metadata wrapper."""

from typing import Any

from app.connectors.psi.discovery import PSIDiscoveryService


class PSIInvestigationAdapter:
    """Provides structured investigation lookup and experimental condition profiles."""

    @staticmethod
    def get_investigation_profile(psi_identifier: str) -> dict[str, Any] | None:
        return PSIDiscoveryService.get_investigation_by_id(psi_identifier)
