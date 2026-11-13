from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.connectors.psi.source_validator import PSISourceValidator


# Audited NASA PSI & Microgravity Combustion Investigation Catalog (Priority 1 & Priority 3).
# Strict Identifier Separation:
# - internal_catalog_id: FlameSafe internal catalog primary key (never conflated with NASA PSI IDs).
# - source_repository: "NASA_PSI" (or "NASA_PSI / NTRS").
# - source_record_id: Official verified NASA PSI record ID (PSI-25, PSI-69, PSI-98, PSI-101, PSI-102, PSI-159)
#   or None when an entry represents an umbrella campaign or an unverified external PSI record ID.
# - local_aliases: Legacy local aliases (e.g., PSI-BASS-01, PSI-SAFFIRE-01) preserved separately for backward compatibility.
# - dataset_doi: Distinct NASA PSI Dataset DOI (None unless independently verified as a dataset DOI).
# - publication_dois: Associated peer-reviewed journal/conference paper DOIs (never conflated with dataset_doi).
# - record_origin: "LOCAL_SEED_RECORD" | "METADATA_VERIFIED_RECORD" | "LIVE_DISCOVERED_RECORD".
# - verification_status: "VERIFIED_OFFICIAL_PSI_ID" | "UNVERIFIED_OFFICIAL_PSI_ID".
VERIFIED_PSI_CATALOG: List[Dict[str, Any]] = [
    {
        "investigation_id": "psi-cat-bass-ii-025",
        "internal_catalog_id": "FS-CAT-BASS-II-025",
        "source_repository": "NASA_PSI",
        "source_record_id": "PSI-25",
        "psi_id": "PSI-25",
        "local_aliases": ["BASS-II", "PSI-25", "PSI-BASS-II-01"],
        "acronym": "BASS-II",
        "title": "Burning and Suppression of Solids - II",
        "research_area": "Solid Fuel Flammability & Suppression",
        "description": (
            "Official NASA PSI investigation PSI-25 examining concurrent and opposed-flow solid polymer (PMMA) "
            "and cotton-fiberglass fabric flame spread, radiative heat loss, and extinction limits in the ISS MSG."
        ),
        "facility": "ISS Microgravity Science Glovebox (MSG)",
        "gravity_regime": "Microgravity (~0g)",
        "fuel_types": ["Solid Polymer", "PMMA", "Cotton-Fiberglass"],
        "dataset_doi": None,
        "publication_dois": ["10.1007/s12217-024-10106-y", "10.1016/j.combustflame.2017.03.001"],
        "doi": "10.1007/s12217-024-10106-y",
        "source_url": "https://psi.nasa.gov/physci/repo",
        "available_document_categories": ["Metadata", "Experimental Tables", "Scientific Publications", "Video"],
        "record_origin": "METADATA_VERIFIED_RECORD",
        "verification_status": "VERIFIED_OFFICIAL_PSI_ID",
        "accessibility_status": "PORTAL_HANDOFF_REQUIRED",
    },
    {
        "investigation_id": "e0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c",
        "internal_catalog_id": "FS-CAT-BASS-I-MSG",
        "source_repository": "NASA_PSI",
        "source_record_id": None,
        "psi_id": "PSI-25",
        "local_aliases": ["BASS", "BASS-I", "PSI-BASS-01"],
        "acronym": "BASS",
        "title": "Burning and Suppression of Solids (Initial MSG Campaign / BASS-I Series)",
        "research_area": "Solid Fuel Flammability & Suppression",
        "description": (
            "Locally seeded solid fuel flammability campaign in the ISS Microgravity Science Glovebox (MSG). "
            "Companion campaign BASS-II is verified as official NASA PSI record PSI-25; BASS-I standalone PSI record ID is unverified."
        ),
        "facility": "ISS Microgravity Science Glovebox (MSG)",
        "gravity_regime": "Microgravity (~0g)",
        "fuel_types": ["Solid Polymer", "PMMA", "Cotton-Fiberglass"],
        "dataset_doi": None,
        "publication_dois": ["10.2514/6.2012-3492", "10.1007/s12217-024-10106-y"],
        "doi": "10.2514/6.2012-3492",
        "source_url": "https://psi.nasa.gov/physci/repo",
        "available_document_categories": ["Metadata", "Experimental Tables", "Analyzed Data", "Scientific Publications"],
        "record_origin": "LOCAL_SEED_RECORD",
        "verification_status": "UNVERIFIED_OFFICIAL_PSI_ID",
        "accessibility_status": "DIRECT_DOWNLOAD_AVAILABLE",
    },
    {
        "investigation_id": "f1b2c3d4-e5f6-4a7b-8c9d-1e2f3a4b5c6d",
        "internal_catalog_id": "FS-CAT-SAFFIRE-I-098",
        "source_repository": "NASA_PSI",
        "source_record_id": "PSI-98",
        "psi_id": "PSI-98",
        "local_aliases": ["SAFFIRE", "SAFFIRE-I", "PSI-98", "PSI-SAFFIRE-01"],
        "acronym": "SAFFIRE",
        "title": "Spacecraft Fire Safety Experiment - I (Saffire-I)",
        "research_area": "Large-Scale Spacecraft Fire Safety",
        "description": (
            "Official NASA PSI investigation PSI-98 (Saffire-I): Large-scale solid material flame spread and cabin "
            "pressure/oxygen response experiments conducted aboard an uncrewed Cygnus resupply vehicle."
        ),
        "facility": "Cygnus Autonomous Orbital Vehicle",
        "gravity_regime": "Microgravity (~0g)",
        "fuel_types": ["Solid Fabric Blend", "Sibal Fabric", "PMMA"],
        "dataset_doi": None,
        "publication_dois": ["10.32865/2346/108820", "10.1007/s10694-019-00941-6"],
        "doi": "10.32865/2346/108820",
        "source_url": "https://psi.nasa.gov/physci/repo",
        "available_document_categories": [
            "Metadata",
            "Experimental Tables",
            "Analyzed Data",
            "Scientific Publications",
            "Engineering Documents",
        ],
        "record_origin": "LOCAL_SEED_RECORD",
        "verification_status": "VERIFIED_OFFICIAL_PSI_ID",
        "accessibility_status": "DIRECT_DOWNLOAD_AVAILABLE",
    },
    {
        "investigation_id": "a2c3d4e5-f6a7-4b8c-9d0e-2f3a4b5c6d7e",
        "internal_catalog_id": "FS-CAT-FLEX-069",
        "source_repository": "NASA_PSI",
        "source_record_id": "PSI-69",
        "psi_id": "PSI-69",
        "local_aliases": ["FLEX", "PSI-69", "PSI-FLEX-01"],
        "acronym": "FLEX",
        "title": "Flame Extinguishment Experiment (FLEX)",
        "research_area": "Droplet Combustion & Cool Flame Kinetics",
        "description": (
            "Official NASA PSI investigation PSI-69 studying spherical droplet combustion, burning rate constants, "
            "radiative extinction, and two-stage cool-flame chemistry of heptane and methanol fuels in the ISS CIR."
        ),
        "facility": "ISS Combustion Integrated Rack (CIR)",
        "gravity_regime": "Microgravity (~0g)",
        "fuel_types": ["Liquid Hydrocarbon", "n-Heptane", "Methanol"],
        "dataset_doi": None,
        "publication_dois": ["10.1016/j.combustflame.2015.01.012", "10.1016/j.combustflame.2009.09.012"],
        "doi": "10.1016/j.combustflame.2015.01.012",
        "source_url": "https://psi.nasa.gov/physci/repo",
        "available_document_categories": ["Metadata", "Experimental Tables", "Analyzed Data", "Scientific Publications"],
        "record_origin": "LOCAL_SEED_RECORD",
        "verification_status": "VERIFIED_OFFICIAL_PSI_ID",
        "accessibility_status": "DIRECT_DOWNLOAD_AVAILABLE",
    },
    {
        "investigation_id": "psi-cat-flex-2",
        "internal_catalog_id": "FS-CAT-FLEX-2",
        "source_repository": "NASA_PSI",
        "source_record_id": None,
        "psi_id": "FS-CAT-FLEX-2",
        "local_aliases": ["FLEX-2", "PSI-FLEX-2-01"],
        "acronym": "FLEX-2",
        "title": "Flame Extinguishment Experiment - 2",
        "research_area": "Droplet Combustion & Cool Flame Kinetics",
        "description": (
            "Investigates bi-component droplet combustion, droplet arrays, and convective droplet burning in the ISS CIR. "
            "Standalone official PSI record number is unverified in local seed."
        ),
        "facility": "ISS Combustion Integrated Rack (CIR)",
        "gravity_regime": "Microgravity (~0g)",
        "fuel_types": ["Liquid Hydrocarbon", "n-Heptane", "Iso-Octane", "Methanol"],
        "dataset_doi": None,
        "publication_dois": ["10.1016/j.combustflame.2015.01.012"],
        "doi": "10.1016/j.combustflame.2015.01.012",
        "source_url": "https://psi.nasa.gov/physci/repo",
        "available_document_categories": ["Metadata", "Experimental Tables", "Raw Data"],
        "record_origin": "METADATA_VERIFIED_RECORD",
        "verification_status": "UNVERIFIED_OFFICIAL_PSI_ID",
        "accessibility_status": "PORTAL_HANDOFF_REQUIRED",
    },
    {
        "investigation_id": "b3c4d5e6-f7a8-4c9d-0e1f-3a4b5c6d7e8f",
        "internal_catalog_id": "FS-CAT-SAME-102",
        "source_repository": "NASA_PSI",
        "source_record_id": "PSI-102",
        "psi_id": "PSI-102",
        "local_aliases": ["SAME", "PSI-102", "PSI-SAME-01"],
        "acronym": "SAME",
        "title": "Smoke Aerosol Measurement Experiment (SAME)",
        "research_area": "Smoke Detection & Particle Morphology",
        "description": (
            "Official NASA PSI investigation PSI-102 characterizing smoke particle size distributions, agglomeration dynamics, "
            "and photoelectric vs. ionization detector response from overheated spacecraft materials (Kapton, Teflon, Silicone)."
        ),
        "facility": "ISS Microgravity Science Glovebox (MSG)",
        "gravity_regime": "Microgravity (~0g)",
        "fuel_types": ["Wire Insulation Polymer", "Kapton", "Teflon", "Silicone"],
        "dataset_doi": None,
        "publication_dois": ["10.2514/6.2013-3433", "10.2514/6.2012-3536"],
        "doi": "10.2514/6.2013-3433",
        "source_url": "https://psi.nasa.gov/physci/repo",
        "available_document_categories": [
            "Metadata",
            "Experimental Tables",
            "Analyzed Data",
            "Scientific Publications",
            "Hardware Documentation",
        ],
        "record_origin": "LOCAL_SEED_RECORD",
        "verification_status": "VERIFIED_OFFICIAL_PSI_ID",
        "accessibility_status": "DIRECT_DOWNLOAD_AVAILABLE",
    },
    {
        "investigation_id": "psi-cat-same-r-101",
        "internal_catalog_id": "FS-CAT-SAME-R-101",
        "source_repository": "NASA_PSI",
        "source_record_id": "PSI-101",
        "psi_id": "PSI-101",
        "local_aliases": ["SAME-R", "PSI-101", "PSI-SAME-R-01"],
        "acronym": "SAME-R",
        "title": "Smoke Aerosol Measurement Experiment - Reflight (SAME-R)",
        "research_area": "Smoke Detection & Particle Morphology",
        "description": (
            "Official NASA PSI investigation PSI-101: Reflight of the Smoke Aerosol Measurement Experiment studying "
            "aging and agglomeration of pyrolysis smoke aerosols in the ISS Microgravity Science Glovebox."
        ),
        "facility": "ISS Microgravity Science Glovebox (MSG)",
        "gravity_regime": "Microgravity (~0g)",
        "fuel_types": ["Wire Insulation Polymer", "Kapton", "Teflon", "Cellulose"],
        "dataset_doi": None,
        "publication_dois": ["10.2514/6.2012-3536", "10.2514/6.2013-3433"],
        "doi": "10.2514/6.2012-3536",
        "source_url": "https://psi.nasa.gov/physci/repo",
        "available_document_categories": ["Metadata", "Experimental Tables", "Analyzed Data"],
        "record_origin": "METADATA_VERIFIED_RECORD",
        "verification_status": "VERIFIED_OFFICIAL_PSI_ID",
        "accessibility_status": "PORTAL_HANDOFF_REQUIRED",
    },
    {
        "investigation_id": "c4d5e6f7-a8b9-4d0e-1f2a-4b5c6d7e8f9a",
        "internal_catalog_id": "FS-CAT-ACME-CFIG-159",
        "source_repository": "NASA_PSI",
        "source_record_id": "PSI-159",
        "psi_id": "PSI-159",
        "local_aliases": ["ACME", "PSI-159", "PSI-ACME-01"],
        "acronym": "ACME",
        "title": "Advanced Combustion via Microgravity Experiments (ACME / CFI-G)",
        "research_area": "Gaseous Flame Stabilization & Soot Dynamics",
        "description": (
            "Gaseous microgravity diffusion flame suite in the ISS CIR. Official NASA PSI record PSI-159 corresponds to "
            "the ACME Cool Flames Investigation with Gases (CFI-G) dataset; general ACME campaign covers 5 burner experiments."
        ),
        "facility": "ISS Combustion Integrated Rack (CIR)",
        "gravity_regime": "Microgravity (~0g)",
        "fuel_types": ["Gaseous Hydrocarbon", "Methane", "Ethylene"],
        "dataset_doi": None,
        "publication_dois": ["10.1016/j.combustflame.2016.02.012", "10.1016/j.proci.2014.05.064"],
        "doi": "10.1016/j.combustflame.2016.02.012",
        "source_url": "https://psi.nasa.gov/physci/repo",
        "available_document_categories": ["Metadata", "Experimental Tables", "Analyzed Data", "Scientific Publications"],
        "record_origin": "LOCAL_SEED_RECORD",
        "verification_status": "VERIFIED_OFFICIAL_PSI_ID",
        "accessibility_status": "DIRECT_DOWNLOAD_AVAILABLE",
    },
    {
        "investigation_id": "psi-cat-cfi-g-159",
        "internal_catalog_id": "FS-CAT-CFI-G-159",
        "source_repository": "NASA_PSI",
        "source_record_id": "PSI-159",
        "psi_id": "PSI-159",
        "local_aliases": ["CFI-G", "ACME CFI-G", "PSI-159", "PSI-CFI-G-01"],
        "acronym": "CFI-G",
        "title": "ACME Cool Flames Investigation with Gases (CFI-G)",
        "research_area": "Gaseous Flame Stabilization & Soot Dynamics",
        "description": (
            "Official NASA PSI investigation PSI-159 studying low-temperature gaseous hydrocarbon oxidation and "
            "cool diffusion flames in microgravity inside the ISS Combustion Integrated Rack."
        ),
        "facility": "ISS Combustion Integrated Rack (CIR)",
        "gravity_regime": "Microgravity (~0g)",
        "fuel_types": ["Gaseous Hydrocarbon", "Butane", "Methane"],
        "dataset_doi": None,
        "publication_dois": ["10.1016/j.combustflame.2016.02.012"],
        "doi": "10.1016/j.combustflame.2016.02.012",
        "source_url": "https://psi.nasa.gov/physci/repo",
        "available_document_categories": ["Metadata", "Experimental Tables", "Raw Data"],
        "record_origin": "METADATA_VERIFIED_RECORD",
        "verification_status": "VERIFIED_OFFICIAL_PSI_ID",
        "accessibility_status": "PORTAL_HANDOFF_REQUIRED",
    },
    {
        "investigation_id": "psi-cat-sofie",
        "internal_catalog_id": "FS-CAT-SOFIE",
        "source_repository": "NASA_PSI",
        "source_record_id": None,
        "psi_id": "FS-CAT-SOFIE",
        "local_aliases": ["SOFIE", "PSI-SOFIE-01"],
        "acronym": "SOFIE",
        "title": "Solid Fuel Ignition and Extinction (SOFIE Campaign Suite)",
        "research_area": "Solid Fuel Flammability & Suppression",
        "description": (
            "ISS CIR hardware suite (GEL, MIST, SMOLDER, RTLS, DARTFire) investigating thick-solid flammability and PMMA ignition. "
            "Official standalone NASA PSI record ID is unverified in local seed."
        ),
        "facility": "ISS Combustion Integrated Rack (CIR)",
        "gravity_regime": "Microgravity (~0g)",
        "fuel_types": ["Solid Polymer", "PMMA"],
        "dataset_doi": None,
        "publication_dois": [],
        "doi": None,
        "source_url": "https://psi.nasa.gov/physci/repo",
        "available_document_categories": ["Metadata", "Hardware Documentation"],
        "record_origin": "METADATA_VERIFIED_RECORD",
        "verification_status": "UNVERIFIED_OFFICIAL_PSI_ID",
        "accessibility_status": "PORTAL_HANDOFF_REQUIRED",
    },
    {
        "investigation_id": "psi-cat-bre",
        "internal_catalog_id": "FS-CAT-ACME-BRE",
        "source_repository": "NASA_PSI",
        "source_record_id": None,
        "psi_id": "FS-CAT-ACME-BRE",
        "local_aliases": ["BRE", "ACME-BRE", "PSI-BRE-01"],
        "acronym": "BRE",
        "title": "Burner Rig Experiment (ACME-BRE)",
        "research_area": "Gaseous Flame Stabilization & Soot Dynamics",
        "description": (
            "Investigates long-duration flat porous-burner gaseous diffusion flame stability and radiative extinction in the ISS CIR. "
            "Official standalone NASA PSI record ID is unverified in local seed."
        ),
        "facility": "ISS Combustion Integrated Rack (CIR)",
        "gravity_regime": "Microgravity (~0g)",
        "fuel_types": ["Gaseous Hydrocarbon", "Methane", "Ethylene"],
        "dataset_doi": None,
        "publication_dois": ["10.1016/j.proci.2014.05.064"],
        "doi": "10.1016/j.proci.2014.05.064",
        "source_url": "https://psi.nasa.gov/physci/repo",
        "available_document_categories": ["Metadata", "Experimental Tables"],
        "record_origin": "METADATA_VERIFIED_RECORD",
        "verification_status": "UNVERIFIED_OFFICIAL_PSI_ID",
        "accessibility_status": "PORTAL_HANDOFF_REQUIRED",
    },
]


class PSIDiscoveryService:
    """
    AGENT 04 — NASA PSI Discovery Service.
    Separates:
    - Locally seeded records (LOCAL_SEED_RECORD)
    - Metadata-verified records (METADATA_VERIFIED_RECORD)
    - Live-discovered records (LIVE_DISCOVERED_RECORD)
    Preserves official NASA PSI source_record_id separately from internal_catalog_id and local_aliases,
    and separates dataset_doi from publication_dois.
    """

    @classmethod
    def search_investigations(
        cls,
        query: str = "",
        fuel_type: Optional[str] = None,
        research_domain: Optional[str] = None,
        variables_of_interest: Optional[List[str]] = None,
        record_origin_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        q_lower = (query or "").lower()
        fuel_lower = (fuel_type or "").lower()
        dom_lower = (research_domain or "").lower()
        vars_list = [v.lower() for v in (variables_of_interest or [])]

        results: List[Dict[str, Any]] = []
        for entry in VERIFIED_PSI_CATALOG:
            if record_origin_filter and entry.get("record_origin") != record_origin_filter:
                continue

            valid_url, _ = PSISourceValidator.validate_source_url(entry["source_url"])
            if not valid_url:
                continue

            haystack = " ".join(
                [
                    entry["acronym"],
                    entry["internal_catalog_id"],
                    entry.get("source_record_id") or "",
                    " ".join(entry.get("local_aliases", [])),
                    entry["title"],
                    entry["research_area"],
                    entry["description"],
                    " ".join(entry.get("fuel_types", [])),
                ]
            ).lower()

            score = 50.0
            if entry["accessibility_status"] == "DIRECT_DOWNLOAD_AVAILABLE":
                score += 20.0
            if entry.get("verification_status") == "VERIFIED_OFFICIAL_PSI_ID":
                score += 5.0

            if q_lower:
                q_terms = [t for t in q_lower.split() if len(t) > 2]
                hits = sum(1 for t in q_terms if t in haystack)
                score += min(25.0, hits * 6.5)

            if fuel_lower and fuel_lower not in ("all", "any", ""):
                if any(fuel_lower in f.lower() or f.lower() in fuel_lower for f in entry.get("fuel_types", [])):
                    score += 15.0
                elif fuel_lower in haystack:
                    score += 10.0
                else:
                    score -= 15.0

            if dom_lower and dom_lower in haystack:
                score += 10.0

            for v in vars_list:
                v_clean = v.replace("_", " ")
                if any(tok in haystack for tok in v_clean.split()):
                    score += 4.0

            final_score = round(max(10.0, min(100.0, score)), 1)
            item = dict(entry)
            item["relevance_score"] = final_score
            item["last_verified_at"] = now
            results.append(item)

        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        return results

    @classmethod
    def get_investigation_by_id(cls, identifier: str) -> Optional[Dict[str, Any]]:
        """Resolves by internal_catalog_id, official source_record_id (e.g. PSI-25, PSI-69, PSI-98, PSI-101, PSI-102, PSI-159),
        acronym, or preserved local_aliases (e.g. PSI-BASS-01).
        """
        ident_lower = identifier.strip().lower()
        now = datetime.now(timezone.utc)
        # First pass: exact match on internal_catalog_id, source_record_id, or acronym
        for entry in VERIFIED_PSI_CATALOG:
            if (
                entry["investigation_id"].lower() == ident_lower
                or entry["internal_catalog_id"].lower() == ident_lower
                or (entry.get("source_record_id") and entry["source_record_id"].lower() == ident_lower)
                or entry["acronym"].lower() == ident_lower
            ):
                item = dict(entry)
                item["relevance_score"] = 95.0
                item["last_verified_at"] = now
                return item
        # Second pass: match on preserved local_aliases
        for entry in VERIFIED_PSI_CATALOG:
            aliases_lower = [a.lower() for a in entry.get("local_aliases", [])]
            if ident_lower in aliases_lower:
                item = dict(entry)
                item["relevance_score"] = 90.0
                item["last_verified_at"] = now
                return item
        return None
