import { extract, always, actions } from '@antithesishq/bombadil'
export * from '@antithesishq/bombadil/defaults'

// Always offer a Wait action so bombadil doesn't crash when the SPA
// hasn't rendered yet (no clickable elements on first state capture).
export const waitForRender = actions(() => ['Wait'])

// The console should never show an unhandled error boundary page.
const hasErrorBoundary = extract(
  (state) => state.document.body.textContent?.includes('Something went wrong') ?? false
)

export const noErrorBoundary = always(() => !hasErrorBoundary.current)
