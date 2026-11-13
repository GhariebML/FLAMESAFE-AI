from typing import Any, Dict


class MetadataParser:
    """Parses raw metadata strings and formats into normalized records."""

    @staticmethod
    def parse_psi_record(raw_record: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "psi_id": raw_record.get("psi_id") or raw_record.get("id"),
            "acronym": raw_record.get("acronym", "UNKNOWN"),
            "title": raw_record.get("title", ""),
            "research_area": raw_record.get("research_area", "Microgravity Combustion"),
            "objectives": raw_record.get("objectives", ""),
            "description": raw_record.get("description", ""),
            "doi": raw_record.get("doi"),
            "source_url": raw_record.get("source_url"),
            "metadata_payload": raw_record.get("metadata", {}),
        }
