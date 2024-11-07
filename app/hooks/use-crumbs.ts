/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMatches } from 'react-router-dom'
import type { Merge } from 'type-fest'

import { invariant } from '~/util/invariant'

type UseMatchesMatch = ReturnType<typeof useMatches>[number]

type MatchWithCrumb = Merge<
  UseMatchesMatch,
  {
    handle: {
      crumb: string | CrumbFunc
      /**
       * Side modal forms have their own routes and their own crumbs that we want
       * in the page title, but it's weird for them to affect the nav breadcrumbs
       * because the side modal form opens on top of the page with an overlay
       * covering the background and not interactive. It feels weird for the
       * breadcrumbs to change in the background when you open a form. So we use
       * `titleOnly` to mark the form crumbs as not part of the nav breadcrumbs.
       */
      titleOnly?: true
    }
  }
>

export type CrumbFunc = (m: MatchWithCrumb) => string

function hasCrumb(m: UseMatchesMatch): m is MatchWithCrumb {
  return !!(m.handle && typeof m.handle === 'object' && 'crumb' in m.handle)
}

/**
 * Throw if crumb is not a string or function. It would be nice if TS enforced
 * this at the `<Route>` call, but overriding the type declarations is hard and
 * `createRoutesFromChildren` rejects a custom Route component.
 */
function checkCrumbType(m: MatchWithCrumb): MatchWithCrumb {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const crumbType = typeof (m.handle as any).crumb
  invariant(
    crumbType === 'string' || crumbType === 'function',
    `Route crumb must be a string or function if present. Check <Route> for ${m.pathname}.`
  )
  return m
}

export const useCrumbs = () =>
  useMatches()
    .filter(hasCrumb)
    .map(checkCrumbType)
    .map((m) => {
      const label =
        typeof m.handle.crumb === 'function' ? m.handle.crumb(m) : m.handle.crumb
      return {
        label,
        path: m.pathname,
        titleOnly: !!m.handle.titleOnly,
      }
    })
