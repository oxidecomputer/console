/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate } from 'react-router'

import {
  api,
  groupsOfUser,
  q,
  queryClient,
  useGroupsByUserId,
  usePrefetchedQuery,
} from '@oxide/api'

import { groupListAll, useProjectPolicyScope } from '~/components/access/policy-scope'
import { UserDetailsSideModal } from '~/components/access/UserDetailsSideModal'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectSelector, useSiloUserSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import type { Route } from './+types/ProjectUserDetail'

const userView = ({ userId }: PP.SiloUser) => q(api.userView, { path: { userId } })

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { userId } = params
  // fetchQuery throws on a bad ID so the error boundary renders Not Found.
  // Policies and groups are prefetched by the parent Access loader.
  await queryClient.fetchQuery(userView({ userId }))
  return null
}

export const handle = titleCrumb('User')

export default function ProjectUserDetail() {
  const projectSelector = useProjectSelector()
  const userSelector = useSiloUserSelector()
  const navigate = useNavigate()
  const { data: user } = usePrefetchedQuery(userView(userSelector))
  const scope = useProjectPolicyScope()
  const { data: groups } = usePrefetchedQuery(groupListAll)
  const groupsByUserId = useGroupsByUserId(groups.items)

  return (
    <UserDetailsSideModal
      user={user}
      onDismiss={() => navigate(pb.projectUsers(projectSelector))}
      scope={scope}
      userGroups={groupsOfUser(groupsByUserId, user.id)}
    />
  )
}
