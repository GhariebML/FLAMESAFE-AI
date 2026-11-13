import re

from app.models.evidence_chunk import EvidenceChunk
from app.schemas.assistant import CitationItem


class CitationValidator:
    """Extracts, validates, and builds verifiable citations from retrieved chunks."""

    PARTIAL_GRAVITY_KEYWORDS = frozenset({
        "moon",
        "lunar",
        "lunar surface",
        "lunar habitat",
        "lunar base",
        "lunar rover",
        "mars",
        "martian",
        "martian surface",
        "martian habitat",
        "partial gravity",
        "partial-gravity",
        "fractional gravity",
        "fractional-gravity",
        "reduced gravity",
        "0.166g",
        "0.166 g",
        "0.38g",
        "0.38 g",
        "1/6 g",
        "1/6g",
        "1/6-g",
    })

    COMBUSTION_DOMAIN_KEYWORDS = frozenset({
        "flame",
        "fire",
        "combustion",
        "extinction",
        "extinguish",
        "extinguishment",
        "suppression",
        "quench",
        "airflow",
        "ventilation",
        "oxygen",
        "pressure",
        "soot",
        "smoke",
        "aerosol",
        "detector",
        "detection",
        "droplet",
        "fuel",
        "pmma",
        "polymer",
        "fabric",
        "cotton",
        "bass",
        "saffire",
        "flex",
        "same",
        "acme",
        "microgravity",
        "gravity",
        "spacecraft",
        "iss",
        "habitat",
        "burning",
        "burning rate",
        "ignition",
        "flammability",
        "convection",
        "buoyancy",
        "fire safety",
        "pyrolysis",
        "thermal",
    })

    DOI_PATTERN = re.compile(r"^10\.\d{4,9}/[-._;()/:A-Za-z0-9]+$")
    INLINE_CITATION_PATTERN = re.compile(r"\[CIT-(\d{1,4})\]")

    @classmethod
    def is_valid_doi(cls, doi: str | None) -> bool:
        """Validates standard DOI format starting with 10.xxxx/."""
        if not doi or not isinstance(doi, str):
            return False
        clean_doi = doi.strip()
        if clean_doi.startswith("https://doi.org/"):
            clean_doi = clean_doi.removeprefix("https://doi.org/")
        elif clean_doi.startswith("http://doi.org/"):
            clean_doi = clean_doi.removeprefix("http://doi.org/")
        return bool(cls.DOI_PATTERN.match(clean_doi))

    @staticmethod
    def _is_valid_psi_id(psi_id: str | None) -> bool:
        if not psi_id or not isinstance(psi_id, str):
            return False
        clean = psi_id.strip()
        return clean.startswith("PSI-") and clean != "PSI-UNKNOWN" and len(clean) > 4

    @classmethod
    def classify_source(
        cls,
        doi: str | None,
        psi_id: str | None,
        document_title: str | None,
        source_url: str | None,
    ) -> str:
        """
        Authoritative 3-tier classification:
        1. Verified Source: Authoritative NASA PSI investigation record with valid DOI, valid PSI ID,
           and documented title.
        2. Secondary Reference: Traceable peer-reviewed or technical literature with valid DOI or specific URL,
           not directly registered as a canonical PSI investigation.
        3. Unverified: Incomplete or untraceable metadata.
        """
        has_valid_doi = cls.is_valid_doi(doi)
        has_valid_psi = cls._is_valid_psi_id(psi_id)
        has_title = bool(document_title and document_title.strip() and document_title != "NASA Technical Report")
        has_url = bool(
            source_url
            and source_url.strip().startswith("http")
            and source_url.strip() != "https://psi.nasa.gov/physci/repo"
        )

        if has_valid_doi and has_valid_psi and has_title:
            return "Verified Source"
        if has_valid_doi or (has_url and has_title) or has_valid_psi:
            return "Secondary Reference"
        return "Unverified"

    @classmethod
    def build_citations(
        cls,
        scored_chunks: list[tuple[EvidenceChunk, float]],
    ) -> list[CitationItem]:
        citations: list[CitationItem] = []

        for idx, (chunk, _score) in enumerate(scored_chunks, start=1):
            doc = chunk.document
            inv = doc.investigation if doc else None

            inv_acronym = (inv.acronym if inv and inv.acronym else None) or "NASA-PSI"
            psi_id = (inv.psi_id if inv and inv.psi_id else None) or "PSI-UNKNOWN"
            doc_title = (doc.title if doc and doc.title else None) or "NASA Technical Report"
            doi = doc.doi if doc else (inv.doi if inv else None)
            source_url = (
                doc.source_url
                if doc and doc.source_url
                else (inv.source_url if inv and inv.source_url else "https://psi.nasa.gov/physci/repo")
            )

            verification_status = cls.classify_source(
                doi=doi,
                psi_id=psi_id,
                document_title=doc_title,
                source_url=source_url,
            )

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
                    chunk_id=chunk.id,
                )
            )

        return citations

    @classmethod
    def validate_citations_match_chunks(
        cls, citations: list[CitationItem], chunks: list[EvidenceChunk]
    ) -> list[CitationItem]:
        """
        Strict chunk-level provenance validator.
        Uses primary chunk IDs when available, with fallback to excerpt matching.
        Guarantees that no citation can reference an unretrieved document chunk.
        Deduplicates valid citations by (citation_id, chunk_id).
        """
        valid_citations: list[CitationItem] = []
        seen_keys: set[tuple[str, str | None]] = set()
        valid_chunk_ids = {c.id for c in chunks if c.id}
        chunk_snippets = [c.chunk_text.strip().lower() for c in chunks]

        for cit in citations:
            is_valid = False
            # 1. Primary check by chunk_id
            if cit.chunk_id:
                if cit.chunk_id in valid_chunk_ids:
                    is_valid = True
                else:
                    # Explicit chunk_id mismatch: reject immediately, do not fall back to text matching
                    is_valid = False
            else:
                # 2. Secondary check by text content (only when chunk_id is omitted)
                cit_excerpt_clean = cit.excerpt.rstrip(".").strip().lower()
                if cit_excerpt_clean and any(cit_excerpt_clean[:60] in snippet for snippet in chunk_snippets):
                    is_valid = True

            if is_valid:
                dedup_key = (cit.citation_id, cit.chunk_id)
                if dedup_key not in seen_keys:
                    seen_keys.add(dedup_key)
                    valid_citations.append(cit)

        return valid_citations

    @classmethod
    def sanitize_answer_inline_citations(
        cls, answer: str, valid_citations: list[CitationItem]
    ) -> str:
        """
        Sanitizes inline citation references in the generated answer text.
        If an LLM hallucinates inline citations like [CIT-999] that do not exist
        in the valid citations list, they are sanitized to prevent misleading inline links.
        """
        valid_citation_ids = {cit.citation_id for cit in valid_citations}

        def _replace_citation(match: re.Match) -> str:
            full_tag = match.group(0)
            if full_tag.strip("[]") in valid_citation_ids:
                return full_tag
            return "[Unverified Reference Removed]"

        return cls.INLINE_CITATION_PATTERN.sub(_replace_citation, answer)

    @classmethod
    def is_partial_gravity_query(cls, query: str) -> bool:
        """Detects whether inquiry targets lunar, Martian, or fractional gravity environments."""
        q_lower = query.lower()
        return any(term in q_lower for term in cls.PARTIAL_GRAVITY_KEYWORDS)

    @classmethod
    def has_combustion_domain_terms(cls, query: str) -> bool:
        """Detects if query contains authentic combustion or fire safety keywords."""
        q_lower = query.lower()
        return any(term in q_lower for term in cls.COMBUSTION_DOMAIN_KEYWORDS)

    @classmethod
    def get_partial_gravity_warning(cls) -> str:
        """
        Scientifically accurate partial-gravity advisory.
        Explains that microgravity measurements do not directly predict partial-gravity
        fire behavior, that buoyancy regimes diverge, and that analytical scaling
        is theoretical and context-dependent.
        """
        return (
            "SCIENTIFIC INTEGRITY ADVISORY — PARTIAL-GRAVITY EXTRAPOLATION NOTICE:\n"
            "Indexed flight investigations (BASS, SAFFIRE, FLEX, SAME, ACME) were conducted under orbital "
            "microgravity (~10^-6 g) aboard the ISS and Cygnus vehicles, where natural buoyant convection is suppressed. "
            "In contrast, lunar surface gravity (0.166g) and Martian surface gravity (0.38g) introduce residual buoyant flows "
            "that alter flame attachment, convective heat transfer, upward flame spread, and soot agglomeration.\n"
            "Empirical microgravity (0g) flight measurements CANNOT be directly equated to lunar or Martian surface fire "
            "safety predictions. Analytical extrapolation requires verified multi-phase physical modeling and regime-specific "
            "buoyancy scaling (e.g., Grashof number analysis where convective flow dominates diffusive transport). "
            "Such analytical scalings represent theoretical approximations and must NEVER be treated as verified NASA "
            "experimental measurements or flight-certified safety clearances."
        )

    @classmethod
    def is_out_of_domain_query(cls, query: str, top_score: float, threshold: float = 0.65) -> bool:
        """
        Determines if a query is out-of-domain: possesses zero combustion/fire safety terminology
        and fails to achieve high confidence against the document corpus.
        """
        has_domain_terms = cls.has_combustion_domain_terms(query)
        return not has_domain_terms and top_score < threshold
