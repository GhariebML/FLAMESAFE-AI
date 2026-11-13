import json
import os
import re
from typing import Any

import httpx

from app.core.config import settings
from app.core.logging import logger
from app.ingestion.sources.base_source import BaseSourceAdapter


def sanitize_filename(name: str) -> str:
    """Sanitize identifier or filename to prevent directory traversal and invalid chars."""
    safe = re.sub(r'[/\\:*?"<>|]', "_", name)
    safe = safe.replace("..", "_").strip(" ._")
    return safe or "document"


class PSISourceAdapter(BaseSourceAdapter):
    """
    Adapter for NASA Physical Sciences Informatics (PSI) repository data.
    Reads seed definitions, manages local caching in data/raw/, and downloads public publications.
    """

    def __init__(self, seed_file_path: str | None = None, raw_data_dir: str | None = None):
        self.base_url = settings.NASA_PSI_BASE_URL
        project_root = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        )
        self.seed_file_path = seed_file_path or os.path.join(
            project_root,
            "data",
            "seed",
            "seed_investigations.json",
        )
        self.raw_data_dir = raw_data_dir or os.path.join(project_root, "data", "raw")
        os.makedirs(self.raw_data_dir, exist_ok=True)

    async def fetch_metadata(self, query: str = "") -> list[dict[str, Any]]:
        """Load curated NASA PSI seed records."""
        if os.path.exists(self.seed_file_path):
            try:
                with open(self.seed_file_path, "r", encoding="utf-8") as f:  # noqa: ASYNC230
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
            except (OSError, json.JSONDecodeError) as e:
                logger.error(f"Error reading PSI seed dataset from {self.seed_file_path}: {e}")
                return []
        logger.warning(f"PSI seed file not found at {self.seed_file_path}")
        return []

    async def fetch_document_content(
        self, document_id: str, source_url: str | None = None
    ) -> bytes | None:
        """
        Fetch raw document content (PDF binary).
        Checks local cache in data/raw/ first. If not cached, downloads from source_url.
        """
        safe_id = sanitize_filename(document_id)
        cached_path = os.path.join(self.raw_data_dir, f"{safe_id}.pdf")

        # 1. Check local cache
        if os.path.exists(cached_path) and os.path.getsize(cached_path) > 0:
            logger.info(f"Reusing cached document from {cached_path}")
            try:
                with open(cached_path, "rb") as f:  # noqa: ASYNC230
                    content = f.read()
                if content.startswith(b"%PDF-"):
                    return content
                logger.warning(f"Cached file {cached_path} is not a valid PDF; redownloading.")
            except OSError as e:
                logger.warning(f"Failed to read cached file {cached_path}: {e}")

        # 2. Check if download URL is provided
        if not source_url:
            logger.warning(
                f"Document {document_id} not cached and no source_url provided. Skipping download."
            )
            return None

        # Validate URL scheme
        if not source_url.startswith(("http://", "https://")):
            logger.error(f"Invalid source_url protocol: {source_url}. Must be http:// or https://")
            return None

        logger.info(f"Downloading document content from {source_url} for ID {document_id}")

        # 3. Download via httpx
        timeout = httpx.Timeout(connect=10.0, read=30.0, write=10.0, pool=10.0)
        try:
            async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
                resp = await client.get(source_url)
                if resp.status_code != 200:
                    logger.error(
                        f"Failed to download document {document_id} from {source_url}: HTTP {resp.status_code}"
                    )
                    return None

                content = resp.content
                if not content.startswith(b"%PDF-"):
                    logger.error(
                        f"Downloaded content from {source_url} does not have valid PDF magic header (%PDF-)"
                    )
                    return None

                # 4. Cache valid PDF binary
                with open(cached_path, "wb") as f:  # noqa: ASYNC230
                    f.write(content)
                logger.info(f"Successfully cached document {document_id} to {cached_path}")
                return content

        except httpx.TimeoutException as e:
            logger.error(f"Timeout while downloading {source_url}: {e}")
            return None
        except httpx.RequestError as e:
            logger.error(f"Network error while downloading {source_url}: {e}")
            return None
        except Exception as e:  # noqa: BLE001
            logger.error(f"Unexpected error while fetching document {document_id}: {e}")
            return None
