// Force form completion on a form-heavy start URL. Zero history churn
// (no `navigation`/`back`/`forward`/`reload`) so bombadil can't abandon
// the form mid-fill. URL navigation, if any, happens through `clicks` on
// sidebar links.
import { weighted } from '@antithesishq/bombadil'
import { clicks, inputs, waitOnce } from '@antithesishq/bombadil/defaults/actions'

export {
  noUncaughtExceptions,
  noUnhandledPromiseRejections,
  noErrorBoundary,
  noNotFound,
  loadingResolves,
  mainContentAppears,
  toastsClear,
  noDuplicateToasts,
  menuSurvivesWait,
} from './spec-shared.ts'

export const defaultActions = weighted([
  [8, inputs],
  [4, clicks],
  [1, waitOnce],
])
