"""CLI Smoke-Test Script for Live NASA PSI, NTRS, and DOI Verification (Priority 3)."""

import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.connectors.psi.live_inspector import PSILiveConnectorInspector


async def main() -> None:
    trace_path = Path(__file__).resolve().parents[1] / "data" / "psi_live_catalog_trace.json"
    report = await PSILiveConnectorInspector.run_live_smoke_check(save_trace_path=trace_path)
    print(f"Live NASA PSI smoke test completed at {report['audit_timestamp']}.")
    print(f"Saved traceable catalog record to: {trace_path}")
    print(
        json.dumps(
            {
                "landing_http_status": report["psi_portal_probe"].get("landing_http_status"),
                "requires_interactive_browser_portal": report["psi_portal_probe"].get(
                    "requires_interactive_browser_portal"
                ),
                "verified_investigations": [
                    {
                        "source_record_id": r["source_record_id"],
                        "acronym": r["acronym"],
                        "publication_doi_live_verified": r["publication_doi_live_verified"],
                        "ntrs_matches_count": len(r["ntrs_live_matches"]),
                        "psi_portal_status": r["psi_portal_status"],
                    }
                    for r in report["trace_records"]
                ],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    asyncio.run(main())
