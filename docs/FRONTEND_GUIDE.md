# Frontend Architecture & Developer Guide — Developer A Handbook

## 1. Overview & Technology Stack
- **Framework**: Next.js 15 (React 19 App Router)
- **Language**: TypeScript (`strict: true`)
- **Styling**: Tailwind CSS
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Client Root**: `frontend/`

---

## 2. Directory Structure & Component Organization
```text
frontend/
├── app/                      # App Router route pages
│   ├── layout.tsx            # Global root layout with AppShell & ErrorBoundary
│   ├── page.tsx              # Landing homepage & mission intro
│   ├── globals.css           # Tailwind base layers & custom scrollbars
│   ├── dashboard/page.tsx    # Module 1: Mission Intelligence Dashboard
│   ├── investigations/page.tsx # Module 2: Investigation Explorer
│   ├── investigations/[id]/page.tsx # Module 2: Investigation Detail Profile
│   ├── compare/page.tsx      # Module 3: Investigation Comparison Workspace
│   ├── scenarios/page.tsx    # Module 5: Mission Scenario Fire Safety Analyzer
│   ├── assistant/page.tsx    # Module 6: SI Research Assistant (RAG Chat)
│   └── insights/page.tsx     # Module 4: Relevance Ranking & Gap Exploration
│
├── components/
│   ├── layout/               # Navbar, Sidebar, Footer, AppShell
│   ├── shared/               # Badge, Button, Card, LoadingSkeleton, EmptyState, ErrorBoundary
│   ├── dashboard/            # MetricsOverview, DomainDistribution, RecentSources
│   ├── investigations/       # InvestigationCard, FilterBar, DetailView
│   ├── comparison/           # ComparisonMatrix, ParameterDelta
│   ├── scenarios/            # EnvironmentSelector, ConditionsForm, GapAnalysisCard
│   ├── assistant/            # ChatInterface, MessageBubble, CitationViewer
│   └── evidence/             # EvidenceCard, ProvenanceBadge
│
├── hooks/                    # Custom React hooks (useInvestigations, useCompare, etc.)
├── lib/
│   ├── api/client.ts         # Centralized typed API client
│   ├── api/endpoints.ts      # REST API route constants
│   ├── constants/            # Space environments, domains, mock data
│   └── utils/                # cn helper, formatters, units
├── types/                    # TypeScript interfaces conforming to API contracts
└── tests/                    # Client and utility tests
```

---

## 3. UI Theme & Design Tokens
FlameSafe AI utilizes a custom space exploration color palette configured in `tailwind.config.ts`:
- **Space Deep Backgrounds**:
  - `bg-space-950` (`#050811`): Deep void background.
  - `bg-space-900` (`#0a1124`): Primary card and container background.
  - `border-space-800` (`#101d3b`): Subtle border separators.
- **Flame Combustion Highlights**:
  - `text-flame-500` (`#f97316`): Active buttons, highlights, primary badges.
  - `bg-flame-500/15`: Subtle combustion accent backgrounds.
- **Plasma & Cool Flame Highlights**:
  - `text-plasma-400` (`#22d3ee`): Droplet, cryogenic, and secondary physics badges.

---

## 4. Centralized API Integration (`lib/api/client.ts`)
Developer A should **NEVER** write raw `fetch` calls directly inside UI components. All API communication must route through `apiClient`:

```typescript
import { apiClient } from "@/lib/api/client";

// Example: Fetching investigations with filters
const response = await apiClient.getInvestigations({
  query: "BASS",
  research_area: "Solid Fuel Flammability & Suppression",
  page: 1,
  page_size: 10,
});
console.log(response.items, response.total);
```

### Automatic Fallback Behavior
If the backend is temporarily offline during frontend development, `useInvestigations` automatically falls back to curated NASA sample data in `lib/constants/mockData.ts`, enabling Developer A to design and test layouts without backend blockers.

---

## 5. UI Best Practices for Developer A
1. **Never Coerce Missing Metrics to Zero**:
   If an experimental run did not record oxygen concentration, display `"Not recorded"` or `"N/A"`, **never** `"0.0% O2"`. Use the helper functions in `lib/utils/units.ts` (`formatPressure`, `formatVelocity`, `formatOxygen`).
2. **Display Verified DOI Links**:
   Whenever a scientific document or investigation provides a DOI, link directly to `https://doi.org/${doi}` with target `_blank` and an external link icon.
3. **Responsive Design**:
   Ensure all tables and multi-column comparison grids render gracefully on both desktop and mobile viewports using horizontal overflow containers (`overflow-x-auto`).
