// Local scenario profile. Start from a deliberately interesting URL/mock state
// and avoid history churn so Bombadil spends most of the run near that state.
import { weighted } from '@antithesishq/bombadil'
import { clicks, inputs, scroll, waitOnce } from '@antithesishq/bombadil/defaults/actions'

export * from './spec-shared.ts'

export const defaultActions = weighted([
  [6, clicks],
  [3, inputs],
  [3, waitOnce],
  [1, scroll],
])
