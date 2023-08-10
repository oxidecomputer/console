/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useRef } from 'react'
import { Outlet } from 'react-router-dom'

import { apiQueryClient, useApiQueryErrorsAllowed, usePrefetchedApiQuery } from '@oxide/api'
import { Pagination } from '@oxide/pagination'
import { SkipLinkTarget } from '@oxide/ui'
import { classed, invariant } from '@oxide/util'

import { PageActionsTarget } from 'app/components/PageActions'
import { useScrollRestoration } from 'app/hooks/use-scroll-restoration'

export const PageContainer = classed.div`grid h-screen grid-cols-[14.25rem,1fr] grid-rows-[60px,1fr]`

export function ContentPane() {
  const ref = useRef<HTMLDivElement>(null)
  useScrollRestoration(ref)
  return (
    <div ref={ref} className="flex flex-col overflow-auto" data-testid="scroll-container">
      <div className="flex flex-grow flex-col pb-8">
        <SkipLinkTarget />
        <main className="[&>*]:gutter">
          <Outlet />
        </main>
      </div>
      <div className="sticky bottom-0 flex-shrink-0 justify-between overflow-hidden border-t bg-default border-secondary empty:border-t-0">
        <Pagination.Target />
        <PageActionsTarget />
      </div>
    </div>
  )
}

/**
 * Special content pane for the serial console that lets us break out of the
 * usual layout. Main differences: no `pb-8` and `<main>` is locked at `h-full`
 * to avoid page-level scroll. We also leave off the pagination and page actions
 * `<div>` because we don't need it.
 */
export const SerialConsoleContentPane = () => (
  <div className="flex flex-col overflow-auto">
    <div className="flex flex-grow flex-col">
      <SkipLinkTarget />
      <main className="[&>*]:gutter h-full">
        <Outlet />
      </main>
    </div>
  </div>
)

/**
 * Loader for the `<Route>` that wraps all authenticated routes. We use
 * `shouldRevalidate={() => true}` to force this to re-run on every nav, but the
 * longer-than-default `staleTime` avoids fetching too much.
 */
export const currentUserLoader = async () => {
  const staleTime = 60000
  await Promise.all([
    apiQueryClient.prefetchQuery('currentUserView', {}, { staleTime }),
    apiQueryClient.prefetchQuery('currentUserGroups', {}, { staleTime }),
    // Need to prefetch this because every layout hits it when deciding whether
    // to show the silo/system picker. It's also fetched by the SystemLayout
    // loader to figure out whether to 404, but RQ dedupes the request.
    apiQueryClient.prefetchQueryErrorsAllowed(
      'systemPolicyView',
      {},
      {
        explanation: '/v1/system/policy 403 is expected if user is not a fleet viewer.',
        expectedStatusCode: 403,
        staleTime,
      }
    ),
  ])
  return null
}

/**
 * Access all the data fetched by `currentUserLoader`. Because of the
 * `shouldRevalidate` trick, that loader runs on every authenticated page, which
 * means callers do not have to worry about hitting these endpoints themselves
 * in their own loaders.
 */
export function useCurrentUser() {
  const { data: me } = usePrefetchedApiQuery('currentUserView', {})
  const { data: myGroups } = usePrefetchedApiQuery('currentUserGroups', {})

  // User can only get to system routes if they have viewer perms (at least) on
  // the fleet. The natural place to find out whether they have such perms is
  // the fleet (system) policy, but if the user doesn't have fleet read, we'll
  // get a 403 from that endpoint. So we simply check whether that endpoint 200s
  // or not to determine whether the user is a fleet viewer.
  const { data: systemPolicy } = useApiQueryErrorsAllowed('systemPolicyView', {})
  // don't use usePrefetchedApiQuery because it's not worth making an errors
  // allowed version of that
  invariant(systemPolicy, 'System policy must be prefetched')
  const isFleetViewer = systemPolicy.type === 'success'

  return { me, myGroups, isFleetViewer }
}
