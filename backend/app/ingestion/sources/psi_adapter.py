import json
import os
from typing import Any, Dict, List, Optional
from app.ingestion.sources.base_source import BaseSourceAdapter
from app.core.config import settings
from app.core.logging import logger


class PSISourceAdapter(BaseSourceAdapter):
    """
    Adapter for NASA Physical Sciences Informatics (PSI) repository data.
    Reads seed definitions or connects to public archives when available.
    """

    def __init__(self, seed_file_path: Optional[str] = None):
        self.base_url = settings.NASA_PSI_BASE_URL
        self.seed_file_path = seed_file_path or os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
            "data",
            "seed",
            "seed_investigations.json",
        )

    async def fetch_metadata(self, query: str = "") -> List[Dict[str, Any]]:
        """Load curated NASA PSI seed records."""
        if os.path.exists(self.seed_file_path):
            try:
                with open(self.seed_file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if query:
                        q = query.lower()
                        return [
                            item for item in data
                            if q in item.get("acronym", "").lower()
                            or q in item.get("title", "").lower()
                            or q in item.get("research_area", "").lower()
                        ]
                    return data
            except Exception as e:
                logger.error(f"Error reading PSI seed dataset from {self.seed_file_path}: {e}")
                return []
        logger.warning(f"PSI seed file not found at {self.seed_file_path}")
        return []

    async def fetch_document_content(self, document_id: str) -> Optional[bytes]:
        """Fetch raw document content (placeholder for live NTRS/PSI file download)."""
        logger.info(f"Fetching document content for PSI reference {document_id}")
        return None
