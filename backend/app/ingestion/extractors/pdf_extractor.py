import re
from typing import Dict, List, Any
from app.ingestion.extractors.base_extractor import BaseExtractor
from app.core.logging import logger

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB safety limit


class PDFExtractor(BaseExtractor):
    """Extracts text, inferred section headers, and page structure from scientific PDF publications."""

    @staticmethod
    def validate_pdf_bytes(file_bytes: bytes) -> bool:
        if not file_bytes or len(file_bytes) < 8:
            return False
        if len(file_bytes) > MAX_PDF_SIZE_BYTES:
            logger.error(f"PDF exceeds maximum allowed size ({len(file_bytes)} > {MAX_PDF_SIZE_BYTES} bytes).")
            return False
        return file_bytes.lstrip()[:5] == b"%PDF-"

    @staticmethod
    def clean_scientific_text(raw_text: str) -> str:
        # Normalize hyphenated line-breaks and excessive whitespace while preserving physical units
        cleaned = re.sub(r"-\s*\n\s*", "", raw_text)
        cleaned = re.sub(r"[ \t]+", " ", cleaned)
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
        return cleaned.strip()

    @staticmethod
    def infer_section_name(page_text: str, page_number: int) -> str:
        lines = [line.strip() for line in page_text.splitlines() if line.strip()]
        section_keywords = [
            "abstract", "introduction", "experimental", "apparatus", "methodology",
            "results", "discussion", "flammability", "extinction", "quench",
            "smoke", "droplet", "cool flame", "conclusion", "references",
        ]
        for line in lines[:8]:
            lower_line = line.lower()
            if len(line) <= 85 and any(k in lower_line for k in section_keywords):
                return line[:120]
        return f"Page {page_number} Content"

    def extract_text(self, file_bytes: bytes) -> str:
        if not self.validate_pdf_bytes(file_bytes):
            logger.warning("Invalid or oversized PDF byte stream rejected.")
            return ""
        if not PYMUPDF_AVAILABLE:
            logger.warning("PyMuPDF (fitz) is not installed; returning empty text.")
            return ""

        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            full_text = []
            for page in doc:
                full_text.append(self.clean_scientific_text(page.get_text()))
            doc.close()
            return "\n\n".join(t for t in full_text if t)
        except Exception as e:
            logger.error(f"Failed to extract text from PDF: {e}")
            return ""

    def extract_sections(self, file_bytes: bytes) -> List[Dict[str, Any]]:
        sections: List[Dict[str, Any]] = []
        if not self.validate_pdf_bytes(file_bytes) or not PYMUPDF_AVAILABLE:
            return sections

        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page_index, page in enumerate(doc):
                raw_text = page.get_text()
                text = self.clean_scientific_text(raw_text)
                if text:
                    page_num = page_index + 1
                    sections.append({
                        "page_number": page_num,
                        "section_name": self.infer_section_name(text, page_num),
                        "text": text,
                        "char_count": len(text),
                    })
            doc.close()
        except Exception as e:
            logger.error(f"Failed to extract sections from PDF: {e}")

        return sections
