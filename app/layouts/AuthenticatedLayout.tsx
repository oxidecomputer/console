/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Outlet } from 'react-router'

import { apiQueryClient, useApiQueryErrorsAllowed, usePrefetchedApiQuery } from '@oxide/api'

import { QuickActions } from '~/hooks/use-quick-actions'
import { invariant } from '~/util/invariant'

/**
 * We use `shouldRevalidate={() => true}` to force this to re-run on every nav,
 * but the longer-than-default `staleTime` avoids fetching too much.
 */
AuthenticatedLayout.loader = async () => {
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

/** Wraps all authenticated routes. */
export function AuthenticatedLayout() {
  return (
    <>
      <QuickActions />
      <Outlet />
    </>
  )
}

/**
 * Access all the data fetched by the loader. Because of the `shouldRevalidate`
 * trick, that loader runs on every authenticated page, which means callers do
 * not have to worry about hitting these endpoints themselves in their own
 * loaders.
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
