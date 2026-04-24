// Pin to the current page's form; no history navigation at all. Sidebar
// `clicks` can still carry bombadil off the page (see NOTES.md) — that's
// intrinsic to the app layout.
import { weighted } from '@antithesishq/bombadil'
import { clicks, inputs, scroll, waitOnce } from '@antithesishq/bombadil/defaults/actions'

export * from './spec-shared.ts'

export const defaultActions = weighted([
  [8, inputs],
  [3, clicks],
  [1, scroll],
  [1, waitOnce],
])
