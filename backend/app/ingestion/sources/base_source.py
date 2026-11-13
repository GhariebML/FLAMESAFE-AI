from abc import ABC, abstractmethod
from typing import Any


class BaseSourceAdapter(ABC):
    """Abstract base class for data source adapters (NASA PSI, NTRS, etc.)."""

    @abstractmethod
    async def fetch_metadata(self, query: str) -> list[dict[str, Any]]:
        """Fetch remote catalog metadata records."""

    @abstractmethod
    async def fetch_document_content(self, document_id: str) -> bytes | None:
        """Fetch raw document content or PDF binary."""
