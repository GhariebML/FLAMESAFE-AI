from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseSourceAdapter(ABC):
    """Abstract base class for data source adapters (NASA PSI, NTRS, etc.)."""

    @abstractmethod
    async def fetch_metadata(self, query: str) -> List[Dict[str, Any]]:
        """Fetch remote catalog metadata records."""
        pass

    @abstractmethod
    async def fetch_document_content(self, document_id: str) -> Optional[bytes]:
        """Fetch raw document content or PDF binary."""
        pass
