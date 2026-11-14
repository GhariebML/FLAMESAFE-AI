# Scientific Integrity & Data Provenance Policy

FlameSafe AI is an independent scientific intelligence platform built for the **NASA Space Apps Challenge 2026** using publicly available NASA Physical Sciences Informatics (PSI) and NASA Technical Reports Server (NTRS) resources. **No official NASA endorsement, sponsorship, or certification is implied.**

## Core Scientific Rules

1. **Zero Fabricated Measurements:** Missing or unrecorded experimental parameters are preserved as `null` (`Not recorded` in the UI). They are never interpolated or coerced to zero.
2. **Traceable Provenance:** Every extracted measurement and RAG evidence chunk retains its `Investigation` acronym, `source_record_id`, `ResearchDocument` DOI/URL, and document page/section reference.
3. **Observation vs. Extrapolation:**
   - **Exact / Direct Match:** Conditions fall within documented ISS/Cygnus microgravity (`~0g`) or terrestrial (`1g`) experimental bounds.
   - **Analogous Range / Partial Match:** Nearby parameter space with explicit boundary caveats.
   - **Extrapolated Regime:** Partial-gravity scenarios such as Lunar (`0.166g`) and Martian (`0.38g`) habitats where direct flight data is sparse or absent—always flagged with an `UncertaintyBanner`.
4. **Heuristic Indicators Are Not Calibrated Probabilities:** Decision Lab's `Condition Sensitivity Indicator` (`frontend/app/scenarios/page.tsx`) and `RelevanceScorer` (`backend/app/ranking/scoring.py`) quantify relative parameter distance and multi-factor catalog relevance, **not** calibrated fire ignition probabilities.
5. **Abstention Protocol:** When retrieved evidence falls below `SIMILARITY_THRESHOLD` (`0.65`) or lacks empirical support, the RAG assistant explicitly states the evidence gap rather than speculating.
