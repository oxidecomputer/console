/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Outlet } from 'react-router'

import { apiQueryClient } from '@oxide/api'

import { RouterDataErrorBoundary } from '~/components/ErrorBoundary'
import { QuickActions } from '~/hooks/use-quick-actions'

/** very important. see `currentUserLoader` and `useCurrentUser` */
export const shouldRevalidate = () => true

export function ErrorBoundary() {
  return <RouterDataErrorBoundary />
}

/**
 * We use `shouldRevalidate={() => true}` to force this to re-run on every nav,
 * but the longer-than-default `staleTime` avoids fetching too much.
 */
export async function clientLoader() {
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
export default function AuthenticatedLayout() {
  return (
    <>
      <QuickActions />
      <Outlet />
    </>
  )
}
