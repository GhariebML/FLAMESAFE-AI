# Scientific Integrity & Ethics Charter — FlameSafe AI

## 1. Core Commitment to Scientific Rigor
FlameSafe AI is an academic and intelligence platform operating at the intersection of AI and human life-safety in space. In fire safety engineering, inaccurate assumptions or fabricated conclusions can lead to catastrophic mission failure.

Every team member, developer, algorithm, and prompt in FlameSafe AI must adhere strictly to the principles defined in this document.

---

## 2. Six Levels of Scientific Information
The platform must explicitly distinguish between six categories of data across all UI views and API payloads:

1. **Verified Empirical Data**: Direct sensor measurements recorded during physical orbital flight tests (e.g. thermocouple traces, radiometer heat flux readings, high-speed camera flame spread velocities).
2. **Published Peer-Reviewed Findings**: Analytical conclusions, physical models, and chemical mechanism inferences authored by principal investigators in peer-reviewed scientific literature.
3. **AI-Generated Synthesis**: Answers synthesized by Large Language Models based strictly on retrieved research evidence chunks.
4. **Analytical Extrapolations**: Mathematical scalings (e.g. pressure corrections, Grashof number buoyancy scalings) projecting microgravity behavior into partial-gravity regimes.
5. **Missing or Unavailable Evidence**: Explicit documentation of unmeasured variables, uninstrumented parameters, or conditions for which no flight data exists.
6. **Future Research Recommendations**: Identified scientific knowledge gaps requiring future microgravity or parabolic flight experiments.

---

## 3. Strict Prohibitions

### Rule 1: No Synthetic Measurements
- Developers, seed scripts, and AI generators must **NEVER** fabricate experimental measurement numbers.
- If an experimental run in NASA PSI did not measure flame length or extinction time, the metric value must remain `null`.

### Rule 2: Never Fill Missing Values with Zero
- A value of `0.0` has distinct physical meaning in combustion science (e.g., $0.0\text{ cm/s}$ implies purely diffusive quiescent transport; $0.0\%\text{ O}_2$ implies a totally inert atmosphere).
- Coercing missing or unrecorded metrics to zero corrupts data analysis and will invalidate model comparisons.
- Missing values must always be represented as `null` / `None` / `"Not recorded"`.

### Rule 3: Relevance Score $\neq$ Fire-Risk Probability
- The scientific relevance ranking score ($R = 0.30D + 0.25F + 0.20C + 0.15M + 0.10Q$) is an informational research alignment index indicating how closely an investigation matches an inquiry.
- It **DOES NOT** represent a physical probability of ignition, a material flammability clearance, or a quantitative fire-risk calculation.
- Every relevance ranking output must display the official scientific disclaimer.

### Rule 4: Microgravity $\neq$ Partial Planetary Gravity
- Orbital microgravity ($\sim 10^{-6}\text{ g}$) tests aboard the ISS or Cygnus operate in the complete absence of natural buoyant convection.
- Lunar surface gravity ($0.166\text{ g}$) and Martian surface gravity ($0.38\text{ g}$) produce significant residual buoyancy that alters flame attachment, upward spread, and plume dynamics.
- The system must **NEVER** claim that microgravity test results directly predict lunar or Martian fire behavior without explicit partial-gravity qualification and documentation of analytical uncertainty.

### Rule 5: No Fabricated Citations or DOIs
- The SI Assistant must **NEVER** hallucinate scientific papers, authors, journal names, or DOIs.
- Citations must be generated exclusively from indexed, authentic NASA PSI and NTRS documents.
- If retrieved evidence is insufficient to answer an inquiry, the system must invoke the **Abstention Protocol** and declare insufficient evidence.

### Rule 6: Scenario Outputs Are Not Safety Certifications
- The Mission Scenario Analyzer provides exploratory research synthesis.
- Outputs must be clearly labeled as informational research guides and not as certified spacecraft fire safety simulations or NASA flight waivers.
