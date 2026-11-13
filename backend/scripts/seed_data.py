import asyncio
import json
import os
from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal, init_db
from app.core.logging import logger
from app.models.investigation import Investigation
from app.models.experimental_run import ExperimentalRun
from app.models.measurement import Measurement
from app.models.research_document import ResearchDocument
from app.models.evidence_chunk import EvidenceChunk
from app.models.data_source import DataSource


def get_seed_path(filename: str) -> str:
    # Try looking in relative paths
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "seed", filename),
        os.path.join("data", "seed", filename),
        os.path.join("/app", "data", "seed", filename),
    ]
    for path in candidates:
        if os.path.exists(path):
            return os.path.abspath(path)
    return os.path.abspath(candidates[0])


async def seed_database_if_empty(session: AsyncSession) -> bool:
    count_query = select(func.count(Investigation.id))
    try:
        count = (await session.execute(count_query)).scalar_one()
        if count > 0:
            logger.info(f"Database already contains {count} investigations; skipping seeding.")
            return False
    except Exception as e:
        logger.warning(f"Could not check existing investigations: {e}")
        return False

    inv_path = get_seed_path("seed_investigations.json")
    doc_path = get_seed_path("seed_documents.json")

    if not os.path.exists(inv_path):
        logger.warning(f"Seed file not found: {inv_path}")
        return False

    logger.info(f"Seeding database from {inv_path}...")

    with open(inv_path, "r", encoding="utf-8") as f:
        investigations_data = json.load(f)

    for item in investigations_data:
        inv = Investigation(
            id=item["id"],
            psi_id=item["psi_id"],
            acronym=item["acronym"],
            title=item["title"],
            research_area=item["research_area"],
            objectives=item.get("objectives"),
            description=item.get("description"),
            doi=item.get("doi"),
            source_url=item.get("source_url"),
            metadata_payload=item.get("metadata", {}),
        )
        session.add(inv)

        # Runs
        for run_dict in item.get("experimental_runs", []):
            run = ExperimentalRun(
                id=run_dict["id"],
                investigation_id=inv.id,
                run_code=run_dict["run_code"],
                fuel_type=run_dict["fuel_type"],
                fuel_name=run_dict["fuel_name"],
                fuel_geometry=run_dict.get("fuel_geometry"),
                gravity_regime=run_dict["gravity_regime"],
                oxygen_concentration=run_dict.get("oxygen_concentration"),
                pressure_value=run_dict.get("pressure_value"),
                pressure_unit=run_dict.get("pressure_unit", "kPa"),
                airflow_velocity=run_dict.get("airflow_velocity"),
                airflow_unit=run_dict.get("airflow_unit", "cm/s"),
                suppressant=run_dict.get("suppressant"),
                sensor_types=run_dict.get("sensor_types"),
                experimental_notes=run_dict.get("experimental_notes"),
            )
            session.add(run)

            # Measurements
            for m in run_dict.get("measurements", []):
                meas = Measurement(
                    run_id=run.id,
                    metric_name=m["metric_name"],
                    metric_value=m.get("metric_value"),
                    unit=m["unit"],
                    measurement_time=m.get("measurement_time"),
                )
                session.add(meas)

        # Sources
        for s in item.get("data_sources", []):
            src = DataSource(
                investigation_id=inv.id,
                source_name=s["source_name"],
                source_url=s["source_url"],
                doi=s.get("doi"),
                version=s.get("version", "1.0"),
                accessed_at=datetime.now(timezone.utc),
            )
            session.add(src)

    # Documents & Evidence Chunks
    if os.path.exists(doc_path):
        with open(doc_path, "r", encoding="utf-8") as f:
            docs_data = json.load(f)
        for d in docs_data:
            doc = ResearchDocument(
                id=d["id"],
                investigation_id=d["investigation_id"],
                title=d["title"],
                document_type=d["document_type"],
                doi=d.get("doi"),
                source_url=d.get("source_url"),
                file_path=d.get("file_path"),
            )
            session.add(doc)

            for c in d.get("chunks", []):
                chunk = EvidenceChunk(
                    id=c["id"],
                    document_id=doc.id,
                    chunk_text=c["chunk_text"],
                    page_number=c.get("page_number"),
                    section_name=c.get("section_name"),
                    metadata_payload=c.get("metadata"),
                )
                session.add(chunk)

    await session.commit()
    logger.info("Database seeding successfully completed!")
    return True


async def main():
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_database_if_empty(session)


if __name__ == "__main__":
    asyncio.run(main())
