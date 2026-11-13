from typing import List, Tuple
from app.models.evidence_chunk import EvidenceChunk
from app.schemas.assistant import CitationItem


class CitationValidator:
    """Extracts, validates, and builds verifiable citations from retrieved chunks."""

    @staticmethod
    def build_citations(
        scored_chunks: List[Tuple[EvidenceChunk, float]]
    ) -> List[CitationItem]:
        citations: List[CitationItem] = []

        for idx, (chunk, score) in enumerate(scored_chunks, start=1):
            doc = chunk.document
            inv = doc.investigation if doc else None

            inv_acronym = inv.acronym if inv else "NASA-PSI"
            psi_id = inv.psi_id if inv else "PSI-UNKNOWN"
            doc_title = doc.title if doc else "NASA Technical Report"
            doi = doc.doi if doc else (inv.doi if inv else None)
            source_url = doc.source_url if doc else (inv.source_url if inv else "https://psi.nasa.gov/physci/repo")

            verification_status = "Verified Source" if (doi and psi_id) else "Secondary Reference"

            citations.append(
                CitationItem(
                    citation_id=f"CIT-{idx:03d}",
                    investigation_acronym=inv_acronym,
                    psi_id=psi_id,
                    document_title=doc_title,
                    doi=doi,
                    source_url=source_url,
                    page_number=chunk.page_number,
                    section_name=chunk.section_name,
                    excerpt=chunk.chunk_text[:280] + ("..." if len(chunk.chunk_text) > 280 else ""),
                    verification_status=verification_status,
                )
            )

        return citations
