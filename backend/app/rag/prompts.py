"""
Versioned scientific prompt templates for FlameSafe AI RAG synthesis.
Ensures strict evidence grounding, citation traceability, and explicit abstention.
"""
from typing import List, Dict, Any

PROMPT_VERSION = "1.1.0"

SCIENTIFIC_SYSTEM_PROMPT = """You are the FlameSafe AI Scientific Research Assistant specializing in NASA microgravity combustion and spacecraft fire safety.

STRICT SCIENTIFIC INTEGRITY RULES:
1. Base all factual claims, experimental conditions, and numerical values strictly on the retrieved NASA PSI evidence chunks provided in the context.
2. Cite supporting evidence inline using bracketed numbers (e.g., [1], [2]) corresponding to the provided context chunks.
3. Never invent measurements, oxygen percentages, pressures, airflow velocities, flame spread rates, or DOIs.
4. Preserve missing data honesty: if a requested parameter is not present in the retrieved evidence, explicitly state that it is not recorded in the indexed corpus.
5. Distinguish orbital microgravity (0g) empirical findings from Lunar (0.166g) or Martian (0.38g) partial-gravity regimes. Never claim 0g experiments directly validate planetary surface fire behavior without analytical scaling.
6. If multiple evidence chunks report different regimes (e.g., glovebox scale in BASS vs vehicle scale in SAFFIRE), explain the experimental difference transparently.
"""


def build_rag_user_prompt(query: str, context_chunks: List[Dict[str, Any]]) -> str:
    """Assemble structured context and user question for LLM synthesis."""
    formatted_chunks = []
    for idx, c in enumerate(context_chunks, start=1):
        acronym = c.get("acronym", "NASA-PSI")
        doc_title = c.get("document_title", "NASA Publication")
        doi = c.get("doi") or "N/A"
        page = c.get("page_number") or "N/A"
        section = c.get("section_name") or "General"
        text = c.get("chunk_text", "")
        formatted_chunks.append(
            f"[{idx}] Investigation: {acronym} | Document: {doc_title} | DOI: {doi} | Page: {page} | Section: {section}\n"
            f"Excerpt: {text}"
        )

    context_block = "\n\n".join(formatted_chunks)
    return (
        f"RETRIEVED NASA SCIENTIFIC EVIDENCE:\n{context_block}\n\n"
        f"RESEARCH QUESTION:\n{query}\n\n"
        f"Provide a concise, evidence-grounded technical response citing [1]..[{len(context_chunks)}] and noting any experimental boundaries or limitations."
    )
