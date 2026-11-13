"""NASA PSI metadata normalization and schema adapter."""

from typing import Any


class PSIMetadataParser:
    """Normalizes PSI catalog metadata into canonical FlameSafe attributes."""

    @staticmethod
    def normalize_metadata(raw_entry: dict[str, Any]) -> dict[str, Any]:
        return {
            "psi_identifier": raw_entry.get("psi_identifier", ""),
            "campaign_code": raw_entry.get("campaign_code", ""),
            "title": raw_entry.get("title", ""),
            "facility": raw_entry.get("facility", "ISS"),
            "gravity_regime": raw_entry.get("gravity_regime", "Microgravity (10^-6 g)"),
            "fuel_types": list(raw_entry.get("fuel_types", [])),
            "publications": list(raw_entry.get("publications", [])),
            "source_url": raw_entry.get("source_url", "https://psi.nasa.gov"),
            "provenance_verified": bool(raw_entry.get("local_seeded", False)),
        }
