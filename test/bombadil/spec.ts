// Bombadil spec. To run:
//
//   1. In one terminal, start the mock Nexus API at :12220:
//        npx tsx tools/start_mock_api.ts
//   2. In another terminal, build & serve with the Nexus proxy enabled
//      (the MSW service worker does not register inside Bombadil's browser,
//      so we hit a real HTTP mock instead of MSW in-browser):
//        API_MODE=nexus npm run build && npx vite preview --port 4174
//   3. Run the test:
//        npm run bombadil
//
// Why not MSW: Bombadil's browser does not register service workers, so
// `setupWorker().start()` never resolves and React never mounts. See:
//   https://github.com/antithesishq/bombadil/issues/98
//   https://github.com/antithesishq/bombadil/issues/105
import { extract, always, eventually, next, now, weighted } from '@antithesishq/bombadil'
import {
  back,
  clicks,
  forward,
  inputs,
  navigation,
  reload,
  scroll,
  waitOnce,
} from '@antithesishq/bombadil/defaults/actions'
// Cherry-pick defaults: skip noConsoleErrors (console intentionally logs API
// errors) and noHttpErrorCodes (some API calls legitimately 404).
export {
  noUncaughtExceptions,
  noUnhandledPromiseRejections,
} from '@antithesishq/bombadil/defaults/properties'

// Named action-weight profiles. Select one per run with
// `BOMBADIL_PROFILE=<name>`; defaults to `balanced`. Add new profiles here
// (not inline in shell) so they're versioned and show up in `git log`.
//
// Background: bombadil's `inputs` generator is a no-op when no focusable
// input is on screen, so high `inputs` weight only takes effect on forms
// and is effectively no-op elsewhere. History actions (`back`, `forward`,
// `reload`) chew up run time without growing coverage and can race with
// background polling, so most profiles keep them at 0.
type Weights = {
  inputs: number
  clicks: number
  navigation: number
  scroll: number
  back: number
  forward: number
  reload: number
  waitOnce: number
}

const profiles = {
  // Round-1 mix. Balanced exploration with some history churn.
  balanced: {
    inputs: 5,
    clicks: 3,
    navigation: 2,
    scroll: 1,
    back: 1,
    forward: 1,
    reload: 1,
    waitOnce: 1,
  },
  // Force form completion on a form-heavy start URL. Zero history churn so
  // bombadil can't abandon the form mid-fill.
  'form-heavy': {
    inputs: 8,
    clicks: 4,
    navigation: 1,
    scroll: 0,
    back: 0,
    forward: 0,
    reload: 0,
    waitOnce: 1,
  },
  // Pin to the current page's form; no navigation at all.
  'form-pinned': {
    inputs: 8,
    clicks: 3,
    navigation: 0,
    scroll: 1,
    back: 0,
    forward: 0,
    reload: 0,
    waitOnce: 1,
  },
  // Row-actions + menus page; probes `menuSurvivesWait` and polling races.
  menus: {
    inputs: 2,
    clicks: 6,
    navigation: 2,
    scroll: 0,
    back: 0,
    forward: 0,
    reload: 0,
    waitOnce: 4,
  },
  // Heavy navigation to escape subtree lock-in seen in round-1 baseline.
  breadth: {
    inputs: 3,
    clicks: 3,
    navigation: 8,
    scroll: 0,
    back: 1,
    forward: 0,
    reload: 1,
    waitOnce: 1,
  },
  // Moderate mix with a little `forward` to revisit freshly-created resources.
  'create-and-revisit': {
    inputs: 5,
    clicks: 5,
    navigation: 2,
    scroll: 1,
    back: 0,
    forward: 1,
    reload: 0,
    waitOnce: 1,
  },
} as const satisfies Record<string, Weights>

export type ProfileName = keyof typeof profiles

const profileName: ProfileName = (() => {
  const raw = process.env.BOMBADIL_PROFILE
  if (raw && raw in profiles) return raw as ProfileName
  if (raw) console.warn(`unknown BOMBADIL_PROFILE=${raw}; using 'balanced'`)
  return 'balanced'
})()

const w = profiles[profileName]
console.info(`bombadil profile: ${profileName}`, w)

export const actionMix = weighted([
  [w.inputs, inputs],
  [w.clicks, clicks],
  [w.navigation, navigation],
  [w.scroll, scroll],
  [w.back, back],
  [w.forward, forward],
  [w.reload, reload],
  [w.waitOnce, waitOnce],
])

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
