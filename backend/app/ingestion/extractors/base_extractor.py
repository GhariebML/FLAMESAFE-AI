from abc import ABC, abstractmethod
from typing import Dict, List, Any


class BaseExtractor(ABC):
    """Abstract base class for document content extraction."""

    @abstractmethod
    def extract_text(self, file_bytes: bytes) -> str:
        """Extract plain text from document binary."""
        pass

    @abstractmethod
    def extract_sections(self, file_bytes: bytes) -> List[Dict[str, Any]]:
        """Extract structured sections and page demarcations."""
        pass
