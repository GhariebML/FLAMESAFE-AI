"""NASA PSI linked scientific publications and DOI registry helper."""

from typing import Any

from app.connectors.psi.discovery import PSIDiscoveryService


class PSIPublicationsRegistry:
    """Resolves peer-reviewed publications and NASA technical reports linked to PSI campaigns."""

    @staticmethod
    def get_publications_for_investigation(psi_identifier: str) -> list[dict[str, Any]]:
        item = PSIDiscoveryService.get_investigation_by_id(psi_identifier)
        if not item:
            return []
        doi = item.get("doi")
        if not doi:
            return []
        return [
            {
                "psi_id": item["psi_id"],
                "acronym": item["acronym"],
                "citation_identifier": doi,
                "is_doi": str(doi).startswith("10."),
                "source_url": f"https://doi.org/{doi}" if str(doi).startswith("10.") else item["source_url"],
            }
        ]
