from typing import Any


class MetadataParser:
    """Parses raw metadata strings and formats into normalized records."""

    @staticmethod
    def parse_psi_record(raw_record: dict[str, Any]) -> dict[str, Any]:
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

    @staticmethod
    def parse_document_record(raw_record: dict[str, Any]) -> dict[str, Any]:
        """Parses and normalizes research publication metadata."""
        title = raw_record.get("title")
        if isinstance(title, str):
            title = title.strip()

        doc_type = raw_record.get("document_type")
        if isinstance(doc_type, str):
            doc_type = doc_type.strip()

        doi = raw_record.get("doi")
        if isinstance(doi, str):
            doi = doi.strip() or None

        source_url = raw_record.get("source_url")
        if isinstance(source_url, str):
            source_url = source_url.strip() or None

        file_path = raw_record.get("file_path")
        if isinstance(file_path, str):
            file_path = file_path.strip() or None

        return {
            "id": raw_record.get("id"),
            "investigation_id": raw_record.get("investigation_id"),
            "title": title or "Untitled Publication",
            "document_type": doc_type or "Peer-Reviewed Journal Article",
            "doi": doi,
            "source_url": source_url,
            "file_path": file_path,
        }
