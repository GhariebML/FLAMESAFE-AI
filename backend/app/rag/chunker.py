from typing import List, Dict, Any


class ScientificTextChunker:
    """
    Chunks scientific texts preserving paragraph semantics and approximate token sizes.
    """

    def __init__(self, target_chunk_size: int = 500, overlap: int = 50):
        self.target_chunk_size = target_chunk_size
        self.overlap = overlap

    def chunk_document(
        self,
        text: str,
        document_id: str,
        section_name: str = "General",
        page_number: int = 1,
    ) -> List[Dict[str, Any]]:
        if not text:
            return []

        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        chunks = []
        current_chunk: List[str] = []
        current_len = 0

        for p in paragraphs:
            p_len = len(p.split())
            if current_len + p_len > self.target_chunk_size and current_chunk:
                chunk_str = " ".join(current_chunk)
                chunks.append({
                    "document_id": document_id,
                    "chunk_text": chunk_str,
                    "section_name": section_name,
                    "page_number": page_number,
                })
                current_chunk = [p]
                current_len = p_len
            else:
                current_chunk.append(p)
                current_len += p_len

        if current_chunk:
            chunks.append({
                "document_id": document_id,
                "chunk_text": " ".join(current_chunk),
                "section_name": section_name,
                "page_number": page_number,
            })

        return chunks
