// Row-actions + menus page; probes `menuSurvivesWait` and polling races.
// No history churn — stay on the page so menus actually get exercised.
// High `waitOnce` so open menus sit through background polling ticks.
import { weighted } from '@antithesishq/bombadil'
import { clicks, inputs, waitOnce } from '@antithesishq/bombadil/defaults/actions'

export * from './spec-shared.ts'

export const defaultActions = weighted([
  [2, inputs],
  [6, clicks],
  [4, waitOnce],
])
