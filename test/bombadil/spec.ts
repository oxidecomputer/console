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
import { extract, always, eventually, now } from '@antithesishq/bombadil'
// Cherry-pick defaults: skip noConsoleErrors (console intentionally logs API
// errors) and noHttpErrorCodes (some API calls legitimately 404).
export {
  noUncaughtExceptions,
  noUnhandledPromiseRejections,
} from '@antithesishq/bombadil/defaults/properties'
// waitOnce gives the SPA a tick to render on first state capture (emits Wait
// unless the last action was already Wait).
export {
  waitOnce,
  scroll,
  clicks,
  inputs,
  back,
  forward,
  reload,
  navigation,
} from '@antithesishq/bombadil/defaults/actions'

// --- Extractors ---

const hasErrorBoundary = extract(
  (state) => state.document.body.textContent?.includes('Something went wrong') ?? false
)

const hasNotFound = extract(
  (state) => state.document.body.textContent?.includes('Page not found') ?? false
)

const hasSpinner = extract(
  (state) => state.document.querySelector('[aria-label="Spinner"]') !== null
)

const mainText = extract((state) => {
  const main = state.document.querySelector('main')
  return main?.textContent?.trim() ?? ''
})

const toastCount = extract((state) => {
  const container = state.document.querySelector('[data-testid="Toasts"]')
  return container?.children.length ?? 0
})

// --- Safety properties (must always hold) ---

// The console should never show the error boundary page.
export const noErrorBoundary = always(() => !hasErrorBoundary.current)

// Bombadil only clicks links that exist in the DOM, so it should
// never land on a route that renders the Not Found page.
export const noNotFound = always(() => !hasNotFound.current)

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
  now(() => toastCount.current > 0).implies(
    eventually(() => toastCount.current === 0).within(20, 'seconds')
  )
)
