from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.core.config import settings


# Verified file catalog entries across the NASA PSI investigations.
# Separates:
# - DIRECT_DOWNLOAD_AVAILABLE (verified local seed tables/digests & public NTRS metadata)
# - PORTAL_HANDOFF_REQUIRED (interactive NASA PSI portal archives or files exceeding FlameSafe's
#   configurable FLAMESAFE_AUTO_ACQUISITION_MAX_BYTES safety policy).
# - ACCESS_RESTRICTED (restricted/embargoed raw telemetry).
VERIFIED_PSI_FILES: List[Dict[str, Any]] = [
    {
        "file_identifier": "PSI-FILE-BASS-TABLE-01",
        "internal_catalog_id": "FS-CAT-BASS-I-MSG",
        "source_record_id": "PSI-25",
        "psi_investigation_id": "PSI-25",
        "investigation_acronym": "BASS",
        "file_name": "BASS_MSG_Experimental_Runs_and_Measurements.json",
        "file_category": "Experimental Tables",
        "file_type": "JSON",
        "mime_type": "application/json",
        "file_size_bytes": 4820,
        "source_url": "seed://BASS/experimental_table.json",
        "dataset_doi": None,
        "publication_dois": ["10.2514/6.2012-3492", "10.1007/s12217-024-10106-y"],
        "doi": "10.2514/6.2012-3492",
        "content_coverage": [
            "oxygen_concentration",
            "flame_spread_rate",
            "airflow_velocity",
            "quench_limit",
            "solid_polymer_pmma",
        ],
        "provenance_info": {
            "facility": "ISS MSG",
            "source_repository": "NASA_PSI",
            "source_record_id": "PSI-25 (BASS-II companion) / Local BASS-I Seed",
            "citation": "Olson, Ferkul et al., AIAA 2012-3492 / Microgravity Sci. Technol. (2024)",
        },
        "accessibility": "DIRECT_DOWNLOAD_AVAILABLE",
        "acquisition_outcome": "DIRECT_DOWNLOAD_AVAILABLE",
        "requires_user_handoff": False,
    },
    {
        "file_identifier": "PSI-FILE-BASS-PUB-01",
        "internal_catalog_id": "FS-CAT-BASS-I-MSG",
        "source_record_id": "PSI-25",
        "psi_investigation_id": "PSI-25",
        "investigation_acronym": "BASS",
        "file_name": "BASS_Opposed_Concurrent_Flame_Spread_Digest.json",
        "file_category": "Scientific Publications",
        "file_type": "JSON",
        "mime_type": "application/json",
        "file_size_bytes": 3640,
        "source_url": "seed://BASS/publication_digest.json",
        "dataset_doi": None,
        "publication_dois": ["10.1007/s12217-024-10106-y", "10.2514/6.2012-3492"],
        "doi": "10.1007/s12217-024-10106-y",
        "content_coverage": [
            "flame_spread_rate",
            "airflow_velocity",
            "extinction_limits",
            "nitrogen_suppression",
        ],
        "provenance_info": {
            "publication_doi": "10.1007/s12217-024-10106-y",
            "pages": "2-7",
        },
        "accessibility": "DIRECT_DOWNLOAD_AVAILABLE",
        "acquisition_outcome": "DIRECT_DOWNLOAD_AVAILABLE",
        "requires_user_handoff": False,
    },
    {
        "file_identifier": "PSI-FILE-BASS-VIDEO-RAW",
        "internal_catalog_id": "FS-CAT-BASS-II-025",
        "source_record_id": "PSI-25",
        "psi_investigation_id": "PSI-25",
        "investigation_acronym": "BASS",
        "file_name": "BASS_HighSpeed_Cam_Raw_Archive.zip",
        "file_category": "Video",
        "file_type": "ZIP",
        "mime_type": "application/zip",
        "file_size_bytes": 185000000,
        "source_url": "https://psi.nasa.gov/physci/repo",
        "dataset_doi": None,
        "publication_dois": ["10.1007/s12217-024-10106-y"],
        "doi": "10.1007/s12217-024-10106-y",
        "content_coverage": ["video_frames", "flame_chemiluminescence"],
        "provenance_info": {
            "source_record_id": "PSI-25",
            "note": (
                "Optical video archive (185 MB) exceeds FlameSafe's configurable 25 MB automatic acquisition "
                "safety policy (FLAMESAFE_AUTO_ACQUISITION_MAX_BYTES) and requires interactive NASA PSI portal handoff. "
                "Note: NASA PSI's own bulk email-prepared download workflow applies above 1 GB."
            ),
        },
        "accessibility": "PORTAL_HANDOFF_REQUIRED",
        "acquisition_outcome": "PORTAL_HANDOFF_REQUIRED",
        "requires_user_handoff": True,
    },
    {
        "file_identifier": "PSI-FILE-SAFFIRE-TABLE-01",
        "internal_catalog_id": "FS-CAT-SAFFIRE-I-098",
        "source_record_id": "PSI-98",
        "psi_investigation_id": "PSI-98",
        "investigation_acronym": "SAFFIRE",
        "file_name": "SAFFIRE_LargeScale_Fabric_PMMA_Telemetry.json",
        "file_category": "Experimental Tables",
        "file_type": "JSON",
        "mime_type": "application/json",
        "file_size_bytes": 5190,
        "source_url": "seed://SAFFIRE/experimental_table.json",
        "dataset_doi": None,
        "publication_dois": ["10.32865/2346/108820", "10.1007/s10694-019-00941-6"],
        "doi": "10.32865/2346/108820",
        "content_coverage": [
            "oxygen_concentration",
            "pressure",
            "flame_spread_rate",
            "airflow_velocity",
            "solid_fabric_blend",
            "spacecraft_fire_safety",
        ],
        "provenance_info": {
            "facility": "Cygnus Orbital Vehicle",
            "source_record_id": "PSI-98",
            "citation": "Urban, Ruff, Ferkul et al., Fire Technology / ICES (2019-2024)",
        },
        "accessibility": "DIRECT_DOWNLOAD_AVAILABLE",
        "acquisition_outcome": "DIRECT_DOWNLOAD_AVAILABLE",
        "requires_user_handoff": False,
    },
    {
        "file_identifier": "PSI-FILE-SAFFIRE-PUB-01",
        "internal_catalog_id": "FS-CAT-SAFFIRE-I-098",
        "source_record_id": "PSI-98",
        "psi_investigation_id": "PSI-98",
        "investigation_acronym": "SAFFIRE",
        "file_name": "SAFFIRE_Vehicle_Scale_Fire_Growth_Publication_Digest.json",
        "file_category": "Scientific Publications",
        "file_type": "JSON",
        "mime_type": "application/json",
        "file_size_bytes": 4120,
        "source_url": "seed://SAFFIRE/publication_digest.json",
        "dataset_doi": None,
        "publication_dois": ["10.32865/2346/108820", "10.1007/s10694-019-00941-6"],
        "doi": "10.32865/2346/108820",
        "content_coverage": [
            "flame_spread_rate",
            "cabin_pressure_rise",
            "post_fire_co_particulate",
        ],
        "provenance_info": {
            "source_record_id": "PSI-98",
            "publication_doi": "10.32865/2346/108820",
            "pages": "4-7",
        },
        "accessibility": "DIRECT_DOWNLOAD_AVAILABLE",
        "acquisition_outcome": "DIRECT_DOWNLOAD_AVAILABLE",
        "requires_user_handoff": False,
    },
    {
        "file_identifier": "PSI-FILE-FLEX-TABLE-01",
        "internal_catalog_id": "FS-CAT-FLEX-069",
        "source_record_id": "PSI-69",
        "psi_investigation_id": "PSI-69",
        "investigation_acronym": "FLEX",
        "file_name": "FLEX_Droplet_BurningRate_CoolFlame_Table.json",
        "file_category": "Experimental Tables",
        "file_type": "JSON",
        "mime_type": "application/json",
        "file_size_bytes": 4380,
        "source_url": "seed://FLEX/experimental_table.json",
        "dataset_doi": None,
        "publication_dois": ["10.1016/j.combustflame.2015.01.012", "10.1016/j.combustflame.2009.09.012"],
        "doi": "10.1016/j.combustflame.2015.01.012",
        "content_coverage": [
            "burning_rate_constant",
            "droplet_burning_rate_constant",
            "extinction_diameter",
            "cool_flame_transition",
            "liquid_hydrocarbon_heptane_methanol",
        ],
        "provenance_info": {
            "facility": "ISS CIR MDCA",
            "source_record_id": "PSI-69",
            "citation": "Nayagam, Dietrich, Williams et al., Combust. Flame (2015)",
        },
        "accessibility": "DIRECT_DOWNLOAD_AVAILABLE",
        "acquisition_outcome": "DIRECT_DOWNLOAD_AVAILABLE",
        "requires_user_handoff": False,
    },
    {
        "file_identifier": "PSI-FILE-SAME-TABLE-01",
        "internal_catalog_id": "FS-CAT-SAME-102",
        "source_record_id": "PSI-102",
        "psi_investigation_id": "PSI-102",
        "investigation_acronym": "SAME",
        "file_name": "SAME_Smoke_Aerosol_Particle_Morphology_Table.json",
        "file_category": "Experimental Tables",
        "file_type": "JSON",
        "mime_type": "application/json",
        "file_size_bytes": 3950,
        "source_url": "seed://SAME/experimental_table.json",
        "dataset_doi": None,
        "publication_dois": ["10.2514/6.2013-3433", "10.2514/6.2012-3536"],
        "doi": "10.2514/6.2013-3433",
        "content_coverage": [
            "mass_median_diameter",
            "particle_size_distribution",
            "smoke_detection",
            "wire_insulation_kapton_teflon",
        ],
        "provenance_info": {
            "facility": "ISS MSG",
            "source_record_id": "PSI-102",
            "citation": "Urban, Meyer, Mulholland et al., AIAA 2013-3433",
        },
        "accessibility": "DIRECT_DOWNLOAD_AVAILABLE",
        "acquisition_outcome": "DIRECT_DOWNLOAD_AVAILABLE",
        "requires_user_handoff": False,
    },
    {
        "file_identifier": "PSI-FILE-ACME-TABLE-01",
        "internal_catalog_id": "FS-CAT-ACME-CFIG-159",
        "source_record_id": "PSI-159",
        "psi_investigation_id": "PSI-159",
        "investigation_acronym": "ACME",
        "file_name": "ACME_Gaseous_Coflow_Flame_Stability_Table.json",
        "file_category": "Experimental Tables",
        "file_type": "JSON",
        "mime_type": "application/json",
        "file_size_bytes": 4110,
        "source_url": "seed://ACME/experimental_table.json",
        "dataset_doi": None,
        "publication_dois": ["10.1016/j.combustflame.2016.02.012", "10.1016/j.proci.2014.05.064"],
        "doi": "10.1016/j.combustflame.2016.02.012",
        "content_coverage": [
            "flame_height",
            "soot_volume_fraction",
            "oxygen_concentration",
            "pressure",
            "airflow_velocity",
            "gaseous_hydrocarbon",
        ],
        "provenance_info": {
            "facility": "ISS CIR",
            "source_record_id": "PSI-159",
            "citation": "Stocker, Sunderland, Urban et al., Combust. Flame (2016)",
        },
        "accessibility": "DIRECT_DOWNLOAD_AVAILABLE",
        "acquisition_outcome": "DIRECT_DOWNLOAD_AVAILABLE",
        "requires_user_handoff": False,
    },
]


class PSIFileManifestService:
    """
    AGENT 05 — File Intelligence & Selection Scoring Engine.
    Implements configurable file priority formula:
        F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A
    Excludes unnecessary video/raw bulk archives when tabular/publication assets suffice,
    and attaches explicit Download Governance states (Priority 4).
    """

    @classmethod
    def list_files_for_investigation(cls, identifier: str) -> List[Dict[str, Any]]:
        ident_lower = (identifier or "").strip().lower()
        now = datetime.now(timezone.utc)
        out = []
        for f in VERIFIED_PSI_FILES:
            if (
                not ident_lower
                or f["psi_investigation_id"].lower() == ident_lower
                or f["internal_catalog_id"].lower() == ident_lower
                or (f.get("source_record_id") and f["source_record_id"].lower() == ident_lower)
                or f["investigation_acronym"].lower() == ident_lower
            ):
                item = dict(f)
                item["last_verified_at"] = now
                out.append(item)
        return out

    @classmethod
    def get_file_by_id(cls, file_id: str) -> Optional[Dict[str, Any]]:
        fid_lower = file_id.lower()
        now = datetime.now(timezone.utc)
        for f in VERIFIED_PSI_FILES:
            if f["file_identifier"].lower() == fid_lower:
                item = dict(f)
                item["last_verified_at"] = now
                return item
        return None

    @classmethod
    def score_and_select_files(
        cls,
        user_question: str,
        research_intent: Dict[str, Any],
        target_acronyms: Optional[List[str]] = None,
        require_approval: bool = False,
    ) -> List[Dict[str, Any]]:
        q_lower = (user_question or "").lower()
        fuel_pref = (research_intent.get("fuel_type") or "").lower()
        vars_interest = [v.lower() for v in research_intent.get("variables_of_interest", [])]
        wants_video = any(w in q_lower for w in ["video", "image", "camera", "optical", "footage"])

        # Normalize target acronyms/IDs so PSI-25 -> BASS, PSI-69 -> FLEX, PSI-98 -> SAFFIRE, PSI-102 -> SAME, PSI-159 -> ACME
        alias_map = {
            "PSI-25": "BASS",
            "BASS-II": "BASS",
            "PSI-98": "SAFFIRE",
            "SAFFIRE-I": "SAFFIRE",
            "PSI-69": "FLEX",
            "PSI-102": "SAME",
            "PSI-101": "SAME",
            "SAME-R": "SAME",
            "PSI-159": "ACME",
            "CFI-G": "ACME",
        }
        target_set = set()
        for a in target_acronyms or []:
            au = a.upper()
            target_set.add(au)
            if au in alias_map:
                target_set.add(alias_map[au])

        scored_manifest: List[Dict[str, Any]] = []
        for raw_file in VERIFIED_PSI_FILES:
            acronym = raw_file["investigation_acronym"].upper()
            src_id = (raw_file.get("source_record_id") or "").upper()
            if target_set and acronym not in target_set and src_id not in target_set:
                continue

            category = raw_file["file_category"]
            coverage = [c.lower() for c in raw_file.get("content_coverage", [])]
            coverage_str = " ".join(coverage) + " " + raw_file["file_name"].lower()

            # Q: Question & Fuel Relevance (0 - 100)
            q_score = 65.0
            if fuel_pref and fuel_pref not in ("all", "any", ""):
                if fuel_pref in coverage_str or ("solid" in fuel_pref and acronym in ("BASS", "SAFFIRE")):
                    q_score += 25.0
                elif any(k in fuel_pref for k in ("liquid", "droplet", "heptane")) and acronym == "FLEX":
                    q_score += 25.0
                elif any(k in fuel_pref for k in ("gas", "gaseous", "methane")) and acronym == "ACME":
                    q_score += 25.0
                elif any(k in fuel_pref for k in ("smoke", "wire", "kapton")) and acronym == "SAME":
                    q_score += 25.0
                else:
                    q_score -= 10.0

            for tok in q_lower.split():
                if len(tok) > 3 and tok in coverage_str:
                    q_score += 5.0
            q_score = max(10.0, min(100.0, q_score))

            # T: File Type Relevance (0 - 100)
            if category in ("Experimental Tables", "Analyzed Data"):
                t_score = 96.0
            elif category == "Scientific Publications":
                t_score = 90.0
            elif category in ("Metadata", "Engineering Documents", "Hardware Documentation"):
                t_score = 72.0
            elif category in ("Video", "Images"):
                t_score = 88.0 if wants_video else 18.0
            else:
                t_score = 50.0

            # C: Scientific Content Coverage (0 - 100)
            matched_vars = sum(
                1 for v in vars_interest if any(part in coverage_str for part in v.split("_"))
            )
            c_score = min(100.0, 55.0 + matched_vars * 15.0)
            if category == "Video" and not wants_video:
                c_score = 25.0

            # P: Provenance Quality (0 - 100)
            p_score = 95.0 if raw_file.get("publication_dois") or raw_file.get("dataset_doi") else 65.0

            # A: Availability & Accessibility (0 - 100)
            if raw_file["accessibility"] in ("DIRECT_DOWNLOAD_AVAILABLE", "DIRECT_VERIFIED_SEED"):
                a_score = 100.0
            elif raw_file["accessibility"] == "DIRECT_PUBLIC_URL":
                a_score = 85.0
            else:
                a_score = 40.0

            # Weighted Priority Score: F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A
            f_score = round(
                0.35 * q_score + 0.25 * t_score + 0.20 * c_score + 0.10 * p_score + 0.10 * a_score,
                2,
            )

            size_bytes = int(raw_file.get("file_size_bytes") or 0)
            exceeds_app_cap = size_bytes > settings.FLAMESAFE_AUTO_ACQUISITION_MAX_BYTES

            is_selected = (
                f_score >= 65.0
                and not raw_file.get("requires_user_handoff", False)
                and not exceeds_app_cap
                and (category not in ("Video", "Images") or wants_video)
            )

            # Determine explicit Download Governance state (Priority 4)
            if raw_file.get("requires_user_handoff") or exceeds_app_cap:
                acq_outcome = "PORTAL_HANDOFF_REQUIRED"
                status_explanation = (
                    f"Requires manual NASA PSI portal handoff: file size ({round(size_bytes / 1e6, 1)} MB) "
                    f"exceeds FlameSafe's configurable {round(settings.FLAMESAFE_AUTO_ACQUISITION_MAX_BYTES / (1024 * 1024))} MB "
                    "automatic acquisition safety policy (note: NASA PSI's own email-prepared bulk download threshold is 1 GB)."
                )
            elif require_approval and is_selected:
                acq_outcome = "USER_APPROVAL_REQUIRED"
                status_explanation = "Selected by Agent 05; awaiting researcher approval before acquisition."
            else:
                acq_outcome = "DIRECT_DOWNLOAD_AVAILABLE"
                status_explanation = "Verified scientific table/digest within FlameSafe safety bounds; ready for direct acquisition."

            if is_selected:
                rationale = (
                    f"Selected (F={f_score}/100, {acq_outcome}): High-priority {category.lower()} covering "
                    f"{', '.join(raw_file.get('content_coverage', [])[:3])} with publication DOI ({raw_file.get('doi')})."
                )
            else:
                if category in ("Video", "Images") and not wants_video:
                    rationale = (
                        f"Excluded (F={f_score}/100, {acq_outcome}): Optical/video archive ({round(size_bytes / 1e6, 1)} MB) "
                        "not required for quantitative tabular analysis and exceeds FlameSafe's configurable 25 MB safety policy."
                    )
                else:
                    rationale = (
                        f"Excluded from automated run (F={f_score}/100, {acq_outcome}): {status_explanation}"
                    )

            item = dict(raw_file)
            item["selected"] = is_selected
            item["acquisition_outcome"] = acq_outcome
            item["status_explanation"] = status_explanation
            item["score_breakdown"] = {
                "question_relevance_q": round(q_score, 1),
                "file_type_relevance_t": round(t_score, 1),
                "content_coverage_c": round(c_score, 1),
                "provenance_quality_p": round(p_score, 1),
                "accessibility_a": round(a_score, 1),
                "priority_score_f": f_score,
            }
            item["selection_rationale"] = rationale
            scored_manifest.append(item)

        scored_manifest.sort(key=lambda x: x["score_breakdown"]["priority_score_f"], reverse=True)
        return scored_manifest
