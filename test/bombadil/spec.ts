import { extract, always, eventually, now, actions } from '@antithesishq/bombadil'
// Cherry-pick defaults: skip noConsoleErrors because the console
// intentionally logs API errors to console.error for debugging.
export {
  noUncaughtExceptions,
  noUnhandledPromiseRejections,
} from '@antithesishq/bombadil/defaults/properties'
export {
  scroll,
  clicks,
  inputs,
  back,
  forward,
  reload,
  navigation,
} from '@antithesishq/bombadil/defaults/actions'

// Always offer a Wait action so bombadil doesn't crash when the SPA
// hasn't rendered yet (no clickable elements on first state capture).
export const waitForRender = actions(() => ['Wait'])

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

const dialogOpen = extract(
  (state) => state.document.querySelector('.ox-side-modal') !== null
)

const currentUrl = extract((state) => state.navigationHistory.current.url)

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

// If a side modal is open and the URL changes, the modal should close
// within 2s. Catches orphaned modals from route transitions.
export const noOrphanedModals = always(() => {
  const wasOpen = dialogOpen.current
  const wasUrl = currentUrl.current
  return now(() => wasOpen).implies(
    now(() => currentUrl.current !== wasUrl).implies(
      eventually(() => !dialogOpen.current).within(2, 'seconds')
    )
  )
})
