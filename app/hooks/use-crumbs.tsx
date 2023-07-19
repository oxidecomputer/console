/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMatches } from 'react-router-dom'
import invariant from 'tiny-invariant'
import type { Spread } from 'type-fest'

type UseMatchesMatch = ReturnType<typeof useMatches>[number]

// Merge has a bug where it makes `data` optional for no reason
type MatchWithCrumb = Spread<UseMatchesMatch, { handle: { crumb: string | CrumbFunc } }>

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
    .map((m) => ({
      label: typeof m.handle.crumb === 'function' ? m.handle.crumb(m) : m.handle.crumb,
      href: m.pathname,
    }))
