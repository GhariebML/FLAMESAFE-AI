"""Implementation of Specialist Agents 02 through 11 for the FlameSafe Multi-Agent System."""

import hashlib
import json
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.state import ResearchWorkflowState
from app.connectors.psi.discovery import PSIDiscoveryService
from app.connectors.psi.download_strategy import PSIDownloadStrategy
from app.connectors.psi.file_manifest import PSIFileManifestService
from app.connectors.psi.source_validator import PSISourceValidator
from app.datasets.engine import DynamicDatasetEngine
from app.datasets.storage_vault import StorageVaultService
from app.models.evidence_chunk import EvidenceChunk
from app.models.investigation import Investigation
from app.models.multi_agent import AcquisitionJob, Dataset, FileAsset
from app.models.research_document import ResearchDocument
from app.rag.generator import GeminiProviderError, get_llm_provider, sanitize_secret
from app.schemas.assistant import AssistantQueryRequest
from app.schemas.multi_agent import ResearchIntentSchema
from app.services.ai_service import AIService

KNOWN_CAMPAIGNS = [
    "BASS-II",
    "BASS",
    "SAFFIRE",
    "FLEX-2",
    "FLEX",
    "SAME-R",
    "SAME",
    "ACME",
    "CFI-G",
    "SOFIE",
    "BRE",
]

KNOWN_MATERIALS = [
    ("Solid Polymer (PMMA)", ["pmma", "acrylic", "polymethyl methacrylate", "plexiglas", "polymer"]),
    ("Solid Fabric Blend (SIBAL)", ["sibal", "cotton", "fiberglass", "fabric"]),
    ("Liquid Hydrocarbon (n-Heptane / Methanol)", ["heptane", "n-heptane", "methanol", "droplet", "liquid"]),
    ("Wire Insulation Polymer (Kapton / Teflon)", ["kapton", "teflon", "silicone", "wire", "smoke"]),
    ("Gaseous Hydrocarbon (Ethylene / Methane)", ["ethylene", "methane", "gas", "gaseous"]),
]

KNOWN_PARAMETERS = [
    ("flame_spread_rate", ["flame spread", "spread rate", "regression rate", "burn rate"]),
    ("oxygen_concentration", ["oxygen", "o2", "limiting oxygen", "loi", "flammability"]),
    ("airflow_velocity", ["airflow", "flow", "velocity", "forced flow"]),
    ("droplet_burning_rate_constant", ["droplet", "burning rate constant", "sooting", "flex"]),
    ("mass_median_diameter", ["smoke", "aerosol", "soot", "particle", "same", "detector"]),
    ("flame_height", ["flame height", "coflow", "acme"]),
]


class MultiAgentNodes:
    """Bounded, auditable agent implementations for Agents 02 through 11."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.vault = StorageVaultService()
        self.dataset_engine = DynamicDatasetEngine(vault=self.vault)

    # ------------------------------------------------------------------
    # AGENT 02 — Query Understanding Agent
    # ------------------------------------------------------------------
    async def agent_02_query_understanding(self, state: ResearchWorkflowState) -> dict[str, Any]:
        """Decomposes user research request into structured scientific intent matching ResearchIntentSchema."""
        query = state.get("user_query", "")
        q_lower = query.lower()

        existing_intent = state.get("research_intent")
        if existing_intent and existing_intent.get("revised_by_user"):
            return {
                "research_intent": existing_intent,
                "workflow_status": "CHECKING_EXISTING_DATA",
            }

        campaigns: list[str] = []
        for camp in KNOWN_CAMPAIGNS:
            if camp.lower() in q_lower and camp not in campaigns:
                campaigns.append(camp)

        fuel_type = "Solid Polymer"
        for canonical_fuel, aliases in KNOWN_MATERIALS:
            if any(alias in q_lower for alias in aliases):
                fuel_type = canonical_fuel
                break

        variables: list[str] = []
        for canonical_param, aliases in KNOWN_PARAMETERS:
            if any(alias in q_lower for alias in aliases):
                variables.append(canonical_param)
        if not variables:
            variables = ["oxygen_concentration", "flame_spread_rate", "airflow_velocity"]

        if any(k in q_lower for k in ["droplet", "heptane", "methanol", "flex"]):
            domain = "Droplet Combustion & Cool Flame Kinetics"
        elif any(k in q_lower for k in ["smoke", "aerosol", "soot", "same", "detector"]):
            domain = "Smoke Detection & Particle Morphology"
        elif any(k in q_lower for k in ["gas", "ethylene", "methane", "acme", "coflow"]):
            domain = "Gaseous Flame Stabilization & Soot Dynamics"
        else:
            domain = "Solid Fuel Flammability & Suppression"

        if any(k in q_lower for k in ["lunar", "moon", "artemis", "0.16"]):
            gravity = "Lunar Partial Gravity (0.166g)"
        elif any(k in q_lower for k in ["mars", "martian", "0.38"]):
            gravity = "Martian Partial Gravity (0.38g)"
        else:
            gravity = "Microgravity (~0g)"

        intent_type = "dataset_construction"
        if "compare" in q_lower or "vs" in q_lower:
            intent_type = "scientific_comparison"
        elif "smoke" in q_lower or "detector" in q_lower:
            intent_type = "smoke_detection"
        elif "gap" in q_lower or "limit" in q_lower:
            intent_type = "gap_analysis"

        if not campaigns:
            if "Droplet" in domain:
                campaigns = ["FLEX"]
            elif "Smoke" in domain:
                campaigns = ["SAME"]
            elif "Gaseous" in domain:
                campaigns = ["ACME"]
            else:
                campaigns = ["BASS", "SAFFIRE"]

        intent = {
            "intent_type": intent_type,
            "research_domain": domain,
            "fuel_type": fuel_type,
            "gravity_regime": gravity,
            "target_investigations": campaigns,
            "variables_of_interest": variables,
            "research_objectives": [
                "discover_verified_nasa_psi_investigations",
                "construct_versioned_canonical_dataset",
                "synthesize_evidence_backed_conclusions",
            ],
            "required_file_types": ["Experimental Tables", "Analyzed Data", "Scientific Publications"],
            "required_outputs": ["curated_dataset", "comparison", "scientific_report"],
            "ambiguities_detected": [],
            "search_strategy": "hybrid_local_and_psi_catalog",
        }

        llm = get_llm_provider()
        ai_meta: dict[str, Any] = {
            "provider": llm.provider_name,
            "model": llm.model_name,
            "is_mock_provider": llm.is_mock,
            "token_usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            "error_message": None,
        }

        if not llm.is_mock:
            try:
                structured_intent = await llm.generate_structured(
                    prompt=(
                        f"Decompose the following microgravity combustion research question into a structured "
                        f"ResearchIntentSchema JSON object.\nQuestion: {query}\n"
                        f"Known NASA PSI campaigns: {', '.join(KNOWN_CAMPAIGNS)}"
                    ),
                    response_schema=ResearchIntentSchema,
                    system_instructions=(
                        "You are the FlameSafe AI Query Understanding Agent (Agent 02). "
                        "Extract accurate scientific intent, target NASA PSI investigations, fuel_type, "
                        "gravity_regime, and variables_of_interest in valid JSON matching ResearchIntentSchema."
                    ),
                )
                llm_dict = structured_intent.model_dump()
                # Merge LLM structured fields while ensuring deterministic campaign/variable coverage is preserved
                for key in (
                    "intent_type",
                    "research_domain",
                    "fuel_type",
                    "gravity_regime",
                    "research_objectives",
                    "required_file_types",
                    "required_outputs",
                    "ambiguities_detected",
                    "search_strategy",
                ):
                    if llm_dict.get(key):
                        intent[key] = llm_dict[key]
                if llm_dict.get("target_investigations"):
                    merged_camps = list(dict.fromkeys([*campaigns, *llm_dict["target_investigations"]]))
                    intent["target_investigations"] = merged_camps
                if llm_dict.get("variables_of_interest"):
                    merged_vars = list(dict.fromkeys([*variables, *llm_dict["variables_of_interest"]]))
                    intent["variables_of_interest"] = merged_vars
                ai_meta["token_usage"] = dict(llm.last_token_usage or ai_meta["token_usage"])
                ai_meta["model"] = getattr(llm, "last_model_used", None) or llm.model_name
            except GeminiProviderError as err:
                ai_meta["is_mock_provider"] = True
                ai_meta["provider"] = "mock"
                ai_meta["model"] = "deterministic-intent-parser-v1"
                ai_meta["error_message"] = sanitize_secret(err.message)
            except Exception as exc:
                ai_meta["is_mock_provider"] = True
                ai_meta["provider"] = "mock"
                ai_meta["model"] = "deterministic-intent-parser-v1"
                ai_meta["error_message"] = sanitize_secret(str(exc))

        # Validate final dictionary against ResearchIntentSchema
        validated_schema = ResearchIntentSchema.model_validate(intent)
        final_intent_dict = validated_schema.model_dump()
        final_intent_dict["_ai_execution"] = ai_meta

        return {
            "research_intent": final_intent_dict,
            "workflow_status": "CHECKING_EXISTING_DATA",
        }

    # ------------------------------------------------------------------
    # AGENT 03 — Existing Knowledge & Dataset Reuse Agent
    # ------------------------------------------------------------------
    async def agent_03_existing_knowledge(self, state: ResearchWorkflowState) -> dict[str, Any]:
        """Checks FlameSafe database for existing investigations, chunks, and datasets before PSI discovery."""
        intent = state.get("research_intent", {})
        target_campaigns = [c.upper() for c in intent.get("target_investigations", [])]
        force_psi = bool(state.get("force_psi_discovery", False))

        inv_res = await self.db.execute(select(Investigation))
        all_invs = list(inv_res.scalars().all())
        local_acronyms = {inv.acronym.upper() for inv in all_invs}

        matched_acronyms = [
            inv.acronym
            for inv in all_invs
            if inv.acronym.upper() in target_campaigns
            or any(tc in inv.acronym.upper() or tc in inv.title.upper() for tc in target_campaigns)
        ]
        missing_invs = [tc for tc in target_campaigns if tc not in local_acronyms]

        docs_res = await self.db.execute(select(ResearchDocument))
        docs_count = len(list(docs_res.scalars().all()))

        chunks_res = await self.db.execute(select(EvidenceChunk))
        chunks_count = len(list(chunks_res.scalars().all()))

        ds_res = await self.db.execute(select(Dataset))
        all_datasets = list(ds_res.scalars().all())
        matched_dataset_keys: list[str] = []
        for ds in all_datasets:
            ds_invs = [str(x).upper() for x in (ds.source_investigation_ids or [])]
            if any(tc in ds_invs for tc in target_campaigns):
                matched_dataset_keys.append(ds.dataset_key)

        if matched_dataset_keys and matched_acronyms and not missing_invs and not force_psi:
            classification = "FULLY_AVAILABLE"
            rec = (
                f"Existing verified dataset ({matched_dataset_keys[0]}) and {len(matched_acronyms)} local "
                "investigations satisfy this request; reusing validated local records."
            )
        elif matched_acronyms and not missing_invs:
            classification = "PARTIALLY_AVAILABLE"
            rec = (
                f"Found {len(matched_acronyms)} matching investigations ({', '.join(matched_acronyms)}) in local DB; "
                "proceeding to PSI manifest inspection and versioned dataset assembly."
            )
        else:
            classification = "REQUIRES_NEW_DATA"
            rec = (
                f"Target campaigns ({', '.join(missing_invs or target_campaigns)}) require NASA PSI catalog "
                "discovery and file manifest selection."
            )

        coverage_obj = {
            "classification": classification,
            "matched_investigations": matched_acronyms,
            "existing_datasets_matched": matched_dataset_keys,
            "documents_available_count": docs_count,
            "evidence_chunks_count": chunks_count,
            "embeddings_ready": chunks_count > 0,
            "missing_investigations": missing_invs,
            "missing_variables": [],
            "reuse_recommendation": rec,
        }

        return {
            "coverage_status": classification,
            "existing_investigations": coverage_obj,
            "workflow_status": "DISCOVERING_PSI" if classification != "FULLY_AVAILABLE" or force_psi else "BUILDING_DATASET",
        }

    # ------------------------------------------------------------------
    # AGENT 04 — NASA PSI Discovery Agent
    # ------------------------------------------------------------------
    async def agent_04_psi_discovery(self, state: ResearchWorkflowState) -> dict[str, Any]:
        """Searches NASA Physical Sciences Informatics (PSI) catalog for relevant investigations."""
        intent = state.get("research_intent", {})
        query = state.get("user_query", "")
        campaigns = intent.get("target_investigations", [])
        domain = intent.get("research_domain")
        fuel_type = intent.get("fuel_type")
        variables = intent.get("variables_of_interest", [])

        candidates = PSIDiscoveryService.search_investigations(
            query=query,
            fuel_type=fuel_type,
            research_domain=domain,
            variables_of_interest=variables,
        )
        # Boost explicitly targeted campaigns to the top
        target_upper = {c.upper() for c in campaigns}
        for c in candidates:
            if c["acronym"].upper() in target_upper:
                c["relevance_score"] = min(100.0, round(c["relevance_score"] + 15.0, 1))
            if isinstance(c.get("last_verified_at"), datetime):
                c["last_verified_at"] = c["last_verified_at"].isoformat()

        candidates.sort(key=lambda x: x["relevance_score"], reverse=True)
        return {
            "psi_candidates": candidates[:8],
            "workflow_status": "SELECTING_FILES",
        }

    # ------------------------------------------------------------------
    # AGENT 05 — File Intelligence & Selection Agent
    # ------------------------------------------------------------------
    async def agent_05_file_selection(self, state: ResearchWorkflowState) -> dict[str, Any]:
        """Inspects PSI file manifests and ranks candidate files using F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A."""
        intent = state.get("research_intent", {})
        query = state.get("user_query", "")
        target_acronyms = intent.get("target_investigations", [])

        scored_manifest = PSIFileManifestService.score_and_select_files(
            user_question=query,
            research_intent=intent,
            target_acronyms=target_acronyms,
        )
        if not scored_manifest:
            scored_manifest = PSIFileManifestService.score_and_select_files(
                user_question=query,
                research_intent=intent,
                target_acronyms=None,
            )

        selected_files = [f for f in scored_manifest if f.get("selected")]
        excluded_files = [f for f in scored_manifest if not f.get("selected")]

        # Ensure at least top non-video seed file is selected if threshold was strict
        if not selected_files and scored_manifest:
            for f in scored_manifest:
                if f.get("file_category") != "Video":
                    f["selected"] = True
                    selected_files.append(f)
                    break

        require_approval = bool(state.get("require_approval", False))
        approval_status = state.get("approval_status", "NOT_REQUIRED")
        if require_approval and approval_status in ("PENDING", "NOT_REQUIRED"):
            next_status = "AWAITING_APPROVAL"
            approval_status = "PENDING"
        else:
            next_status = "ACQUIRING_FILES"

        return {
            "psi_file_candidates": scored_manifest,
            "selected_files": selected_files,
            "excluded_files": excluded_files,
            "approval_status": approval_status,
            "workflow_status": next_status,
        }

    # ------------------------------------------------------------------
    # AGENT 06 — Scientific Acquisition Agent
    # ------------------------------------------------------------------
    async def agent_06_file_acquisition(self, state: ResearchWorkflowState) -> dict[str, Any]:
        """Acquires approved scientific files with allowlist validation, SSRF protection, and SHA-256 deduplication.
        Priority 4 & Priority 7:
        - Enforces explicit Download Governance outcomes (DOWNLOAD_COMPLETED, PORTAL_HANDOFF_REQUIRED,
          USER_APPROVAL_REQUIRED, ACCESS_RESTRICTED, INVALID_SOURCE, DOWNLOAD_FAILED).
        - Idempotent across checkpoint restarts: never repeats already-completed downloads for the request.
        """
        selected_files = state.get("selected_files", [])
        request_id = state.get("request_id")
        user_approved = state.get("approval_status") == "APPROVED" or not state.get("require_approval", False)
        acquisition_jobs: list[dict[str, Any]] = []
        acquired_assets: list[dict[str, Any]] = []
        warnings = list(state.get("warnings", []))

        for f in selected_files:
            file_id = f["file_identifier"]
            acronym = f.get("investigation_acronym", "PSI")
            source_url = f.get("source_url", "https://psi.nasa.gov/physci/repo")

            # Priority 7: Check if this file_identifier was already downloaded for this request_id
            if request_id:
                existing_job_res = await self.db.execute(
                    select(AcquisitionJob).where(
                        AcquisitionJob.request_id == request_id,
                        AcquisitionJob.file_identifier == file_id,
                        AcquisitionJob.status.in_(["DOWNLOAD_COMPLETED", "DOWNLOADED"]),
                    )
                )
                existing_job = existing_job_res.scalars().first()
                if existing_job and existing_job.sha256_hash:
                    asset_res = await self.db.execute(
                        select(FileAsset).where(FileAsset.sha256_hash == existing_job.sha256_hash)
                    )
                    existing_asset = asset_res.scalars().first()
                    if existing_asset:
                        acquired_assets.append(
                            {
                                "asset_id": existing_asset.id,
                                "file_identifier": file_id,
                                "investigation_acronym": acronym,
                                "file_name": existing_asset.file_name,
                                "storage_uri": existing_asset.storage_uri,
                                "sha256_hash": existing_asset.sha256_hash,
                                "file_size_bytes": existing_asset.file_size_bytes,
                                "reused_from_checkpoint": True,
                            }
                        )
                        acquisition_jobs.append(
                            {
                                "id": existing_job.id,
                                "file_identifier": file_id,
                                "investigation_acronym": acronym,
                                "status": existing_job.status,
                                "bytes_downloaded": existing_job.bytes_downloaded,
                                "sha256_hash": existing_job.sha256_hash,
                                "storage_uri": existing_job.storage_uri,
                                "handoff_instructions": existing_job.handoff_instructions,
                                "status_explanation": "Reused completed download from durable checkpoint without re-downloading.",
                                "reused_from_checkpoint": True,
                            }
                        )
                        continue

            status, meta, content_bytes = await PSIDownloadStrategy.acquire_file(
                file_id,
                user_approved=user_approved,
            )
            is_downloaded = status in ("DOWNLOAD_COMPLETED", "DOWNLOADED")

            job_row = AcquisitionJob(
                request_id=request_id,
                file_identifier=file_id,
                investigation_acronym=acronym,
                source_url=source_url,
                status=status,
                http_status=meta.get("http_status", 200 if is_downloaded else None),
                content_type=meta.get("mime_type", f.get("mime_type", "application/json")),
                bytes_downloaded=meta.get("bytes_downloaded", 0),
                sha256_hash=meta.get("sha256_hash"),
                storage_uri=None,
                handoff_instructions=meta.get("handoff_instructions") or meta.get("status_explanation"),
                error_message=meta.get("error_message"),
                completed_at=datetime.now(timezone.utc) if is_downloaded else None,
            )

            if is_downloaded and content_bytes is not None:
                vault_meta = self.vault.store_raw_asset(
                    file_identifier=file_id,
                    filename=PSISourceValidator.sanitize_filename(f.get("file_name", f"{file_id}.json")),
                    content=content_bytes,
                )
                job_row.storage_uri = vault_meta["local_vault_path"]
                job_row.sha256_hash = vault_meta["checksum_sha256"]
                job_row.bytes_downloaded = vault_meta["file_size_bytes"]

                existing_asset_res = await self.db.execute(
                    select(FileAsset).where(FileAsset.sha256_hash == vault_meta["checksum_sha256"])
                )
                asset_row = existing_asset_res.scalars().first()
                if asset_row is None:
                    asset_row = FileAsset(
                        file_identifier=file_id,
                        investigation_acronym=acronym,
                        file_name=PSISourceValidator.sanitize_filename(f.get("file_name", f"{file_id}.json")),
                        storage_backend=vault_meta["storage_backend"],
                        storage_uri=vault_meta["local_vault_path"],
                        sha256_hash=vault_meta["checksum_sha256"],
                        file_size_bytes=vault_meta["file_size_bytes"],
                        mime_type=f.get("mime_type", "application/json"),
                        source_url=source_url,
                        file_version="1.0.0",
                        metadata_payload={
                            "psi_investigation_id": f.get("psi_investigation_id"),
                            "source_record_id": f.get("source_record_id"),
                            "internal_catalog_id": f.get("internal_catalog_id"),
                            "score_breakdown": f.get("score_breakdown"),
                        },
                    )
                    self.db.add(asset_row)
                    await self.db.flush()

                acquired_assets.append(
                    {
                        "asset_id": asset_row.id,
                        "file_identifier": file_id,
                        "investigation_acronym": acronym,
                        "file_name": asset_row.file_name,
                        "storage_uri": asset_row.storage_uri,
                        "sha256_hash": asset_row.sha256_hash,
                        "file_size_bytes": asset_row.file_size_bytes,
                        "reused_from_checkpoint": False,
                    }
                )
            elif status in ("PORTAL_HANDOFF_REQUIRED", "USER_HANDOFF_REQUIRED", "ACCESS_RESTRICTED", "USER_APPROVAL_REQUIRED"):
                warnings.append(
                    meta.get("handoff_instructions")
                    or meta.get("status_explanation")
                    or f"Governance status {status} for {file_id}."
                )

            self.db.add(job_row)
            await self.db.flush()
            acquisition_jobs.append(
                {
                    "id": job_row.id,
                    "file_identifier": file_id,
                    "investigation_acronym": acronym,
                    "status": status,
                    "bytes_downloaded": job_row.bytes_downloaded,
                    "sha256_hash": job_row.sha256_hash,
                    "storage_uri": job_row.storage_uri,
                    "handoff_instructions": job_row.handoff_instructions,
                    "status_explanation": meta.get("status_explanation") or job_row.handoff_instructions,
                    "reused_from_checkpoint": False,
                }
            )

        await self.db.commit()
        return {
            "acquisition_jobs": acquisition_jobs,
            "acquired_assets": acquired_assets,
            "warnings": warnings,
            "workflow_status": "EXTRACTING_DATA",
        }

    # ------------------------------------------------------------------
    # AGENT 07 — Scientific Extraction Agent
    # ------------------------------------------------------------------
    async def agent_07_scientific_extraction(self, state: ResearchWorkflowState) -> dict[str, Any]:
        """Extracts experimental runs, measurements, and metadata from verified DB records and acquired files.
        Priority 7: If extracted_records already exist in restored checkpoint state, does not repeat extraction.
        """
        existing_extracted = state.get("extracted_records")
        if existing_extracted and len(existing_extracted) > 0:
            return {
                "extracted_records": existing_extracted,
                "workflow_status": "MAPPING_SCHEMA",
            }

        intent = state.get("research_intent", {})
        target_campaigns = intent.get("target_investigations", [])
        acquired_assets = state.get("acquired_assets", [])

        extracted = await self.dataset_engine.extract_from_database_and_assets(
            db=self.db,
            target_campaigns=target_campaigns,
            acquired_assets=acquired_assets,
        )
        return {
            "extracted_records": extracted,
            "workflow_status": "MAPPING_SCHEMA",
        }

    # ------------------------------------------------------------------
    # AGENT 08 — Scientific Schema Mapping Agent
    # ------------------------------------------------------------------
    async def agent_08_schema_mapping(self, state: ResearchWorkflowState) -> dict[str, Any]:
        """Maps heterogeneous extracted records into the FlameSafe canonical schema with SI unit normalization."""
        extracted = state.get("extracted_records", [])
        mapped = self.dataset_engine.map_to_canonical_schema(extracted)
        return {
            "mapped_records": mapped,
            "workflow_status": "VALIDATING_DATA",
        }

    # ------------------------------------------------------------------
    # AGENT 09 — Scientific Validation & Quality Agent
    # ------------------------------------------------------------------
    async def agent_09_scientific_validation(self, state: ResearchWorkflowState) -> dict[str, Any]:
        """Executes deterministic physical, unit, completeness, and provenance checks."""
        mapped = state.get("mapped_records", [])
        validated, report = self.dataset_engine.validate_canonical_records(mapped)
        return {
            "validated_records": validated,
            "validation_report": report,
            "workflow_status": "BUILDING_DATASET",
        }

    # ------------------------------------------------------------------
    # AGENT 10 — Dynamic Dataset Builder Agent
    # ------------------------------------------------------------------
    async def agent_10_dataset_builder(self, state: ResearchWorkflowState) -> dict[str, Any]:
        """Constructs or reuses a versioned, reproducible scientific dataset with CSV/JSON/Parquet exports."""
        intent = state.get("research_intent", {})
        validated = state.get("validated_records", [])
        report = state.get("validation_report", {})
        request_id = state.get("request_id")

        if not validated:
            extracted = await self.dataset_engine.extract_from_database_and_assets(
                db=self.db,
                target_campaigns=intent.get("target_investigations", []),
                acquired_assets=state.get("acquired_assets", []),
            )
            mapped = self.dataset_engine.map_to_canonical_schema(extracted)
            validated, report = self.dataset_engine.validate_canonical_records(mapped)

        campaigns = sorted(
            {str(r.get("investigation_acronym")) for r in validated if r.get("investigation_acronym")}
        )
        source_files = sorted(
            {str(r.get("source_file_name")) for r in validated if r.get("source_file_name")}
        )
        domain = intent.get("research_domain", "Solid Fuel Flammability & Suppression")
        sig_payload = json.dumps(
            {"domain": domain, "campaigns": campaigns},
            sort_keys=True,
        )
        short_hash = hashlib.sha256(sig_payload.encode("utf-8")).hexdigest()[:8].upper()
        dataset_key = f"FS-DS-{'-'.join(campaigns[:3]) if campaigns else 'PSI'}-{short_hash}"

        title = f"{domain} ({', '.join(campaigns) if campaigns else 'NASA-PSI'})"
        description = (
            f"Versioned microgravity combustion dataset generated for research intent '{intent.get('intent_type')}' "
            f"covering {', '.join(campaigns)} with deterministic unit and provenance validation."
        )

        ds_summary = await self.dataset_engine.build_or_reuse_dataset(
            db=self.db,
            title=title,
            description=description,
            query_signature=dataset_key,
            combustion_domain=domain,
            validated_records=validated,
            validation_report=report,
            source_investigations=campaigns,
            source_files=source_files,
            research_request_id=request_id,
            user_query=state.get("user_query"),
        )

        return {
            "validated_records": validated,
            "validation_report": report,
            "dataset_id": ds_summary["dataset_id"],
            "dataset_code": ds_summary["dataset_code"],
            "dataset_version_id": ds_summary["version_id"],
            "dataset_version_number": ds_summary["version_tag"],
            "dataset_summary": ds_summary,
            "workflow_status": "GENERATING_INSIGHTS",
        }

    # ------------------------------------------------------------------
    # AGENT 11 — Scientific Research Intelligence Agent
    # ------------------------------------------------------------------
    async def agent_11_research_intelligence(self, state: ResearchWorkflowState) -> dict[str, Any]:
        """Answers the research question using the validated dataset and RAG evidence chunks with strict citations."""
        query = state.get("user_query", "")
        intent = state.get("research_intent", {})
        ds_summary = state.get("dataset_summary", {})
        val_report = state.get("validation_report", {})
        validated = state.get("validated_records", [])

        ai_service = AIService(self.db)
        rag_resp = await ai_service.answer_query(
            AssistantQueryRequest(query=query, max_citations=5)
        )

        citations = [
            {
                "citation_id": c.citation_id,
                "document_title": c.document_title,
                "investigation_code": c.investigation_acronym,
                "psi_id": c.psi_id,
                "doi": c.doi,
                "source_url": c.source_url,
                "page_number": c.page_number,
                "section_name": c.section_name,
                "excerpt": c.excerpt,
                "verification_status": c.verification_status,
            }
            for c in rag_resp.citations
        ]

        active_records = [r for r in validated if r.get("validation_status") != "REJECTED"]
        param_groups: dict[str, list[float]] = {}
        param_units: dict[str, str] = {}
        for r in active_records:
            p_name = str(r.get("parameter_name", ""))
            val = r.get("normalized_value")
            if val is not None:
                param_groups.setdefault(p_name, []).append(float(val))
                param_units[p_name] = str(r.get("normalized_unit", ""))

        quantitative_findings: list[dict[str, Any]] = []
        for p_name, vals in param_groups.items():
            if not vals:
                continue
            quantitative_findings.append(
                {
                    "parameter_name": p_name,
                    "unit": param_units.get(p_name, ""),
                    "sample_count": len(vals),
                    "min_value": round(min(vals), 4),
                    "max_value": round(max(vals), 4),
                    "mean_value": round(sum(vals) / len(vals), 4),
                    "evidence_classification": "VERIFIED_EXPERIMENTAL_DATA",
                }
            )

        research_gaps = [
            "Partial-gravity interpolation gap (0.166g Lunar and 0.38g Martian regimes) between ~0g ISS microgravity and 1.0g terrestrial baselines.",
            "Limited thick-material radiant extinction threshold replicates at elevated oxygen (>30% O2) and reduced cabin pressure (<60 kPa).",
        ]

        final_response = {
            "answer": rag_resp.answer,
            "scientific_uncertainty_note": rag_resp.scientific_uncertainty_note,
            "has_sufficient_evidence": rag_resp.has_sufficient_evidence,
            "ai_provider": rag_resp.ai_provider,
            "model_name": rag_resp.model_name,
            "is_mock_provider": rag_resp.is_mock_provider,
            "execution_mode": rag_resp.execution_mode,
            "token_usage": rag_resp.token_usage or {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            "ai_error": rag_resp.ai_error,
            "dataset_id": ds_summary.get("dataset_id"),
            "dataset_code": ds_summary.get("dataset_code"),
            "dataset_version": ds_summary.get("version_tag"),
            "dataset_record_count": ds_summary.get("record_count", len(active_records)),
            "dataset_quality_score": val_report.get("overall_quality_score", 0.0),
            "reused_existing_dataset": ds_summary.get("reused_existing", False),
            "quantitative_findings": quantitative_findings,
            "evidence_citations": citations,
            "research_gaps": research_gaps,
            "gravity_regime": intent.get("gravity_regime", "Microgravity (~0g)"),
        }

        return {
            "evidence_citations": citations,
            "final_response": final_response,
            "workflow_status": "READY",
        }
