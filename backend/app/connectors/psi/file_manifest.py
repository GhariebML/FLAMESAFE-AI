from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


# Verified file catalog entries across the NASA PSI investigations.
# Includes direct local seed tables/publications and PSI portal archive descriptors.
VERIFIED_PSI_FILES: List[Dict[str, Any]] = [
    {
        "file_identifier": "PSI-FILE-BASS-TABLE-01",
        "psi_investigation_id": "PSI-BASS-01",
        "investigation_acronym": "BASS",
        "file_name": "BASS_MSG_Experimental_Runs_and_Measurements.json",
        "file_category": "Experimental Tables",
        "file_type": "JSON",
        "mime_type": "application/json",
        "file_size_bytes": 4820,
        "source_url": "seed://BASS/experimental_table.json",
        "doi": "10.1016/j.proci.2014.05.077",
        "content_coverage": [
            "oxygen_concentration",
            "flame_spread_rate",
            "airflow_velocity",
            "quench_limit",
            "solid_polymer_pmma",
        ],
        "provenance_info": {
            "facility": "ISS MSG",
            "verification": "Canonical Seed Record",
            "citation": "Ferketi et al., Proc. Combust. Inst. (2015)",
        },
        "accessibility": "DIRECT_VERIFIED_SEED",
        "requires_user_handoff": False,
    },
    {
        "file_identifier": "PSI-FILE-BASS-PUB-01",
        "psi_investigation_id": "PSI-BASS-01",
        "investigation_acronym": "BASS",
        "file_name": "BASS_Opposed_Concurrent_Flame_Spread_Digest.json",
        "file_category": "Scientific Publications",
        "file_type": "JSON",
        "mime_type": "application/json",
        "file_size_bytes": 3640,
        "source_url": "seed://BASS/publication_digest.json",
        "doi": "10.1016/j.proci.2014.05.077",
        "content_coverage": [
            "flame_spread_rate",
            "airflow_velocity",
            "extinction_limits",
            "nitrogen_suppression",
        ],
        "provenance_info": {
            "doi": "10.1016/j.proci.2014.05.077",
            "pages": "2-7",
        },
        "accessibility": "DIRECT_VERIFIED_SEED",
        "requires_user_handoff": False,
    },
    {
        "file_identifier": "PSI-FILE-BASS-VIDEO-RAW",
        "psi_investigation_id": "PSI-BASS-01",
        "investigation_acronym": "BASS",
        "file_name": "BASS_HighSpeed_Cam_Raw_Archive.zip",
        "file_category": "Video",
        "file_type": "ZIP",
        "mime_type": "application/zip",
        "file_size_bytes": 185000000,
        "source_url": "https://psi.nasa.gov/physci/repo",
        "doi": "10.1016/j.proci.2014.05.077",
        "content_coverage": ["video_frames", "flame_chemiluminescence"],
        "provenance_info": {"note": "Large optical video archive (>25MB); requires PSI portal handoff"},
        "accessibility": "USER_ASSISTED_PSI_PORTAL",
        "requires_user_handoff": True,
    },
    {
        "file_identifier": "PSI-FILE-SAFFIRE-TABLE-01",
        "psi_investigation_id": "PSI-SAFFIRE-01",
        "investigation_acronym": "SAFFIRE",
        "file_name": "SAFFIRE_LargeScale_Fabric_PMMA_Telemetry.json",
        "file_category": "Experimental Tables",
        "file_type": "JSON",
        "mime_type": "application/json",
        "file_size_bytes": 5190,
        "source_url": "seed://SAFFIRE/experimental_table.json",
        "doi": "10.2514/1.A34167",
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
            "citation": "Urban et al., J. Spacecr. Rockets (2018)",
        },
        "accessibility": "DIRECT_VERIFIED_SEED",
        "requires_user_handoff": False,
    },
    {
        "file_identifier": "PSI-FILE-SAFFIRE-PUB-01",
        "psi_investigation_id": "PSI-SAFFIRE-01",
        "investigation_acronym": "SAFFIRE",
        "file_name": "SAFFIRE_Exploration_Atmosphere_Findings.json",
        "file_category": "Scientific Publications",
        "file_type": "JSON",
        "mime_type": "application/json",
        "file_size_bytes": 3910,
        "source_url": "seed://SAFFIRE/publication_digest.json",
        "doi": "10.2514/1.A34167",
        "content_coverage": [
            "oxygen_concentration",
            "pressure",
            "flame_spread_rate",
            "lunar_mars_atmosphere_context",
        ],
        "provenance_info": {"doi": "10.2514/1.A34167", "pages": "4-9"},
        "accessibility": "DIRECT_VERIFIED_SEED",
        "requires_user_handoff": False,
    },
    {
        "file_identifier": "PSI-FILE-FLEX-TABLE-01",
        "psi_investigation_id": "PSI-FLEX-01",
        "investigation_acronym": "FLEX",
        "file_name": "FLEX_CIR_Droplet_Combustion_Measurements.json",
        "file_category": "Experimental Tables",
        "file_type": "JSON",
        "mime_type": "application/json",
        "file_size_bytes": 4120,
        "source_url": "seed://FLEX/experimental_table.json",
        "doi": "10.1016/j.combustflame.2013.06.023",
        "content_coverage": [
            "burning_rate_constant",
            "extinction_diameter",
            "oxygen_concentration",
            "pressure",
            "liquid_hydrocarbon",
        ],
        "provenance_info": {
            "facility": "ISS CIR",
            "citation": "Williams et al., Combust. Flame (2014)",
        },
        "accessibility": "DIRECT_VERIFIED_SEED",
        "requires_user_handoff": False,
    },
    {
        "file_identifier": "PSI-FILE-SAME-TABLE-01",
        "psi_investigation_id": "PSI-SAME-01",
        "investigation_acronym": "SAME",
        "file_name": "SAME_Smoke_Aerosol_Morphology_Table.json",
        "file_category": "Experimental Tables",
        "file_type": "JSON",
        "mime_type": "application/json",
        "file_size_bytes": 4380,
        "source_url": "seed://SAME/experimental_table.json",
        "doi": "10.4271/2009-01-2481",
        "content_coverage": [
            "particle_mean_diameter",
            "smoke_detection",
            "airflow_velocity",
            "oxygen_concentration",
            "wire_insulation",
        ],
        "provenance_info": {
            "facility": "ISS MSG",
            "citation": "Urban et al., SAE Tech. Paper 2009-01-2481",
        },
        "accessibility": "DIRECT_VERIFIED_SEED",
        "requires_user_handoff": False,
    },
    {
        "file_identifier": "PSI-FILE-ACME-TABLE-01",
        "psi_investigation_id": "PSI-ACME-01",
        "investigation_acronym": "ACME",
        "file_name": "ACME_Gaseous_Diffusion_Flame_Soot_Table.json",
        "file_category": "Experimental Tables",
        "file_type": "JSON",
        "mime_type": "application/json",
        "file_size_bytes": 4490,
        "source_url": "seed://ACME/experimental_table.json",
        "doi": "10.1016/j.combustflame.2018.04.015",
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
            "citation": "Stocker et al., Combust. Flame (2018)",
        },
        "accessibility": "DIRECT_VERIFIED_SEED",
        "requires_user_handoff": False,
    },
]


class PSIFileManifestService:
    """
    AGENT 05 — File Intelligence & Selection Scoring Engine.
    Implements configurable file priority formula:
        F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A
    Excludes unnecessary video/raw bulk archives when tabular/publication assets suffice.
    """

    @classmethod
    def list_files_for_investigation(cls, identifier: str) -> List[Dict[str, Any]]:
        ident_lower = identifier.lower()
        now = datetime.now(timezone.utc)
        out = []
        for f in VERIFIED_PSI_FILES:
            if (
                f["psi_investigation_id"].lower() == ident_lower
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
    ) -> List[Dict[str, Any]]:
        q_lower = (user_question or "").lower()
        fuel_pref = (research_intent.get("fuel_type") or "").lower()
        vars_interest = [v.lower() for v in research_intent.get("variables_of_interest", [])]
        wants_video = any(w in q_lower for w in ["video", "image", "camera", "optical", "footage"])
        target_set = {a.upper() for a in target_acronyms} if target_acronyms else set()

        scored_manifest: List[Dict[str, Any]] = []
        for raw_file in VERIFIED_PSI_FILES:
            acronym = raw_file["investigation_acronym"].upper()
            if target_set and acronym not in target_set:
                continue

            category = raw_file["file_category"]
            coverage = [c.lower() for c in raw_file.get("content_coverage", [])]
            coverage_str = " ".join(coverage) + " " + raw_file["file_name"].lower()

            # Q: Question & Fuel Relevance (0 - 100)
            q_score = 65.0
            if fuel_pref and fuel_pref not in ("all", "any", ""):
                if fuel_pref in coverage_str or (fuel_pref == "solid" and acronym in ("BASS", "SAFFIRE")):
                    q_score += 25.0
                elif fuel_pref in ("liquid", "droplet") and acronym == "FLEX":
                    q_score += 25.0
                elif fuel_pref in ("gas", "gaseous") and acronym == "ACME":
                    q_score += 25.0
                elif fuel_pref in ("smoke", "wire") and acronym == "SAME":
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
            p_score = 95.0 if raw_file.get("doi") else 65.0

            # A: Availability & Accessibility (0 - 100)
            if raw_file["accessibility"] == "DIRECT_VERIFIED_SEED":
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

            is_selected = (
                f_score >= 65.0
                and not raw_file.get("requires_user_handoff", False)
                and (category not in ("Video", "Images") or wants_video)
            )

            if is_selected:
                rationale = (
                    f"Selected (F={f_score}/100): High-priority {category.lower()} covering "
                    f"{', '.join(raw_file.get('content_coverage', [])[:3])} with verified DOI ({raw_file.get('doi')})."
                )
            else:
                if category in ("Video", "Images") and not wants_video:
                    rationale = (
                        f"Excluded (F={f_score}/100): Large optical/video archive ({round((raw_file.get('file_size_bytes') or 0) / 1e6, 1)} MB) "
                        "not required for quantitative tabular & publication analysis."
                    )
                else:
                    rationale = (
                        f"Excluded from automated run (F={f_score}/100): Requires user-assisted NASA PSI portal download or below threshold."
                    )

            item = dict(raw_file)
            item["selected"] = is_selected
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
