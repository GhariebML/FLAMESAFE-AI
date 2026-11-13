import re
from typing import Any

from app.core.logging import logger
from app.ingestion.extractors.base_extractor import BaseExtractor

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False


class PDFExtractor(BaseExtractor):
    """Extracts text, page structure, section headings, and evidence chunks from scientific PDF publications."""

    MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB safety limit

    @staticmethod
    def validate_pdf_bytes(file_bytes: bytes) -> bool:
        if not file_bytes or len(file_bytes) < 8:
            return False
        if len(file_bytes) > PDFExtractor.MAX_PDF_SIZE_BYTES:
            logger.error(f"PDF exceeds maximum allowed size ({len(file_bytes)} > {PDFExtractor.MAX_PDF_SIZE_BYTES} bytes).")
            return False
        return file_bytes.lstrip()[:5] == b"%PDF-"

    # Regex patterns for scientific paper section headers
    SECTION_PATTERN = re.compile(
        r"^(?:(?:\d+\.?)+\s+)?(Abstract|Introduction|Background|Experimental\s+(?:Methods|Facility|Setup|Procedure)|Methods|Results|Results\s+and\s+Discussion|Discussion|Conclusions?|Summary|References|[A-Z\s]{4,35})$",
        re.IGNORECASE,
    )

    def extract_text(self, file_bytes: bytes) -> str:
        if not PYMUPDF_AVAILABLE:
            logger.warning("PyMuPDF (fitz) is not installed; returning empty text.")
            return ""
        if not file_bytes:
            return ""

        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            full_text = []
            for page in doc:
                t = page.get_text()
                if t:
                    full_text.append(t)
            doc.close()
            return "\n".join(full_text)
        except Exception as e:  # noqa: BLE001
            logger.error(f"Failed to extract text from PDF: {e}")
            return ""

    def extract_sections(self, file_bytes: bytes) -> list[dict[str, Any]]:
        """Extract page-by-page text structure with section header detection."""
        sections = []
        if not PYMUPDF_AVAILABLE or not file_bytes:
            return sections

        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            current_section: str | None = None

            for page_index, page in enumerate(doc):
                page_num = page_index + 1
                text = page.get_text()
                if not text or not text.strip():
                    continue  # Skip completely empty pages safely

                # Look for section header in top lines of the page
                lines = [line.strip() for line in text.splitlines() if line.strip()]
                for line in lines[:8]:
                    match = self.SECTION_PATTERN.match(line)
                    if match and len(line) < 60:
                        current_section = line
                        break

                sections.append({
                    "page_number": page_num,
                    "section_name": current_section,
                    "text": text.strip(),
                    "char_count": len(text.strip()),
                })
            doc.close()
        except Exception as e:  # noqa: BLE001
            logger.error(f"Failed to extract sections from PDF: {e}")

        return sections

    def extract_chunks(
        self,
        file_bytes: bytes,
        min_chunk_len: int = 100,
        max_chunk_len: int = 800,
    ) -> list[dict[str, Any]]:
        """
        Extract semantic text chunks preserving page numbers and section headers.
        Splits page text into paragraph-level segments without losing context.
        """
        chunks = []
        sections = self.extract_sections(file_bytes)

        for sec in sections:
            page_num = sec["page_number"]
            sec_name = sec.get("section_name")
            text = sec["text"]

            raw_paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            if not raw_paragraphs:
                raw_paragraphs = [text]

            current_buf: list[str] = []
            current_len = 0

            for para in raw_paragraphs:
                if len(para) > max_chunk_len:
                    sentences = re.split(r"(?<=[.!?])\s+", para)
                    for sent in sentences:
                        s = sent.strip()
                        if not s:
                            continue
                        if current_len + len(s) > max_chunk_len and current_buf:
                            chunk_text = " ".join(current_buf).strip()
                            if len(chunk_text) >= min_chunk_len:
                                chunks.append({
                                    "page_number": page_num,
                                    "section_name": sec_name,
                                    "chunk_text": chunk_text,
                                })
                            current_buf = [s]
                            current_len = len(s)
                        else:
                            current_buf.append(s)
                            current_len += len(s)
                else:
                    if current_len + len(para) > max_chunk_len and current_buf:
                        chunk_text = " ".join(current_buf).strip()
                        if len(chunk_text) >= min_chunk_len:
                            chunks.append({
                                "page_number": page_num,
                                "section_name": sec_name,
                                "chunk_text": chunk_text,
                            })
                        current_buf = [para]
                        current_len = len(para)
                    else:
                        current_buf.append(para)
                        current_len += len(para)

            if current_buf:
                chunk_text = " ".join(current_buf).strip()
                if len(chunk_text) >= min_chunk_len:
                    chunks.append({
                        "page_number": page_num,
                        "section_name": sec_name,
                        "chunk_text": chunk_text,
                    })
                elif chunks:
                    if chunks[-1]["page_number"] == page_num:
                        chunks[-1]["chunk_text"] += " " + chunk_text
                    else:
                        chunks.append({
                            "page_number": page_num,
                            "section_name": sec_name,
                            "chunk_text": chunk_text,
                        })
                else:
                    chunks.append({
                        "page_number": page_num,
                        "section_name": sec_name,
                        "chunk_text": chunk_text,
                    })

        return chunks
