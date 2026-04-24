// Shared extractors and safety/liveness properties for the bombadil specs.
// Each profile has its own spec file (spec.ts, spec-form-heavy.ts, etc.)
// that re-exports from here via `export *` and adds an `actionMix` built
// from a chosen profile.
//
// Only exports compatible with bombadil's spec contract (properties and
// related) live here — the profiles + `makeActionMix` helper are in
// profiles.ts, imported explicitly by each spec file, so they don't leak
// into the re-exports.
import { extract, always, eventually, next, now } from '@antithesishq/bombadil'

// Cherry-pick defaults: skip noConsoleErrors (console intentionally logs API
// errors) and noHttpErrorCodes (some API calls legitimately 404).
export {
  noUncaughtExceptions,
  noUnhandledPromiseRejections,
} from '@antithesishq/bombadil/defaults/properties'

// --- Extractors ---

const hasErrorBoundary = extract(
  (state) => state.document.body.textContent?.includes('Something went wrong') ?? false
)

const hasNotFound = extract(
  (state) => state.document.body.textContent?.includes('Page not found') ?? false
)

// `/login` is served by the Nexus backend in prod but has no SPA route, so
// `hasNotFound` fires on it under `API_MODE=nexus`. Sign out navigates there
// via `navToLogin` in app/api/nav-to-login.ts. Not a real bug; exempt the path.
const atLoginPath = extract((state) => {
  try {
    return new URL(state.navigationHistory.current.url).pathname === '/login'
  } catch {
    return false
  }
})

const hasSpinner = extract(
  (state) => state.document.querySelector('[aria-label="Spinner"]') !== null
)

const mainText = extract((state) => {
  const main = state.document.querySelector('main')
  return main?.textContent?.trim() ?? ''
})

const toastTexts = extract((state) => {
  const container = state.document.querySelector('[data-testid="Toasts"]')
  if (!container) return []
  return Array.from(container.children).map((el) => el.textContent?.trim() ?? '')
})

const menuOpen = extract((state) => state.document.querySelector('[role="menu"]') !== null)

const lastActionWasWait = extract((state) => state.lastAction === 'Wait')

// --- Safety properties (must always hold) ---

// The console should never show the error boundary page.
export const noErrorBoundary = always(() => !hasErrorBoundary.current)

// Bombadil only clicks links that exist in the DOM, so it should
// never land on a route that renders the Not Found page. Exempt `/login`,
// which is backend-served in prod but has no SPA route.
export const noNotFound = always(() => !hasNotFound.current || atLoginPath.current)

// --- Liveness properties (things that must eventually happen) ---

// If a spinner is visible, the page should finish loading within 10s.
// Catches stuck loaders, failed fetches that don't surface errors,
// and race conditions in route transitions.
export const loadingResolves = always(
  now(() => hasSpinner.current).implies(
    eventually(() => !hasSpinner.current).within(10, 'seconds')
  )
)

// The main content area should always eventually have content.
// A blank main area for more than 5s indicates a render failure.
export const mainContentAppears = always(
  eventually(() => mainText.current.length > 0).within(5, 'seconds')
)

// Toasts auto-dismiss: success after 5s, error after 15s. If toasts
// are on screen, they should all be gone within 20s.
export const toastsClear = always(
  now(() => toastTexts.current.length > 0).implies(
    eventually(() => toastTexts.current.length === 0).within(20, 'seconds')
  )
)

// No two toasts with identical text should be visible simultaneously.
// Targets bug class from console#3167 (double error toasts when both
// `onError` and a confirm-modal catch fire for the same mutation). Since
// bombadil clicks consume their target resource, legitimate same-text
// toasts shouldn't stack.
export const noDuplicateToasts = always(() => {
  const texts = toastTexts.current
  return new Set(texts).size === texts.length
})

// If a dropdown menu is open and the next step is a Wait (no user
// interaction), the menu should still be open. Background polling or
// unrelated re-renders shouldn't close open menus. Targets bug class
// from console#2618 (instance disk menus closing on poll).
export const menuSurvivesWait = always(
  now(() => menuOpen.current).implies(
    next(() => !lastActionWasWait.current || menuOpen.current)
  )
)
