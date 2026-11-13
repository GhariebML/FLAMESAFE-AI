# FlameSafe AI — Engineering Quality Gate

Before any feature branch is merged into `integration` or `main`, all five quality gates below must pass.

## 1. Backend Quality Gate (`backend/`)
- **Linter:** `ruff check .` (0 errors)
- **Test Suite:** `python -m pytest -v` (100% pass rate with `USE_SQLITE_FALLBACK=true AI_PROVIDER=mock EMBEDDING_PROVIDER=mock`)
- **Schema Integrity:** All Pydantic v2 schemas validate cleanly; `null` physical measurements remain `Optional[float] = None`.

## 2. Frontend Quality Gate (`frontend/`)
- **TypeScript Compiler:** `npx tsc --noEmit` (0 errors)
- **Unit Tests:** `npm test` (`node --test tests/*.test.js` must exit `0` with no masked failures)
- **Production Build:** `npm run build` (must compile all App Router routes including dynamic routes and `Suspense` boundaries)

## 3. Responsive & Accessibility Gate
- Viewport verification at `360px`, `390px`, `768px`, `1024px`, `1440px`, and `1920px`:
  - Zero horizontal page overflow (`overflow-x: hidden` on shell, scrollable tables inside cards).
  - Mobile drawer navigation functional below `768px`.
  - Visible keyboard focus rings (`*:focus-visible`) and `prefers-reduced-motion` honored.

## 4. Scientific Integrity Gate
- Zero fabricated NASA PSI IDs, DOIs, or physical measurements.
- `RelevanceScorer` returns explicit disclaimer that scores are research alignment, not fire-risk probability.
- `ScenarioService` and `AIService` include partial-gravity scaling advisories whenever Lunar (`0.166g`) or Mars (`0.38g`) contexts are queried.
- Demo/Mock modes (`is_mock_provider`, `isUsingFallback`) are visibly labeled in the UI.

## 5. Git & Secret Safety Gate
- No `.env`, API keys, credentials, or raw bulk `.pdf` downloads committed.
- Target branches follow `feature/* -> integration -> main`; no force pushes.
