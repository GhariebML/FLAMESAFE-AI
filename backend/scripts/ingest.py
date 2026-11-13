import argparse
import asyncio
import json
import os
import sys
from typing import Any

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, init_db
from app.core.logging import logger
from app.ingestion.extractors.pdf_extractor import PDFExtractor
from app.ingestion.parsers.metadata_parser import MetadataParser
from app.ingestion.sources.psi_adapter import PSISourceAdapter, sanitize_filename
from app.ingestion.validators.scientific_validator import ScientificValidator
from app.models.base import generate_uuid
from app.models.evidence_chunk import EvidenceChunk
from app.models.investigation import Investigation
from app.models.research_document import ResearchDocument
from app.repositories.document_repo import DocumentRepository
from app.repositories.investigation_repo import InvestigationRepository


async def find_investigation(session: AsyncSession, identifier: str) -> Investigation | None:
    """Find investigation by internal UUID, NASA PSI ID, or acronym via repository."""
    inv_repo = InvestigationRepository(session)
    # 1. Try acronym lookup
    inv = await inv_repo.get_by_acronym(identifier)
    if inv:
        return inv
    # 2. Try ID / PSI ID lookup
    return await inv_repo.get_by_id(identifier)


async def ingest_single_document(
    session: AsyncSession,
    investigation_id_or_acronym: str,
    title: str,
    source_url: str | None = None,
    file_path: str | None = None,
    doi: str | None = None,
    document_type: str = "Peer-Reviewed Journal Article",
    adapter: PSISourceAdapter | None = None,
    extractor: PDFExtractor | None = None,
) -> bool:
    """Ingest a single scientific document and its extracted chunks into the database."""
    adapter = adapter or PSISourceAdapter()
    extractor = extractor or PDFExtractor()

    # 1. Unify and normalize document metadata through MetadataParser
    raw_meta = {
        "title": title,
        "document_type": document_type,
        "doi": doi,
        "source_url": source_url,
        "file_path": file_path,
    }
    normalized = MetadataParser.parse_document_record(raw_meta)
    norm_title = normalized["title"]
    norm_doc_type = normalized["document_type"]
    norm_doi = normalized["doi"]
    norm_source_url = normalized["source_url"]
    norm_file_path = normalized["file_path"]

    # 2. Resolve Investigation
    inv = await find_investigation(session, investigation_id_or_acronym)
    if not inv:
        logger.error(f"Investigation not found for identifier: '{investigation_id_or_acronym}'. Ingestion aborted.")
        return False

    # 3. Validate DOI format if present
    if norm_doi and not ScientificValidator.validate_doi(norm_doi):
        logger.warning(f"DOI '{norm_doi}' does not match standard regex format. Proceeding with caution.")

    # 4. Obtain PDF bytes (from local file or remote source_url)
    pdf_bytes: bytes | None = None
    cached_relative_path: str | None = None

    if norm_file_path and os.path.exists(norm_file_path):
        logger.info(f"Reading PDF from local file: {norm_file_path}")
        try:
            with open(norm_file_path, "rb") as f:  # noqa: ASYNC230
                pdf_bytes = f.read()
            cached_relative_path = norm_file_path
        except OSError as e:
            logger.error(f"Failed to read local file {norm_file_path}: {e}")
            return False
    elif norm_source_url:
        doc_key = norm_doi.replace("/", "_") if norm_doi else sanitize_filename(norm_title[:40])
        pdf_bytes = await adapter.fetch_document_content(document_id=doc_key, source_url=norm_source_url)
        cached_relative_path = os.path.join("data", "raw", f"{doc_key}.pdf")
    else:
        logger.error("Neither a valid local file_path nor a source_url was provided.")
        return False

    if not pdf_bytes or not pdf_bytes.startswith(b"%PDF-"):
        logger.error("Content is empty or does not represent a valid PDF. Ingestion failed.")
        return False

    # 5. Check for existing document in database (deduplication via repository)
    doc_repo = DocumentRepository(session)
    existing_doc: ResearchDocument | None = None
    if norm_doi:
        existing_doc = await doc_repo.get_by_doi(norm_doi)
    if not existing_doc:
        existing_doc = await doc_repo.get_by_title_and_investigation(norm_title, inv.id)

    if existing_doc:
        doc_id = existing_doc.id
        logger.info(f"Document already exists (ID: {doc_id}). Checking existing chunks...")
        # Check if chunks already exist via repository
        existing_chunks = await doc_repo.get_chunks_by_document_id(doc_id)
        if existing_chunks:
            logger.info(
                f"Document '{norm_title}' already has {len(existing_chunks)} indexed chunks. "
                "Skipping duplicate ingestion."
            )
            return True
        doc = existing_doc
    else:
        doc_id = generate_uuid()
        doc = ResearchDocument(
            id=doc_id,
            investigation_id=inv.id,
            title=norm_title,
            document_type=norm_doc_type,
            doi=norm_doi,
            source_url=norm_source_url,
            file_path=cached_relative_path,
        )
        session.add(doc)
        logger.info(f"Created new ResearchDocument record: {doc_id} ('{norm_title}')")

    # 6. Extract chunks with page numbers and section headers
    chunks_data = extractor.extract_chunks(pdf_bytes)
    if not chunks_data:
        logger.warning(f"No extractable text chunks found in PDF for document '{norm_title}'.")
        await session.commit()
        return True

    logger.info(f"Extracted {len(chunks_data)} chunks from PDF. Persisting to database...")

    for c in chunks_data:
        chunk = EvidenceChunk(
            id=generate_uuid(),
            document_id=doc.id,
            chunk_text=c["chunk_text"],
            page_number=c.get("page_number"),
            section_name=c.get("section_name"),
            metadata_payload={
                "doi": doc.doi,
                "investigation_acronym": inv.acronym,
                "source_url": doc.source_url,
                "char_count": len(c["chunk_text"]),
            },
        )
        session.add(chunk)

    await session.commit()
    logger.info(f"Successfully ingested '{norm_title}' with {len(chunks_data)} chunks linked to investigation {inv.acronym}.")
    return True


async def ingest_manifest(session: AsyncSession, manifest_path: str) -> bool:
    """Batch ingest documents defined in a JSON manifest file."""
    if not os.path.exists(manifest_path):
        logger.error(f"Manifest file not found: {manifest_path}")
        return False

    with open(manifest_path, "r", encoding="utf-8") as f:  # noqa: ASYNC230
        manifest_data: list[dict[str, Any]] = json.load(f)

    logger.info(f"Loaded manifest with {len(manifest_data)} documents from {manifest_path}")
    adapter = PSISourceAdapter()
    extractor = PDFExtractor()

    overall_success = True
    for item in manifest_data:
        parsed = MetadataParser.parse_document_record(item)
        inv_target = parsed.get("investigation_id") or item.get("acronym")
        if not inv_target:
            logger.warning(f"Skipping entry missing investigation identifier: {item}")
            overall_success = False
            continue

        success = await ingest_single_document(
            session=session,
            investigation_id_or_acronym=inv_target,
            title=parsed["title"],
            source_url=parsed.get("source_url"),
            file_path=parsed.get("file_path"),
            doi=parsed.get("doi"),
            document_type=parsed.get("document_type", "Peer-Reviewed Journal Article"),
            adapter=adapter,
            extractor=extractor,
        )
        if not success:
            overall_success = False

    return overall_success


async def run_cli(args: argparse.Namespace) -> int:
    """CLI runner."""
    await init_db()
    async with AsyncSessionLocal() as session:
        if args.manifest:
            success = await ingest_manifest(session, args.manifest)
        elif args.investigation and args.title:
            success = await ingest_single_document(
                session=session,
                investigation_id_or_acronym=args.investigation,
                title=args.title,
                source_url=args.url,
                file_path=args.file,
                doi=args.doi,
                document_type=args.type or "Peer-Reviewed Journal Article",
            )
        else:
            print("Error: Either --manifest or both --investigation and --title must be provided.", file=sys.stderr)
            return 1

    return 0 if success else 1


def main():
    parser = argparse.ArgumentParser(
        description="FlameSafe AI - Scientific Research Publication Ingestion Pipeline"
    )
    parser.add_argument(
        "--manifest",
        type=str,
        help="Path to JSON manifest file containing multiple documents to ingest.",
    )
    parser.add_argument(
        "--investigation",
        "-i",
        type=str,
        help="Target NASA Investigation UUID, PSI ID, or Acronym (e.g. BASS, SAFFIRE, ACME).",
    )
    parser.add_argument(
        "--title",
        "-t",
        type=str,
        help="Full title of the scientific research paper.",
    )
    parser.add_argument(
        "--doi",
        type=str,
        help="Digital Object Identifier (e.g. 10.1016/j.proci.2014.05.077).",
    )
    parser.add_argument(
        "--url",
        "-u",
        type=str,
        help="Public URL to download the scientific PDF.",
    )
    parser.add_argument(
        "--file",
        "-f",
        type=str,
        help="Path to local PDF file for offline ingestion.",
    )
    parser.add_argument(
        "--type",
        type=str,
        default="Peer-Reviewed Journal Article",
        help="Publication classification (e.g. Peer-Reviewed Journal Article, Tech Report).",
    )

    args = parser.parse_args()
    exit_code = asyncio.run(run_cli(args))
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
