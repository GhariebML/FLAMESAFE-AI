# FlameSafe AI — Product Design Roadmap

## Phase 1: Aerospace Design System & Shell (Completed)
- **Task ID:** `PD-01`
- **Owner:** Developer A / UI Lead
- **Priority:** P0
- **Dependencies:** `docs/PRODUCT_DESIGN_STRATEGY.md`
- **Files Affected:** `frontend/tailwind.config.ts`, `frontend/styles/design-tokens.css`, `frontend/lib/design-system/tokens.ts`, `frontend/components/ui/*`, `frontend/components/layout/{Navbar,Sidebar,AppShell}.tsx`
- **Acceptance Criteria:** Cohesive `#071525` Deep Space Navy & `#0D2035` Midnight Blue palette, accessible focus indicators, mobile navigation drawer verified at `360px` and `390px` viewports with zero horizontal overflow.

## Phase 2: Scientific Visualizations & Core Explorer Transformation (Completed)
- **Task ID:** `PD-02`
- **Owner:** Developer A
- **Priority:** P1
- **Dependencies:** `PD-01`, `BE-02`
- **Files Affected:** `frontend/app/{dashboard,investigations,compare,insights,scenarios,assistant,evidence}/page.tsx`, `frontend/components/{dashboard,investigations,comparison,scenarios,assistant}/*`
- **Acceptance Criteria:** Real Recharts charts (`BarChart`, `PieChart`, `RadarChart`) rendered with units, loading states, and disclaimers; URL SearchParams persistence in Explorer; CSV/JSON comparison export; Evidence Center at `/evidence`.

## Phase 3: Accessibility, UX Polish & Extended Analytics (Next Sprint)
- **Task ID:** `PD-03`
- **Owner:** Developer A
- **Priority:** P2
- **Dependencies:** `PD-02`
- **Files Affected:** `frontend/components/ui/`, `frontend/tests/`
- **Acceptance Criteria:** Keyboard accessibility audit (`Tab`/`Escape` drawer navigation), automated Playwright viewport checks at `360px`–`1920px`, and PDF/Markdown printable scenario gap summary export.
