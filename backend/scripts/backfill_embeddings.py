"""
CLI utility to backfill or re-embed FlameSafe AI EvidenceChunk vectors using the configured EmbeddingProvider.

Usage:
    cd backend
    python -m scripts.backfill_embeddings --batch-size 10
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import AsyncSessionLocal
from app.rag.backfill import EmbeddingBackfillService


async def _main(batch_size: int, limit: int | None, strict_live: bool) -> int:
    async with AsyncSessionLocal() as session:
        summary = await EmbeddingBackfillService.backfill_chunks(
            session=session,
            batch_size=batch_size,
            limit=limit,
            require_live_provider=strict_live,
        )
        print(json.dumps(summary, indent=2))
        return 0 if summary["failed_count"] == 0 else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backfill FlameSafe AI EvidenceChunk embeddings.")
    parser.add_argument("--batch-size", type=int, default=10, help="Number of chunks per embedding batch")
    parser.add_argument("--limit", type=int, default=None, help="Optional maximum number of chunks to process")
    parser.add_argument(
        "--strict-live",
        action="store_true",
        help="Fail immediately if live Gemini provider is not configured or reachable",
    )
    args = parser.parse_args()
    raise SystemExit(asyncio.run(_main(args.batch_size, args.limit, args.strict_live)))
