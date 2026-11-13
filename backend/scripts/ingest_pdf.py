"""
CLI utility to ingest local scientific PDF documents into FlameSafe AI.
Usage:
    python -m scripts.ingest_pdf --investigation-id <UUID> --title "Paper Title" --pdf path/to/file.pdf --doi 10.1016/...
"""
import argparse
import asyncio
import os
from app.core.database import init_db, AsyncSessionLocal
from app.ingestion.pipeline import ScientificIngestionPipeline
from app.core.logging import logger


async def run_cli():
    parser = argparse.ArgumentParser(description="Ingest a scientific PDF into FlameSafe AI")
    parser.add_argument("--investigation-id", required=True, help="Target NASA Investigation UUID")
    parser.add_argument("--title", required=True, help="Publication title")
    parser.add_argument("--pdf", required=True, help="Path to local PDF file")
    parser.add_argument("--doi", default=None, help="Optional DOI identifier")
    parser.add_argument("--source-url", default=None, help="Optional source URL")
    args = parser.parse_args()

    if not os.path.exists(args.pdf):
        logger.error(f"PDF file not found: {args.pdf}")
        return

    with open(args.pdf, "rb") as f:
        pdf_bytes = f.read()

    await init_db()
    async with AsyncSessionLocal() as session:
        pipeline = ScientificIngestionPipeline(session)
        result = await pipeline.ingest_document_bytes(
            investigation_id=args.investigation_id,
            title=args.title,
            file_bytes=pdf_bytes,
            doi=args.doi,
            source_url=args.source_url,
            file_path=args.pdf,
        )
        logger.info(
            f"Ingestion finished: status={result.status}, "
            f"chunks_created={result.chunks_created}, "
            f"chunks_deduplicated={result.chunks_deduplicated}, "
            f"error={result.error_message}"
        )


if __name__ == "__main__":
    asyncio.run(run_cli())
