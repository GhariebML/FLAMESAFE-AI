# FlameSafe AI — UI/UX & Dual-Theme (White / Black Mode) Engineering Specification

## 1. Open-Source GitHub Design References
1. **[nasa/openmct](https://github.com/nasa/openmct)** (*NASA Open Mission Control Technologies*): Pairs the **Espresso** low-light dark telemetry theme with the **Snow** high-contrast light laboratory theme for glare-heavy control rooms, projectors, and academic publication cross-referencing.
2. **[pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)**: Zero-flash SSR/CSR theme synchronization on `<html class="light|dark" data-theme="light|dark" suppressHydrationWarning>`, `localStorage` persistence, and system preference tracking.
3. **[shadcn-ui/ui](https://github.com/shadcn-ui/ui)**: Semantic CSS custom property tokens bridged to Tailwind CSS (`darkMode: "class"`) using RGB channel triplets (`rgb(var(--space-950) / <alpha-value>)`) so all opacity modifiers work identically across White and Black modes.

---

## 2. Root Causes Identified in Current Frontend Codebase
- `frontend/app/layout.tsx`: Hardcodes `<html lang="en" className="dark">`.
- `frontend/tailwind.config.ts`: Lacks `darkMode: "class"` and uses static hex strings for `space.950`–`space.600`.
- `frontend/styles/design-tokens.css` & `frontend/app/globals.css`: Define only dark tokens (`#071525`, `#0D2035`) and hardcode dark `body` and scrollbar colors.
- Layout, shared UI components, and pages (`AppShell.tsx`, `Navbar.tsx`, `Sidebar.tsx`, `ChartContainer.tsx`, `Card.tsx`, `Badge.tsx`, etc.) use hardcoded `text-white` and `text-slate-100..400`.
- Recharts components (`DomainDistribution.tsx`, `ComparisonMatrix.tsx`, `insights/page.tsx`) pass static dark hex values to grid lines, axis ticks, and tooltips.

---

## 3. Dual-Theme Token Specification

| Token / Utility | CSS Custom Property | Black Mode (`.dark` — Mission Control) | White Mode (`:root` — Cleanroom Lab) |
| :--- | :--- | :--- | :--- |
| `bg-space-950` (App Canvas) | `--space-950` | `#071525` (`7 21 37`) | `#F8FAFC` (`248 250 252`) |
| `bg-space-900` (Card / Panel) | `--space-900` | `#0D2035` (`13 32 53`) | `#FFFFFF` (`255 255 255`) |
| `bg-space-800` / `border-space-800` | `--space-800` | `#152C47` (`21 44 71`) | `#E2E8F0` (`226 232 240`) |
| `bg-space-700` / `border-space-700` | `--space-700` | `#1E3A5F` (`30 58 95`) | `#CBD5E1` (`203 213 225`) |
| `bg-space-600` | `--space-600` | `#2B5282` (`43 82 130`) | `#94A3B8` (`148 163 184`) |
| `text-fg-primary` | `--text-primary` | `#F8FAFC` | `#0F172A` |
| `text-fg-secondary` | `--text-secondary` | `#CBD5E1` | `#334155` |
| `text-fg-muted` | `--text-muted` | `#94A3B8` | `#475569` |

---

## 4. Implementation Phases
1. **Phase 1**: Theme Engine (`ThemeProvider.tsx`), dual-mode CSS variables (`styles/design-tokens.css`, `app/globals.css`), and Tailwind RGB variable bridge (`tailwind.config.ts`).
2. **Phase 2**: Segmented White/Black/Auto `ThemeToggle.tsx` (`Alt+T` shortcut) in `Navbar.tsx`, plus theme-adaptive `AppShell.tsx`, `Sidebar.tsx`, and `Footer.tsx`.
3. **Phase 3**: Shared UI primitives (`Card`, `Badge`, `MetricCard`, `ChartContainer`, `UncertaintyBanner`, `Tabs`, `SearchInput`) contrast tuning.
4. **Phase 4**: `useChartTheme()` hook in `lib/design-system/useChartTheme.ts` wired into Recharts across `/dashboard`, `/compare`, and `/insights`.
5. **Phase 5**: Page-by-page typography & surface refinement across `/dashboard`, `/investigations`, `/investigations/[id]`, `/compare`, `/insights`, `/scenarios`, `/assistant`, and `/evidence`.
6. **Phase 6**: Unit test verification (`tests/formatters.test.js`), `npx tsc --noEmit`, `npm run build`, and live Chrome preview in both White and Black modes.
