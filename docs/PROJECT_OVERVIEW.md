# Project Overview — FlameSafe AI

## 1. Mission Context
**Competition:** 2026 NASA Space Apps Challenge — Cairo  
**Official Challenge:** *"Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data."*  
**Team Name:** R²  
**Core Team:**
- Mohamed Gharieb (Lead Backend & AI Engineer)
- Toka Reda (Lead Frontend & Product Engineer)
- Mai Hamdy (Scientific Research & Data Engineer)
- Amany Atef (UI/UX & Documentation Specialist)

---

## 2. Problem Statement
Fire represents one of the most catastrophic hazards in human space exploration. Decades of microgravity combustion experiments conducted aboard the Space Shuttle, the International Space Station (ISS), and uncrewed orbital vehicles (such as Cygnus) have generated vast volumes of scientific findings.

However, discovering and synthesizing this research is exceptionally difficult:
1. **Scattered Archives**: Crucial experimental records, video telemetry, and sensor measurements are dispersed across the NASA Physical Sciences Informatics (PSI) repository, NASA Technical Reports Server (NTRS), and disparate academic journals.
2. **Incompatible Formats**: Raw data is locked in unstructured PDF reports, heterogeneous CSV data tables, and conference proceedings without uniform parameter standardization.
3. **Complex Physics**: Combustion behavior in microgravity fundamentally differs from Earth: the absence of buoyant convective flow eliminates natural chimney effects, prolongs droplet residence times, lowers extinction airflow velocity thresholds, and alters flame geometries.
4. **Knowledge Gaps for Artemis & Mars Missions**: Spacecraft designers and mission planners preparing for lunar surface habitats (0.166g) and Martian outposts (0.38g) struggle to assess how orbital microgravity test data applies to reduced-gravity exploration environments with hypoxic, low-pressure atmospheres (e.g. 34% O₂ at 56 kPa).

---

## 3. The FlameSafe AI Solution
**FlameSafe AI** is an AI-powered scientific intelligence platform designed to transform complex NASA microgravity combustion research into accessible, structured, searchable, comparable, and explainable scientific knowledge.

The platform provides six interconnected capabilities:
- **Module 1 — Mission Intelligence Dashboard**: High-level statistical visibility into indexed investigations, experimental runs, measurements, and scientific flight facilities.
- **Module 2 — NASA Investigation Explorer**: Deep exploration of canonical flight investigations with multi-dimensional filtering by fuel type, gravity regime, flight platform, and research domain.
- **Module 3 — Investigation Comparison Workspace**: Parameter-by-parameter alignment of test configurations (oxygen fraction, chamber pressure, airflow velocity, sensor suites) without false inferences or incompatible unit conflation.
- **Module 4 — Scientific Relevance Ranking**: Multi-factor weighted relevance scoring ($R = 0.30D + 0.25F + 0.20C + 0.15M + 0.10Q$) matching research programs to targeted mission inquiries.
- **Module 5 — Mission Scenario Analyzer**: Interactive evaluation of fire safety envelopes for Spacecraft, Space Stations, Lunar Habitats, Lunar Rovers, Mars Habitats, and Mars Rovers, highlighting verified matches vs critical research gaps.
- **Module 6 — SI Research Assistant**: Evidence-grounded Retrieval-Augmented Generation (RAG) providing verifiable scientific answers linked directly to DOI citations, page numbers, and exact publication excerpts.

---

## 4. Target Investigation Programs
FlameSafe AI indexes five canonical NASA combustion flight research programs:

1. **BASS & BASS-II (Burning and Suppression of Solids)**:
   - Investigates solid polymer (PMMA) and fabric blend flammability in the Microgravity Science Glovebox (MSG) on the ISS. Focuses on concurrent and opposed flame propagation, limiting airflow quench limits (0.8 cm/s), and gaseous suppressant efficacy.
2. **SAFFIRE I, II, III (Spacecraft Fire Safety Experiment)**:
   - Evaluates large-scale material flammability (up to 0.4 m $\times$ 1.0 m samples) in uncrewed Cygnus resupply vehicles after ISS departure. Provides critical vehicle-scale flame propagation and post-burn smoke persistence data.
3. **FLEX & FLEX-2 (Flame Extinguishment Experiment)**:
   - Evaluates spherical droplet burning (n-heptane, decane) and radiative extinction in the Combustion Integrated Rack (CIR). Led to the breakthrough discovery of low-temperature "cool flame" burning regimes.
4. **SAME & SAME-R (Smoke Aerosol Measurement Experiment)**:
   - Characterizes smoke particulate size distributions (0.35–0.45 microns vs 0.05–0.15 microns in 1g) and Brownian agglomeration produced by overheated wiring insulation in microgravity.
5. **ACME & CFI-G (Advanced Combustion via Microgravity Experiments / Confined Combustion)**:
   - Isolates laminar gaseous diffusion flames in microgravity to understand soot reduction, flame stabilization, and electric field interactions.

---

## 5. User Personas
- **Aerospace Systems Engineers**: Evaluating cabin materials, fire barrier configurations, and emergency ventilation cutoff protocols for exploration spacecraft.
- **Space Habitat Environmental Control (ECLSS) Designers**: Determining ventilation flow rates, particulate filtration requirements, and hypoxic atmosphere limits for lunar and Martian habitats.
- **Combustion Scientists & Researchers**: Identifying literature gaps, comparing experimental runs across flight facilities, and discovering empirical data for kinetic modeling.
- **Mission Safety Officers**: Assessing operational fire risks during anomalous equipment overheating scenarios.

---

## 6. Official Disclaimer
FlameSafe AI is an independent open-source hackathon project developed in response to the 2026 NASA Space Apps Challenge. The system is not certified by, officially endorsed by, or partnered with NASA.
