// Form-focused with a little `forward` so bombadil can revisit freshly
// created resources. Start URL should be a `-new` form page so `inputs`
// has something to fire on from step 1.
import { weighted } from '@antithesishq/bombadil'
import {
  clicks,
  forward,
  inputs,
  scroll,
  waitOnce,
} from '@antithesishq/bombadil/defaults/actions'

export * from './spec-shared.ts'

export const defaultActions = weighted([
  [8, inputs],
  [5, clicks],
  [1, scroll],
  [1, forward],
  [1, waitOnce],
])
