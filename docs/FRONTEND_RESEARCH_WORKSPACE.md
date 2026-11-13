# FlameSafe AI — Frontend Research Intelligence Workspace (`/research`)

## 1. Workspace Architecture

The **Research Intelligence Workspace** (`frontend/app/research/page.tsx`) provides a single, cohesive Mission Control / Cleanroom Lab interface for interacting with the 11-Agent Scientific Data Intelligence System.

---

## 2. The 8 Interactive Panels

1. **Panel A — Natural-Language Research Request**:
   - Multi-line scientific query composer, 4 one-click NASA benchmark prompts, Human-in-the-Loop approval gate toggle (`require_approval`), NASA PSI discovery toggle (`force_psi_discovery`), and recent run selector.
2. **Panel B — Parsed Intent & Local Coverage Preview (Agents 02 & 03)**:
   - Displays decomposed scientific domain, target campaigns, editable fuel material and gravity regime inputs, variables of interest, local database coverage classification, and a **Revise Scientific Intent & Re-Run Workflow** button.
3. **Panel C — 11-Agent Activity Monitor & LangGraph Trace (Agent 01)**:
   - Real-time status cards for `AGENT_01` through `AGENT_11` showing completion state, role description, and exact tools invoked.
4. **Panel D — NASA PSI Catalog Discovery (Agent 04)**:
   - Displays matched campaigns across the 11-campaign NASA PSI catalog with relevance score badges, ISS/Cygnus facility attribution, and DOI links.
5. **Panel E — Smart File Selection & Human Approval Gate (Agents 05 & 06)**:
   - Displays each candidate file's $F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A$ score breakdown ($Q, T, C, P, A$), selection rationale, interactive checkboxes, and `Approve & Acquire`, `Apply Modified Selection`, and `Reject Run` governance controls when paused at `AWAITING_APPROVAL`.
6. **Panel F — Dataset Construction & Validation KPIs (Agents 07–10)**:
   - Displays dataset key, version tag (`v1.0.0`), SHA-256 content fingerprint, validation gate status, verified row count, provenance coverage percentage, and strict null-handling confirmation.
7. **Panel G — Canonical Dataset Explorer & Multi-Format Export**:
   - Interactive table of normalized experimental measurements with one-click `.JSON`, `.CSV`, and `.PARQUET` download buttons.
8. **Panel H — Evidence-Grounded Research Synthesis (Agent 11)**:
   - Displays the synthesized answer, AI provider badge, quantitative parameter min/mean/max cards, verified DOI/page citations, and scientific uncertainty notes.
