/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMatches, type Params, type UIMatch } from 'react-router-dom'

import { invariant } from '~/util/invariant'

type Crumb = {
  crumb: MakeStr
  /**
   * Side modal forms have their own routes and their own crumbs that we want
   * in the page title, but it's weird for them to affect the nav breadcrumbs
   * because the side modal form opens on top of the page with an overlay
   * covering the background and not interactive. It feels weird for the
   * breadcrumbs to change in the background when you open a form. So we use
   * `titleOnly` to mark the form crumbs as not part of the nav breadcrumbs.
   */
  titleOnly?: true
  /**
   * Some route nodes don't have their own pages, but rather just redirect
   * immediately to their first child node. In this case, we need the crumb to
   * link directly to that child, otherwise we get a weird flash due to linking
   * to the parent node and waiting for the redirect.
   */
  path?: MakeStr
}

type MatchWithCrumb = UIMatch<unknown, Crumb>

type MakeStr = string | ((p: Params) => string)

/** Helper to make crumb definitions less verbose */
export const makeCrumb = (crumb: MakeStr, path?: MakeStr): Crumb => ({ crumb, path })
export const titleCrumb = (crumb: string): Crumb => ({ crumb, titleOnly: true })

function hasCrumb(m: UIMatch): m is MatchWithCrumb {
  return !!(m.handle && typeof m.handle === 'object' && 'crumb' in m.handle)
}

/**
 * Throw if crumb is not a string or function. It would be nice if TS enforced
 * this at the `<Route>` call, but overriding the type declarations is hard and
 * `createRoutesFromChildren` rejects a custom Route component.
 */
function checkCrumbType(m: MatchWithCrumb): MatchWithCrumb {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const crumbType = typeof m.handle.crumb
  invariant(
    crumbType === 'string' || crumbType === 'function',
    `Route crumb must be a string or function if present. Check <Route> for ${m.pathname}.`
  )
  return m
}

export const matchesToCrumbs = (matches: UIMatch[]) =>
  matches
    .filter(hasCrumb)
    .map(checkCrumbType)
    .map((m) => {
      const { crumb, path } = m.handle
      return {
        label: typeof crumb === 'function' ? crumb(m.params) : crumb,
        path: typeof path === 'function' ? path(m.params) : path || m.pathname,
        titleOnly: !!m.handle.titleOnly,
      }
    })

export const useCrumbs = () => matchesToCrumbs(useMatches())
