from typing import Dict, List, Any
from app.ingestion.extractors.base_extractor import BaseExtractor
from app.core.logging import logger

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False


class PDFExtractor(BaseExtractor):
    """Extracts text and page structure from scientific PDF publications."""

    def extract_text(self, file_bytes: bytes) -> str:
        if not PYMUPDF_AVAILABLE:
            logger.warning("PyMuPDF (fitz) is not installed; returning empty text.")
            return ""

        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            full_text = []
            for page in doc:
                full_text.append(page.get_text())
            doc.close()
            return "\n".join(full_text)
        except Exception as e:
            logger.error(f"Failed to extract text from PDF: {e}")
            return ""

    def extract_sections(self, file_bytes: bytes) -> List[Dict[str, Any]]:
        sections = []
        if not PYMUPDF_AVAILABLE:
            return sections

        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page_index, page in enumerate(doc):
                text = page.get_text().strip()
                if text:
                    sections.append({
                        "page_number": page_index + 1,
                        "text": text,
                        "char_count": len(text)
                    })
            doc.close()
        except Exception as e:
            logger.error(f"Failed to extract sections from PDF: {e}")

        return sections
