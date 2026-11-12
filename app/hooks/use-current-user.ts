/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { api, q, usePrefetchedQuery } from '~/api/client'
import { ALL_ISH } from '~/util/consts'

/**
 * The current user's groups. ALL_ISH because permission checks derive roles
 * from these memberships, and a group past the first page could be the one that
 * grants access. Shared so every caller hits the cache key the loader prefetches.
 */
export const myGroupsQuery = (options?: {
  staleTime?: number
  enabled?: boolean
  throwOnError?: boolean
}) => q(api.currentUserGroups, { query: { limit: ALL_ISH } }, options)

/**
 * Access all the data fetched by the loader. Because of the `shouldRevalidate`
 * trick, that loader runs on every authenticated page, which means callers do
 * not have to worry about hitting these endpoints themselves in their own
 * loaders.
 */
export function useCurrentUser() {
  const { data: me } = usePrefetchedQuery(q(api.currentUserView, {}))
  const { data: myGroups } = usePrefetchedQuery(myGroupsQuery())
  return { me, myGroups }
}
