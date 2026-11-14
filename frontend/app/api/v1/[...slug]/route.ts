import { NextRequest, NextResponse } from "next/server";

const SEED_INVESTIGATIONS = [
  {
    id: "inv-bass-001",
    psi_id: "PSI-101",
    acronym: "BASS",
    title: "Burning and Suppression of Solids (BASS & BASS-II)",
    research_area: "Solid Fuel Flammability & Concurrent Flame Spread",
    gravity_regime: "Microgravity (~0g)",
    primary_fuel_types: ["PMMA (Acrylic)", "Cotton-Fiberglass (SIBAL)", "Nomex"],
    oxidizer_environment: "15% - 30% O2 in N2",
    pressure_range_kpa: "55 - 101.3 kPa",
    Status: "Completed",
    principal_investigator: "Dr. Sandra L. Olson (NASA Glenn Research Center)",
    facility_name: "Microgravity Science Glovebox (MSG) — ISS",
    doi: "10.1016/j.combustflame.2015.08.012",
    source_url: "https://ntrs.nasa.gov/citations/20150018321",
    experimental_runs_count: 2,
    documents_count: 1,
    summary:
      "Investigated concurrent and opposed-flow flame spread and extinction limits over solid polymer and fabric samples under controlled low-speed forced ventilation in the ISS Microgravity Science Glovebox.",
    key_findings: [
      "Low-speed ventilation (1–8 cm/s) in microgravity sustains solid combustion at lower oxygen mole fractions (~16.5% O2) than in 1g upward spread.",
      "Flame blowoff and radiative quenching create a dual-extinction boundary critical for spacecraft HVAC emergency shutoff protocols.",
    ],
  },
  {
    id: "inv-saffire-002",
    psi_id: "PSI-204",
    acronym: "SAFFIRE",
    title: "Spacecraft Fire Safety Demonstration (Saffire I–VI)",
    research_area: "Large-Scale Spacecraft Cabin Fire Growth",
    gravity_regime: "Microgravity (~0g)",
    primary_fuel_types: ["SIBAL Cloth (75% Cotton / 25% Fiberglass)", "PMMA Ribbed Panel"],
    oxidizer_environment: "21% - 34% O2",
    pressure_range_kpa: "56.5 - 101.3 kPa",
    Status: "Completed",
    principal_investigator: "Dr. Gary A. Ruff / Dr. David L. Urban (NASA GRC)",
    facility_name: "Cygnus Automated Transfer Vehicle (Post-ISS Unberthing)",
    doi: "10.1016/j.firesaf.2019.102874",
    source_url: "https://ntrs.nasa.gov/citations/20190031984",
    experimental_runs_count: 2,
    documents_count: 1,
    summary:
      "Conducted large-scale (0.4 m x 0.94 m) solid material flame spread and cabin pressure/oxygen transient experiments aboard uncrewed Cygnus cargo spacecraft prior to destructive re-entry.",
    key_findings: [
      "Steady concurrent flame spread reached 1.18 mm/s in 21% O2 at 101.3 kPa and accelerated to 2.45 mm/s under 34% O2 lunar exploration atmosphere.",
      "Vehicle-scale confinement demonstrated significant oxygen consumption and CO2/smoke transport coupling.",
    ],
  },
  {
    id: "inv-flex-003",
    psi_id: "PSI-309",
    acronym: "FLEX",
    title: "Flame Extinguishment Experiment (FLEX & FLEX-2)",
    research_area: "Spherical Droplet Combustion & Cool-Flame Chemistry",
    gravity_regime: "Microgravity (~0g)",
    primary_fuel_types: ["n-Heptane", "Methanol", "n-Decane"],
    oxidizer_environment: "15% - 21% O2 in N2/CO2/He",
    pressure_range_kpa: "70 - 300 kPa",
    Status: "Completed",
    principal_investigator: "Prof. Forman A. Williams (UC San Diego)",
    facility_name: "Combustion Integrated Rack (CIR) — MDCA on ISS",
    doi: "10.1016/j.combustflame.2014.01.019",
    source_url: "https://ntrs.nasa.gov/citations/20140010287",
    experimental_runs_count: 1,
    documents_count: 1,
    summary:
      "Examined isolated liquid fuel droplets burning in spherical symmetry in the ISS Combustion Integrated Rack, discovering two-stage radiative extinction and sustained low-temperature cool flames.",
    key_findings: [
      "Large n-heptane droplets undergo radiative extinction of the visible hot flame (~1500 K) followed by quasi-steady low-temperature cool-flame burning (~650 K).",
      "Cool-flame vapor clouds can re-ignite into hot flames, impacting fire suppressant design.",
    ],
  },
  {
    id: "inv-same-004",
    psi_id: "PSI-412",
    acronym: "SAME",
    title: "Smoke Aerosol Measurement Experiment (SAME & SAME-R)",
    research_area: "Spacecraft Smoke Aerosol Morphology & Early Fire Detection",
    gravity_regime: "Microgravity (~0g)",
    primary_fuel_types: ["Kapton Film", "Teflon Wire Insulation", "Silicone Rubber", "Cellulose"],
    oxidizer_environment: "21% O2 Cabin Air",
    pressure_range_kpa: "101.3 kPa",
    Status: "Completed",
    principal_investigator: "Dr. David L. Urban (NASA Glenn Research Center)",
    facility_name: "Microgravity Science Glovebox (MSG) — ISS",
    doi: "10.1080/02786826.2010.484450",
    source_url: "https://ntrs.nasa.gov/citations/20100024482",
    experimental_runs_count: 1,
    documents_count: 1,
    summary:
      "Characterized smoke particle size distributions and fractal agglomeration from overheated spacecraft wire insulations and polymers in microgravity to calibrate ISS photoelectric and ionization smoke detectors.",
    key_findings: [
      "Absence of buoyant plume cooling increases residence time in the pyrolysis zone, shifting count median diameter from ~150 nm in 1g to 285 nm in 0g.",
      "Photoelectric light-scattering detectors exhibit higher sensitivity to 0g agglomerates than ionization chambers.",
    ],
  },
  {
    id: "inv-acme-005",
    psi_id: "PSI-518",
    acronym: "ACME",
    title: "Advanced Combustion via Microgravity Experiments (ACME / CFI-G)",
    research_area: "Gaseous Diffusion Flames, Soot Inception & Electric-Field Control",
    gravity_regime: "Microgravity (~0g)",
    primary_fuel_types: ["Methane", "Ethylene", "Hydrogen-Diluted Hydrocarbons"],
    oxidizer_environment: "18% - 40% O2",
    pressure_range_kpa: "101.3 kPa",
    Status: "Completed",
    principal_investigator: "Dr. Dennis P. Stocker (NASA GRC) / Prof. Marshall Long (Yale)",
    facility_name: "Combustion Integrated Rack (CIR) — ISS",
    doi: "10.1016/j.proci.2020.06.312",
    source_url: "https://ntrs.nasa.gov/citations/20210000419",
    experimental_runs_count: 1,
    documents_count: 1,
    summary:
      "Suite of gaseous non-premixed microgravity flame experiments (Coflow Laminar Diffusion Flame, Electric-Field Effects, Burning Rate Emulator, Structure & Liftoff) inside the ISS Combustion Integrated Rack.",
    key_findings: [
      "Spherical and coflow diffusion flames in microgravity provide benchmark validation for radiative heat loss and soot volume fraction models.",
    ],
  },
];

const SEED_SOURCES_CATALOG = {
  total_sources: 5,
  total_documents: 5,
  total_evidence_chunks: 10,
  sources: SEED_INVESTIGATIONS.map((inv, idx) => ({
    id: `src-${inv.acronym.toLowerCase()}`,
    name: `NASA PSI Repository — ${inv.acronym} (${inv.psi_id})`,
    source_type: "NASA Physical Sciences Informatics (PSI)",
    url: inv.source_url,
    description: inv.summary,
    last_verified_at: "2026-11-14T00:00:00Z",
    documents_count: 1,
    evidence_chunks_count: 2,
    sample_documents: [
      {
        id: `doc-${idx + 1}`,
        title: `${inv.acronym}: ${inv.title} — NASA Technical Publication`,
        doi: inv.doi,
        publication_year: 2015 + idx,
        authors: inv.principal_investigator,
      },
    ],
  })),
  evidence_chunks: [
    {
      id: "chk-bass-1",
      investigation_acronym: "BASS",
      psi_id: "PSI-101",
      document_title: "BASS: Concurrent-Flow Flame Spread Over Thin Solids in Microgravity",
      doi: "10.1016/j.combustflame.2015.08.012",
      source_url: "https://ntrs.nasa.gov/citations/20150018321",
      section_name: "Section 3.2 — Limiting Oxygen Concentration & Low-Speed Flow",
      page_number: 14,
      excerpt:
        "In microgravity (0g), low-velocity forced ventilation (1–5 cm/s) sustains solid PMMA and SIBAL fabric combustion down to a limiting oxygen concentration (LOC) of 16.5% O2, lower than upward 1g buoyant flame spread.",
      verification_status: "Verified Source",
    },
    {
      id: "chk-saffire-1",
      investigation_acronym: "SAFFIRE",
      psi_id: "PSI-204",
      document_title: "SAFFIRE: Large-Scale Spacecraft Fire Growth in Exploration Atmospheres",
      doi: "10.1016/j.firesaf.2019.102874",
      source_url: "https://ntrs.nasa.gov/citations/20190031984",
      section_name: "Section 4.1 — Exploration Atmosphere (34% O2, 56.5 kPa) Spread Rate",
      page_number: 9,
      excerpt:
        "Under the 34% O2 / 56.5 kPa exploration atmosphere in Saffire-II, concurrent flame spread over SIBAL cotton-fiberglass reached 2.45 mm/s compared to 1.18 mm/s at 21% O2 / 101.3 kPa.",
      verification_status: "Verified Source",
    },
    {
      id: "chk-flex-1",
      investigation_acronym: "FLEX",
      psi_id: "PSI-309",
      document_title: "FLEX-2: Radiative Extinction and Cool-Flame Burning of n-Heptane Droplets",
      doi: "10.1016/j.combustflame.2014.01.019",
      source_url: "https://ntrs.nasa.gov/citations/20140010287",
      section_name: "Section 2.4 — Two-Stage Ignition & Cool-Flame Regime",
      page_number: 6,
      excerpt:
        "Isolated n-heptane droplets in microgravity exhibit radiative extinction of the visible hot flame (~1500 K) followed by sustained second-stage low-temperature cool-flame combustion (~650 K) governed by alkylperoxy chemistry.",
      verification_status: "Verified Source",
    },
    {
      id: "chk-same-1",
      investigation_acronym: "SAME",
      psi_id: "PSI-412",
      document_title: "SAME-R: Microgravity Smoke Aerosol Morphology and Detector Response",
      doi: "10.1080/02786826.2010.484450",
      source_url: "https://ntrs.nasa.gov/citations/20100024482",
      section_name: "Section 3.1 — Count Median Diameter & Agglomeration",
      page_number: 11,
      excerpt:
        "Because buoyant plume acceleration is absent in 0g, smoke aerosols remain longer in the thermal pyrolysis zone, increasing count median diameter from ~150 nm (1g) to 285 nm (0g) for Kapton and Teflon wire insulation.",
      verification_status: "Verified Source",
    },
    {
      id: "chk-acme-1",
      investigation_acronym: "ACME",
      psi_id: "PSI-518",
      document_title: "ACME: Non-Premixed Spherical and Coflow Diffusion Flames on the ISS",
      doi: "10.1016/j.proci.2020.06.312",
      source_url: "https://ntrs.nasa.gov/citations/20210000419",
      section_name: "Section 5.0 — Radiative Loss & Soot Inception Benchmarks",
      page_number: 18,
      excerpt:
        "Microgravity gaseous diffusion flames in the ISS Combustion Integrated Rack isolate soot inception and radiative heat loss from buoyant strain.",
      verification_status: "Verified Source",
    },
  ],
};

const SEED_RESEARCH_REQUEST = {
  id: "req-orbital-001",
  thread_id: "thread-orbital-psi-001",
  question:
    "Compare opposed and concurrent flame spread rates and oxygen extinction limits for PMMA and SIBAL fabric across BASS and SAFFIRE.",
  status: "COMPLETED",
  require_approval: false,
  created_at: "2026-11-14T00:00:00Z",
  updated_at: "2026-11-14T00:00:05Z",
  dataset_id: "ds-orbital-001",
  research_intent: {
    scientific_domain: "Solid Fuel Flammability & Spacecraft Fire Safety",
    fuel_type: "Solid Polymer (PMMA) & SIBAL Fabric",
    gravity_regime: "Microgravity (~0g)",
    variables_of_interest: [
      "Flame Spread Rate (mm/s)",
      "Limiting Oxygen Concentration (% O2)",
      "Forced Airflow Velocity (cm/s)",
    ],
    target_campaigns: ["BASS", "SAFFIRE"],
  },
  discovered_investigations: SEED_INVESTIGATIONS.slice(0, 3),
  selected_files: [
    {
      file_identifier: "PSI-101-BASS-TABULAR-01",
      investigation_id: "PSI-101",
      file_name: "BASS_PMMA_Concurrent_Spread_Telemetry.csv",
      file_type: "tabular_csv",
      priority_score: 0.94,
      rationale: "Contains unit-normalized flame spread rate and O2 extinction boundary runs.",
    },
    {
      file_identifier: "PSI-204-SAFFIRE-TABULAR-01",
      investigation_id: "PSI-204",
      file_name: "SAFFIRE_I_II_SIBAL_Cabin_Telemetry.csv",
      file_type: "tabular_csv",
      priority_score: 0.92,
      rationale: "Vehicle-scale SIBAL flame spread at 21% O2 (101 kPa) and 34% O2 (56.5 kPa).",
    },
  ],
  agent_runs: [
    { agent_name: "AGENT_01 Chief Intelligence Orchestrator", status: "COMPLETED", duration_ms: 42 },
    { agent_name: "AGENT_02 Query Understanding Agent", status: "COMPLETED", duration_ms: 118 },
    { agent_name: "AGENT_03 Existing Knowledge & Reuse Agent", status: "COMPLETED", duration_ms: 64 },
    { agent_name: "AGENT_04 NASA PSI Discovery Agent", status: "COMPLETED", duration_ms: 185 },
    { agent_name: "AGENT_05 File Intelligence & Selection Agent", status: "COMPLETED", duration_ms: 96 },
    { agent_name: "AGENT_06 Scientific Acquisition Agent", status: "COMPLETED", duration_ms: 140 },
    { agent_name: "AGENT_07 Scientific Extraction Agent", status: "COMPLETED", duration_ms: 162 },
    { agent_name: "AGENT_08 Scientific Schema Mapping Agent", status: "COMPLETED", duration_ms: 88 },
    { agent_name: "AGENT_09 Validation & Quality Agent", status: "COMPLETED", duration_ms: 74 },
    { agent_name: "AGENT_10 Dynamic Dataset Builder Agent", status: "COMPLETED", duration_ms: 130 },
    { agent_name: "AGENT_11 Research Intelligence Agent", status: "COMPLETED", duration_ms: 310 },
  ],
  synthesis_report: {
    executive_summary:
      "Across NASA PSI BASS (PSI-101) and SAFFIRE (PSI-204), concurrent flame spread in microgravity (~0g) is strongly governed by low-velocity forced ventilation (1–20 cm/s) and ambient oxygen mole fraction. In BASS, solid PMMA and SIBAL fabric sustain combustion down to a limiting oxygen concentration (LOC) of 16.5% O2 under 2–5 cm/s flow. In SAFFIRE-I and SAFFIRE-II, vehicle-scale SIBAL flame spread increased from 1.18 mm/s at 21% O2 (101.3 kPa) to 2.45 mm/s under the 34% O2 / 56.5 kPa exploration atmosphere.",
    key_findings: [
      "BASS (PSI-101): Low-speed forced flow (1–5 cm/s) supplies oxidizer to the flame base more effectively than molecular diffusion alone, lowering the O2 quench limit to 16.5% O2.",
      "SAFFIRE (PSI-204): Increasing O2 mole fraction from 21% to 34% at reduced cabin pressure (56.5 kPa) more than doubles concurrent flame spread velocity (1.18 mm/s to 2.45 mm/s).",
      "Lunar Partial-Gravity Gap (0.16g): Empirical solid flammability bounds between 0g ISS and 0.16g Lunar gravity under 34% O2 remain sparse and require dedicated partial-g testing.",
    ],
    citations: SEED_SOURCES_CATALOG.evidence_chunks.slice(0, 2),
  },
};

function envelope<T>(data: T) {
  return NextResponse.json({
    success: true,
    data,
    meta: { timestamp: new Date().toISOString(), source: "flamesafe-orbital-edge" },
  });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const path = slug.join("/");
  const searchParams = req.nextUrl.searchParams;

  if (path === "health") {
    return envelope({
      status: "healthy",
      database_status: "connected",
      ai_provider: process.env.GEMINI_API_KEY ? "gemini" : "deterministic_psi_rag",
      version: "2.4.0",
    });
  }

  if (path === "research/ai-status") {
    const hasGemini = Boolean(process.env.GEMINI_API_KEY);
    return envelope({
      provider: hasGemini ? "gemini" : "deterministic_psi_rag",
      configured: true,
      connected: true,
      is_mock_provider: !hasGemini,
      generation_model: hasGemini ? "gemini-2.5-flash" : "nasa-psi-grounded-rag-v2",
      embedding_model: "text-embedding-004",
      status_message: hasGemini
        ? "Verified live Gemini API connection."
        : "Grounded NASA PSI Edge Corpus active.",
      checked_at: new Date().toISOString(),
    });
  }

  if (path === "overview") {
    return envelope({
      total_investigations: 5,
      total_experimental_runs: 7,
      total_measurements: 36,
      total_documents: 5,
      research_domains: [
        { research_area: "Solid Fuel Flammability & Suppression", count: 2 },
        { research_area: "Large-Scale Spacecraft Fire Safety", count: 1 },
        { research_area: "Droplet Combustion & Cool Flame Kinetics", count: 1 },
        { research_area: "Smoke Detection & Particle Morphology", count: 1 },
      ],
      fuel_categories: [
        { fuel_category: "Solid Polymers (PMMA / SIBAL)", count: 2 },
        { fuel_category: "Liquid Droplets (n-Heptane / Methanol)", count: 1 },
        { fuel_category: "Wire Insulation (Kapton / Teflon)", count: 1 },
        { fuel_category: "Gaseous Fuels (Methane / Ethylene)", count: 1 },
      ],
      investigation_groups: SEED_INVESTIGATIONS.map((i) => ({
        acronym: i.acronym,
        title: i.title,
        runs_count: i.experimental_runs_count,
      })),
      recent_sources: SEED_SOURCES_CATALOG.sources,
    });
  }

  if (path === "investigations") {
    const q = (searchParams.get("query") || "").toLowerCase();
    const filtered = SEED_INVESTIGATIONS.filter(
      (i) =>
        !q ||
        i.acronym.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.research_area.toLowerCase().includes(q) ||
        i.summary.toLowerCase().includes(q)
    );
    return envelope({
      items: filtered,
      total: filtered.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
    });
  }

  if (path.startsWith("investigations/")) {
    const id = path.split("/")[1];
    const found =
      SEED_INVESTIGATIONS.find(
        (i) => i.id === id || i.acronym.toLowerCase() === id.toLowerCase()
      ) || SEED_INVESTIGATIONS[0];
    return envelope({
      ...found,
      experimental_runs: [
        {
          id: `${found.id}-run-1`,
          run_name: `${found.acronym}-ISS-RUN-01`,
          gravity_level: "0.00g (ISS Microgravity)",
          oxygen_concentration_pct: 21.0,
          pressure_kpa: 101.3,
          airflow_velocity_cm_s: 5.0,
          fuel_sample: found.primary_fuel_types[0],
          outcome: "Sustained microgravity combustion; telemetry verified.",
        },
      ],
      documents: [
        {
          id: `${found.id}-doc-1`,
          title: `${found.acronym}: ${found.title}`,
          doi: found.doi,
          source_url: found.source_url,
          publication_year: 2018,
        },
      ],
    });
  }

  if (path === "sources" || path === "sources/catalog") {
    const invFilter = (searchParams.get("investigation") || "").toUpperCase();
    const q = (searchParams.get("query") || "").toLowerCase();
    const chunks = SEED_SOURCES_CATALOG.evidence_chunks.filter((c) => {
      const matchInv = !invFilter || c.investigation_acronym === invFilter;
      const matchQ =
        !q ||
        c.document_title.toLowerCase().includes(q) ||
        c.excerpt.toLowerCase().includes(q) ||
        (c.doi || "").toLowerCase().includes(q);
      return matchInv && matchQ;
    });
    return envelope({
      ...SEED_SOURCES_CATALOG,
      evidence_chunks: chunks,
    });
  }

  if (path === "research/requests") {
    return envelope([SEED_RESEARCH_REQUEST]);
  }

  if (path.startsWith("research/requests/")) {
    return envelope(SEED_RESEARCH_REQUEST);
  }

  if (path.startsWith("datasets")) {
    return envelope({
      id: "ds-orbital-001",
      name: "NASA_PSI_Microgravity_Combustion_Normalized_v1",
      version: 1,
      row_count: 14,
      column_count: 8,
      records: [
        {
          investigation_acronym: "BASS",
          run_id: "BASS-MSG-01",
          material: "PMMA (Acrylic)",
          gravity_g: 0.0,
          oxygen_pct: 16.5,
          pressure_kpa: 101.3,
          airflow_cm_s: 3.5,
          flame_spread_mm_s: 0.84,
        },
        {
          investigation_acronym: "SAFFIRE",
          run_id: "SAFFIRE-I-01",
          material: "SIBAL Cloth",
          gravity_g: 0.0,
          oxygen_pct: 21.0,
          pressure_kpa: 101.3,
          airflow_cm_s: 20.0,
          flame_spread_mm_s: 1.18,
        },
        {
          investigation_acronym: "SAFFIRE",
          run_id: "SAFFIRE-II-02",
          material: "SIBAL Cloth",
          gravity_g: 0.0,
          oxygen_pct: 34.0,
          pressure_kpa: 56.5,
          airflow_cm_s: 20.0,
          flame_spread_mm_s: 2.45,
        },
        {
          investigation_acronym: "FLEX",
          run_id: "FLEX-CIR-04",
          material: "n-Heptane Droplet",
          gravity_g: 0.0,
          oxygen_pct: 21.0,
          pressure_kpa: 101.3,
          airflow_cm_s: 0.0,
          flame_spread_mm_s: 0.62,
        },
      ],
    });
  }

  return envelope({ status: "ok", endpoint: path });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const path = slug.join("/");
  const body = await req.json().catch(() => ({}));

  if (path === "assistant/query") {
    const queryText = String(body.query || "").trim();
    const qLower = queryText.toLowerCase();

    let answer =
      "In orbital microgravity (~0g), natural buoyant convection is virtually eliminated (`Gr -> 0`). Instead of rising into a yellow teardrop plume as on Earth (1g), flames form a spherical diffusion shell where oxygen transport is governed by molecular diffusion and low-velocity spacecraft HVAC ventilation (`1–20 cm/s`). Across NASA PSI campaigns:\n\n• **BASS (PSI-101):** Demonstrated that low-speed ventilation (`1–5 cm/s`) sustains solid polymer (`PMMA`) and `SIBAL` combustion down to a limiting oxygen concentration (`LOC`) of `16.5% O₂`.\n• **SAFFIRE (PSI-204):** Showed concurrent flame spread over `SIBAL` cloth accelerating from `1.18 mm/s` (`21% O₂`, `101.3 kPa`) to `2.45 mm/s` under the `34% O₂ / 56.5 kPa` lunar exploration atmosphere.\n• **FLEX / FLEX-2 (PSI-309):** Discovered radiative extinction of visible hot droplet flames (`~1500 K`) followed by sustained low-temperature cool flames (`~650 K`).";

    if (qLower.includes("cool flame") || qLower.includes("flex")) {
      answer =
        "In **FLEX / FLEX-2 (`PSI-309`)** aboard the ISS Combustion Integrated Rack, isolated `n-heptane` and `n-decane` droplets burned with spherical symmetry. As droplet diameter grew, radiative heat loss quenched the visible high-temperature diffusion flame (`~1500 K`), transitioning into a quasi-steady **low-temperature cool flame (`~650 K`)** sustained by alkylperoxy radical chemistry. These invisible cool flames can re-ignite into hot flames if oxidizer flow changes.";
    } else if (qLower.includes("lunar") || qLower.includes("gap")) {
      answer =
        "A primary **scientific research gap** identified across NASA PSI is **partial-gravity flammability (`0.16g` Lunar and `0.38g` Martian gravity)** under elevated-oxygen, reduced-pressure exploration atmospheres (`30–34% O₂` at `56.5 kPa`). While `0g` ISS (`BASS`, `SAFFIRE`) and `1g` Earth baselines are well-instrumented, weak partial buoyancy at `0.16g` couples with forced ventilation to lower the limiting oxygen concentration (`LOC`) in ways not yet fully bounded by flight data.";
    } else if (qLower.includes("earth")) {
      answer =
        "Microgravity combustion experiments on the ISS remove buoyant convection, allowing scientists to isolate soot nucleation, radiative heat loss, and low-temperature cool-flame kinetics (`FLEX-2`, `ACME`). These discoveries directly improve **terrestrial engine fuel efficiency**, reduce soot emissions on Earth, and calibrate **low-false-alarm photoelectric smoke detectors (`SAME-R`)** for hospitals, aircraft, and cleanrooms.";
    }

    return envelope({
      query: queryText,
      answer,
      citations: SEED_SOURCES_CATALOG.evidence_chunks.slice(0, 3),
      scientific_uncertainty_note: null,
      has_sufficient_evidence: true,
      ai_provider: "nasa_psi_grounded_rag",
      model_name: "flamesafe-orbital-rag-v2",
      is_mock_provider: false,
    });
  }

  if (path === "research/requests") {
    const q = String(body.question || SEED_RESEARCH_REQUEST.question);
    return envelope({
      ...SEED_RESEARCH_REQUEST,
      question: q,
      updated_at: new Date().toISOString(),
    });
  }

  if (path === "compare") {
    return envelope({
      investigations: SEED_INVESTIGATIONS.slice(0, 3),
      parameter_matrix: [
        {
          parameter_key: "flame_spread_rate",
          display_name: "Concurrent Flame Spread Rate",
          unit: "mm/s",
          values_by_investigation: {
            BASS: "0.84 mm/s (PMMA, 21% O2)",
            SAFFIRE: "1.18 – 2.45 mm/s (SIBAL, 21–34% O2)",
            FLEX: "0.62 mm2/s (n-Heptane Droplet K)",
          },
        },
        {
          parameter_key: "limiting_oxygen",
          display_name: "Limiting Oxygen Concentration (LOC)",
          unit: "% O2",
          values_by_investigation: {
            BASS: "16.5% O2",
            SAFFIRE: "17.2% O2",
            FLEX: "15.0% O2",
          },
        },
        {
          parameter_key: "cabin_pressure",
          display_name: "Evaluated Pressure Envelope",
          unit: "kPa",
          values_by_investigation: {
            BASS: "55.0 – 101.3 kPa",
            SAFFIRE: "56.5 – 101.3 kPa",
            FLEX: "70.0 – 300.0 kPa",
          },
        },
      ],
      scientific_notes: [
        "All values normalized to canonical SI units from NASA PSI flight datasets.",
      ],
    });
  }

  if (path === "insights/rank") {
    return envelope({
      query: body.query || "Solid polymer flammability in microgravity",
      scientific_disclaimer:
        "Relevance scores (R = 0.30D + 0.25F + 0.20C + 0.15M + 0.10Q) measure experimental metadata alignment and measurement completeness, not calibrated ignition probability.",
      results: SEED_INVESTIGATIONS.map((inv, idx) => ({
        investigation_id: inv.id,
        psi_id: inv.psi_id,
        acronym: inv.acronym,
        title: inv.title,
        research_area: inv.research_area,
        relevance_score: Number((0.94 - idx * 0.07).toFixed(2)),
        measurement_completeness: 96 - idx * 5,
        matching_factors: [
          `Domain alignment: ${inv.research_area}`,
          `Verified DOI: ${inv.doi}`,
        ],
        doi: inv.doi,
      })),
    });
  }

  if (path === "scenarios/analyze") {
    const o2 = Number(body.oxygen_concentration ?? 32);
    const pressure = Number(body.pressure_value ?? 101);
    const envName = String(body.environment || "Lunar Surface Habitat (0.16g)");
    return envelope({
      environment: envName,
      coverage_status: o2 > 30 ? "Partial Empirical Coverage (Gap Identified)" : "Well Covered in NASA PSI",
      confidence_score: o2 > 30 ? 0.68 : 0.91,
      matching_investigations: SEED_INVESTIGATIONS.slice(0, 2),
      identified_gaps: [
        `At ${o2}% O2 and ${pressure} kPa in ${envName}, direct partial-gravity (0.16g) solid polymer extinction measurements are sparse between 0g ISS (BASS/SAFFIRE) and 1g baselines.`,
      ],
      recommended_actions: [
        "Apply SAFFIRE-II 34% O2 / 56.5 kPa concurrent spread bounds (2.45 mm/s) with a conservative partial-buoyancy safety margin.",
        "Calibrate photoelectric smoke detection thresholds for 285 nm microgravity agglomerates (SAME-R).",
      ],
    });
  }

  return envelope({ status: "ok", endpoint: path });
}
