// Action-weight profiles for bombadil specs. Kept in a separate module from
// the shared properties so the exports here don't leak into a spec file via
// `export *` (bombadil rejects unknown export types).
//
// Background: bombadil's `inputs` generator is a no-op when no focusable
// input is on screen, so high `inputs` weight only takes effect on forms
// and is effectively no-op elsewhere. History actions (`back`, `forward`,
// `reload`) chew up run time without growing coverage and can race with
// background polling, so most profiles keep them at 0.
import { weighted } from '@antithesishq/bombadil'
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
  // bombadil can't abandon the form mid-fill. `navigation` is a back/forward/
  // reload composite (not URL nav) so it's zero here — URL nav, if any,
  // happens through `clicks` on sidebar links.
  'form-heavy': {
    inputs: 8,
    clicks: 4,
    navigation: 0,
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
  // No history churn — stay on the page so menus actually get exercised.
  menus: {
    inputs: 2,
    clicks: 6,
    navigation: 0,
    scroll: 0,
    back: 0,
    forward: 0,
    reload: 0,
    waitOnce: 4,
  },
  // Broad URL coverage. In bombadil, `clicks` drives real URL navigation
  // (sidebar, breadcrumbs, row links), so bump it heavily rather than
  // `navigation` (which is a history-churn composite).
  breadth: {
    inputs: 3,
    clicks: 10,
    navigation: 0,
    scroll: 0,
    back: 0,
    forward: 0,
    reload: 0,
    waitOnce: 1,
  },
  // Form-focused with a little `forward` so bombadil can revisit freshly
  // created resources. Start URL should be a `-new` form page so `inputs`
  // has something to fire on from step 1.
  'create-and-revisit': {
    inputs: 8,
    clicks: 5,
    navigation: 0,
    scroll: 1,
    back: 0,
    forward: 1,
    reload: 0,
    waitOnce: 1,
  },
} as const satisfies Record<string, Weights>

export type ProfileName = keyof typeof profiles

export function makeActionMix(profile: ProfileName) {
  const w = profiles[profile]
  return weighted([
    [w.inputs, inputs],
    [w.clicks, clicks],
    [w.navigation, navigation],
    [w.scroll, scroll],
    [w.back, back],
    [w.forward, forward],
    [w.reload, reload],
    [w.waitOnce, waitOnce],
  ])
}
