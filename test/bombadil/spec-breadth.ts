// Broad URL coverage. In bombadil, `clicks` drives real URL navigation
// (sidebar, breadcrumbs, row links), so bump it heavily rather than
// `navigation` (which is a back/forward/reload composite, not URL nav).
import { weighted } from '@antithesishq/bombadil'
import { clicks, inputs, waitOnce } from '@antithesishq/bombadil/defaults/actions'

export * from './spec-shared.ts'

export const defaultActions = weighted([
  [3, inputs],
  [10, clicks],
  [1, waitOnce],
])
