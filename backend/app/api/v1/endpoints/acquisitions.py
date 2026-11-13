"""Scientific File Acquisition API endpoints (/api/v1/acquisitions)."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.connectors.psi.download_strategy import PSIDownloadStrategy
from app.connectors.psi.file_manifest import PSIFileManifestService
from app.connectors.psi.source_validator import PSISourceValidator
from app.core.database import get_db
from app.datasets.storage_vault import StorageVaultService
from app.models.multi_agent import AcquisitionJob, FileAsset
from app.schemas.common import APIResponseEnvelope
from app.schemas.multi_agent import AcquisitionJobSchema, AcquisitionRequestSchema

router = APIRouter(prefix="/acquisitions", tags=["Scientific File Acquisition"])


@router.post(
    "",
    response_model=APIResponseEnvelope[list[AcquisitionJobSchema]],
    status_code=status.HTTP_201_CREATED,
)
async def create_acquisition_jobs(
    payload: AcquisitionRequestSchema,
    db: AsyncSession = Depends(get_db),
):
    """Acquires one or more NASA PSI files with allowlist validation, SSRF protection, and SHA-256 vault storage."""
    vault = StorageVaultService()
    created_jobs: list[AcquisitionJob] = []

    for file_id in payload.file_identifiers:
        meta_entry = PSIFileManifestService.get_file_by_id(file_id)
        acronym = meta_entry["investigation_acronym"] if meta_entry else "PSI"
        source_url = meta_entry["source_url"] if meta_entry else "https://psi.nasa.gov/physci/repo"

        acq_status, meta, content_bytes = await PSIDownloadStrategy.acquire_file(file_id, user_approved=True)
        is_downloaded = acq_status in ("DOWNLOAD_COMPLETED", "DOWNLOADED")

        job_row = AcquisitionJob(
            request_id=payload.request_id,
            file_identifier=file_id,
            investigation_acronym=acronym,
            source_url=source_url,
            status=acq_status,
            http_status=meta.get("http_status", 200 if is_downloaded else None),
            content_type=meta.get("mime_type", "application/json"),
            bytes_downloaded=meta.get("bytes_downloaded", 0),
            sha256_hash=meta.get("sha256_hash"),
            storage_uri=None,
            handoff_instructions=meta.get("handoff_instructions") or meta.get("status_explanation"),
            error_message=meta.get("error_message"),
            completed_at=datetime.now(timezone.utc) if is_downloaded else None,
        )

        if is_downloaded and content_bytes is not None:
            fname = meta_entry["file_name"] if meta_entry else f"{file_id}.json"
            vault_meta = vault.store_raw_asset(
                file_identifier=file_id,
                filename=PSISourceValidator.sanitize_filename(fname),
                content=content_bytes,
            )
            job_row.storage_uri = vault_meta["local_vault_path"]
            job_row.sha256_hash = vault_meta["checksum_sha256"]
            job_row.bytes_downloaded = vault_meta["file_size_bytes"]

            existing_asset_res = await db.execute(
                select(FileAsset).where(FileAsset.sha256_hash == vault_meta["checksum_sha256"])
            )
            if existing_asset_res.scalars().first() is None:
                asset_row = FileAsset(
                    file_identifier=file_id,
                    investigation_acronym=acronym,
                    file_name=PSISourceValidator.sanitize_filename(fname),
                    storage_backend=vault_meta["storage_backend"],
                    storage_uri=vault_meta["local_vault_path"],
                    sha256_hash=vault_meta["checksum_sha256"],
                    file_size_bytes=vault_meta["file_size_bytes"],
                    mime_type=meta.get("mime_type", "application/json"),
                    source_url=source_url,
                    file_version="1.0.0",
                )
                db.add(asset_row)

        db.add(job_row)
        await db.flush()
        created_jobs.append(job_row)

    await db.commit()
    return APIResponseEnvelope(
        data=[
            AcquisitionJobSchema(
                id=j.id,
                request_id=j.request_id,
                file_identifier=j.file_identifier,
                investigation_acronym=j.investigation_acronym,
                source_url=j.source_url,
                status=j.status,
                http_status=j.http_status,
                content_type=j.content_type,
                bytes_downloaded=j.bytes_downloaded,
                sha256_hash=j.sha256_hash,
                storage_uri=j.storage_uri,
                retry_count=j.retry_count,
                handoff_instructions=j.handoff_instructions,
                status_explanation=j.handoff_instructions or f"Acquisition status: {j.status}",
                error_message=j.error_message,
                created_at=j.created_at,
                completed_at=j.completed_at,
            )
            for j in created_jobs
        ]
    )


@router.get(
    "/{acquisition_id}",
    response_model=APIResponseEnvelope[AcquisitionJobSchema],
    status_code=status.HTTP_200_OK,
)
async def get_acquisition_job(
    acquisition_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Returns status, SHA-256 hash, and vault URI or handoff instructions for an acquisition job."""
    res = await db.execute(select(AcquisitionJob).where(AcquisitionJob.id == acquisition_id))
    j = res.scalars().first()
    if not j:
        raise HTTPException(status_code=404, detail=f"AcquisitionJob '{acquisition_id}' not found.")
    return APIResponseEnvelope(
        data=AcquisitionJobSchema(
            id=j.id,
            request_id=j.request_id,
            file_identifier=j.file_identifier,
            investigation_acronym=j.investigation_acronym,
            source_url=j.source_url,
            status=j.status,
            http_status=j.http_status,
            content_type=j.content_type,
            bytes_downloaded=j.bytes_downloaded,
            sha256_hash=j.sha256_hash,
            storage_uri=j.storage_uri,
            retry_count=j.retry_count,
            handoff_instructions=j.handoff_instructions,
            error_message=j.error_message,
            created_at=j.created_at,
            completed_at=j.completed_at,
        )
    )
