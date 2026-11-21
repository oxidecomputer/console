/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { api, groupMemberList, q, queryClient, sortByDisplayName } from '@oxide/api'

import { ALL_ISH } from '~/util/consts'
import type * as PP from '~/util/path-params'

// The API only sorts users and groups by id, so fetch the full sets and sort by
// name client-side via TanStack/React Query's `select` option.
export const userListAll = q(
  api.userList,
  { query: { limit: ALL_ISH } },
  { select: sortByDisplayName }
)
export const groupListAll = q(
  api.groupList,
  { query: { limit: ALL_ISH } },
  { select: sortByDisplayName }
)
export const siloPolicyView = q(api.policyView, {})
export const projectPolicyView = ({ project }: PP.Project) =>
  q(api.projectPolicyView, { path: { project } })
export const userView = ({ userId }: PP.SiloUser) => q(api.userView, { path: { userId } })
export const groupView = ({ groupId }: PP.SiloGroup) =>
  q(api.groupView, { path: { groupId } })

/**
 * Prefetch everything the Users and Groups tabs (and their detail modals) need,
 * so switching tabs doesn't trigger a fetch.
 */
export async function prefetchUsersAndGroups(project?: string) {
  await Promise.all([
    queryClient.fetchQuery(groupListAll).then((groups) => {
      groups.items.forEach((g) =>
        queryClient.prefetchQuery(groupMemberList({ groupId: g.id }))
      )
    }),
    queryClient.prefetchQuery(siloPolicyView),
    queryClient.prefetchQuery(userListAll),
    project && queryClient.prefetchQuery(projectPolicyView({ project })),
  ])
}
