# FlameSafe AI — Orbital Research Experience & Design System Specification

## 1. Phase 0 — Comprehensive Website Audit

### 1.1 Route-by-Route Audit Summary

| Route | What Works Well | Visual / UX Issues Identified | Scientific Integrity & Functional Fixes Required |
| :--- | :--- | :--- | :--- |
| **Homepage (`/`)** | Strong hero presence with realistic Astro-Flame mascot over Earth horizon; fast navigation launchpad. | Previously lacked dedicated sections for **Earth Applications (Technology Transfer)** and **Research Gaps**. | Keep hero concise (1 primary CTA + 1 secondary CTA); add structured scientific sections for NASA Research, Datasets, AI Research, Safety Implications, **Earth Applications**, and **Research Gaps**. |
| **Mission Control (`/dashboard`)** | Live connection to `/api/v1/overview`, domain breakdown, fuel category chart, and recent verified sources. | "Explorer Level 1" and gamified achievement badges feel like a video game rather than a research command center; repeats the mascot image in a large box. | Replace fictional XP/levels with real research progress milestones: Indexed Investigations, Experimental Runs, Measurements, Peer-Reviewed Documents, Datasets, and Active Research Requests. |
| **Investigations (`/investigations`)** | Persisted URL query filters, cards/table toggle, DOI links, and run/document counts. | Large mascot box at the top takes up vertical space needed for the scientific catalog. | Replace decorative mascot header with a compact scientific catalog header and distinct visual thumbnails per campaign (`BASS`, `SAFFIRE`, `FLEX`, `SAME`, `ACME`). |
| **AI Lab (`/research`)** | Full 11-agent LangGraph execution trace, human-in-the-loop approval gate, Parquet dataset builder, and Gemini runtime telemetry. | 1) Previously hit HTTP 404 when calling stale port `8000` instead of `8001`. 2) Top diagram used fictional nicknames ("Memory Specialist") and static "11 Agents Online" badge instead of canonical `AGENT_01`–`AGENT_11` identities and real run states. | 1) Resolved 404 via `normalizeBaseUrl` + automatic port failover in `client.ts`. 2) Display canonical `AGENT_01`–`AGENT_11` names and bind status pills to actual `activeRequest.agent_runs` and `aiStatus`. |
| **Data Observatory (`/compare`)** | Side-by-side parameter comparison matrix, CSV/JSON export, and gravity regime selector. | Displaying `Lunar Gravity (0.16G)` alongside `On Earth (1G)` and `In Space (0G)` without provenance badges could mislead researchers into thinking `0.16G` is direct ISS flight data. | Add explicit scientific provenance classifications: **Measured Baseline (1g)**, **Measured ISS Flight Data (~0g)**, and **Extrapolated Partial-Gravity Scenario (0.16g Lunar — Gap Area)**; replace repeated mascot window with a scientific coordinate diagram. |
| **Decision Lab (`/scenarios`)** | 6-environment habitat selector, atmospheric condition inputs, and backend `/api/v1/scenarios/analyze` integration. | Top interactive box computed a heuristic percentage labeled `"Fire Risk % Index"`, which could be mistaken for a calibrated probabilistic fire-risk model. | Rename and reframe as **Atmospheric Boundary & Condition Sensitivity Explorer** paired with the backend's **Evidence Coverage & Extrapolation Assessment**, explicitly stating that it measures literature coverage and regime proximity rather than calibrated ignition probability. |
| **Insights (`/insights`)** | Transparent multi-factor relevance formula ($R = 0.30D + 0.25F + 0.20C + 0.15M + 0.10Q$) and Recharts visualization. | Repeated mascot shield image at the top; long-reading cards need a quieter, high-contrast obsidian surface. | Replace repeated mascot banner with a clean scientific header explaining the 5-factor relevance score vs. measurement completeness. |
| **Evidence (`/evidence`)** | Full citation provenance, DOI links, embedding model attribution, and JSON report export. | Previously showed `SOURCES CATALOG UNAVAILABLE (404)` when calling stale port `8000`; repeated mascot image in header. | Fixed `/api/v1/sources` & `/api/v1/sources/catalog` integration; refine into a quiet, researcher-first document and citation vault. |
| **Global AI Companion** | `/assistant` route exists as a standalone page. | Researchers had to leave their current page (`/investigations`, `/compare`, `/scenarios`) to ask a question. | Implement persistent global **ASTRO-FLAME** floating companion launcher + chat drawer across all routes, wired to real `AIService` (`POST /api/v1/assistant/query`) with citations and Arabic/English RTL/LTR support. |

---

## 2. Official Brand & Color System (Obsidian + Flame Orange)

FlameSafe AI uses a dark charcoal obsidian foundation (`#080A0F`) rather than pure `#000000` to prevent halation and eye strain during extended scientific analysis, paired with intentional **Flame Orange (`#FF6B24`)** and **Orbit Cyan (`#39B9EB`)** accents.

### 2.1 Core Palette & Semantic Tokens

| Semantic Token | CSS Variable | Hex Value | Role & Usage Guidelines |
| :--- | :--- | :--- | :--- |
| **Obsidian Background** | `--bg-obsidian` / `--bg-canvas` | `#080A0F` | Primary deep-space page canvas across all routes. |
| **Primary Surface** | `--bg-surface` | `#10151D` | Standard scientific cards, tables, and workspace panels. |
| **Secondary Surface** | `--bg-elevated` | `#151D27` | Nested containers, filter bars, and secondary panels. |
| **Elevated Surface** | `--bg-glass` | `#1C2633` | Floating modals, dropdowns, active cards, and Astro-Flame chat window. |
| **Primary Text** | `--fg-primary` | `#F7F7F5` | Headings, primary data values, and body reading copy. |
| **Secondary Text** | `--fg-secondary` | `#A1A8B3` | Supporting descriptions, table labels, and subtitles. |
| **Muted Text** | `--fg-muted` | `#8A96A6` | Technical metadata, timestamps, and axis labels (tuned for $\ge 4.5:1$ contrast). |
| **Primary Flame Orange** | `--accent-flame` | `#FF6B24` | Primary CTAs, key brand emphasis, and combustion highlights. |
| **Deep Flame** | `--accent-flame-deep` | `#E94B16` | Button hover gradients and active flame accents. |
| **Solar Amber** | `--accent-amber` | `#FFB547` | Warnings, partial-gravity indicators, and flame highlights. |
| **Orbit Cyan** | `--accent-cyan` | `#39B9EB` | Scientific telemetry, active navigation indicators, and verified links. |
| **Research Blue** | `--accent-blue` | `#006EDB` | Secondary interactive controls and structural data series. |
| **Subtle Border** | `--border-subtle` | `#283340` | Default card, table, and input hairlines. |

### 2.2 Calculated WCAG 2.2 Contrast Ratios

All foreground/background pairings have been mathematically verified against WCAG 2.2 Level AA/AAA thresholds:

| Foreground Token | Background Token | Calculated Contrast Ratio | WCAG 2.2 Compliance |
| :--- | :--- | :--- | :--- |
| Primary Text (`#F7F7F5`) | Obsidian Background (`#080A0F`) | **18.1 : 1** | Passes AAA ($\ge 7.0:1$) |
| Primary Text (`#F7F7F5`) | Primary Surface (`#10151D`) | **16.2 : 1** | Passes AAA ($\ge 7.0:1$) |
| Secondary Text (`#A1A8B3`) | Obsidian Background (`#080A0F`) | **8.1 : 1** | Passes AAA ($\ge 7.0:1$) |
| Secondary Text (`#A1A8B3`) | Primary Surface (`#10151D`) | **7.2 : 1** | Passes AAA ($\ge 7.0:1$) |
| Muted Text (`#8A96A6`) | Primary Surface (`#10151D`) | **5.6 : 1** | Passes AA Normal Text ($\ge 4.5:1$) |
| Orbit Cyan (`#39B9EB`) | Primary Surface (`#10151D`) | **8.2 : 1** | Passes AAA ($\ge 7.0:1$) |
| Solar Amber (`#FFB547`) | Primary Surface (`#10151D`) | **10.4 : 1** | Passes AAA ($\ge 7.0:1$) |
| Primary Flame Orange (`#FF6B24`) | Obsidian Background (`#080A0F`) | **6.8 : 1** | Passes AA Normal & Large Text ($\ge 4.5:1$) |
| Obsidian Text (`#080A0F`) | Primary Flame Orange Button (`#FF6B24`) | **6.8 : 1** | Passes AA Normal Text ($\ge 4.5:1$) |
| White Text (`#FFFFFF`) | Deep Flame Badge (`#C83E0B`) | **5.1 : 1** | Passes AA Normal Text ($\ge 4.5:1$) |

---

## 3. Typography & Hierarchy

- **Interface Sans (`--font-sans`)**: `Inter`, system-ui, sans-serif — clean, high x-height legibility for scientific prose, tables, and bilingual (English/Arabic) UI.
- **Technical Monospace (`--font-mono`)**: `JetBrains Mono` / `DM Mono` — used for NASA PSI identifiers (`PSI-BASS-01`), DOIs, SI units (`cm/s`, `kPa`, `% O2`), and agent IDs (`AGENT_01`–`AGENT_11`).

---

## 4. Five-Layer Orbital Environment & Motion System

1. **Layer 1 — Deep Space (`#080A0F`)**: Low-luminance obsidian charcoal foundation.
2. **Layer 2 — Multi-Depth Starfield**: Lightweight HTML5 Canvas rendering 3 depth tiers of stars with slow orbital drift (`0.04–0.12 px/frame`) and subtle pointer parallax.
3. **Layer 3 — Distant Nebula**: Restrained radial gradients of Research Blue (`#006EDB`), Orbit Cyan (`#39B9EB`), and Solar Amber (`#FFB547`) at 4–8% opacity.
4. **Layer 4 — Orbital Signals**: Route-aware SVG/Canvas orbital arcs, coordinate grids (on `/compare`), or quiet document overlays (on `/evidence` and `/insights`).
5. **Layer 5 — High-Contrast Application Surfaces**: `#10151D` and `#151D27` surfaces with `#283340` borders.
6. **Accessibility & Performance**:
   - Honors `prefers-reduced-motion: reduce` by freezing star drift, parallax, and shooting stars.
   - Automatically pauses the Canvas `requestAnimationFrame` loop when `document.hidden` is true.
