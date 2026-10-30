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

import { useSiloPolicyScope } from '~/components/access/policy-scope'
import { UserDetailsSideModal } from '~/components/access/UserDetailsSideModal'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useSiloUserSelector } from '~/hooks/use-params'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import type { Route } from './+types/SiloUserDetail'

const userView = ({ userId }: PP.SiloUser) => q(api.userView, { path: { userId } })
// prefetched by the parent Access loader
const groupListAll = q(api.groupList, { query: { limit: ALL_ISH } })

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { userId } = params
  // fetchQuery throws on a bad ID so the error boundary renders Not Found
  await queryClient.fetchQuery(userView({ userId }))
  return null
}

export const handle = titleCrumb('User')

export default function SiloUserDetail() {
  const selector = useSiloUserSelector()
  const navigate = useNavigate()
  const { data: user } = usePrefetchedQuery(userView(selector))
  const scope = useSiloPolicyScope()
  const { data: groups } = usePrefetchedQuery(groupListAll)
  const groupsByUserId = useGroupsByUserId(groups.items)

  return (
    <UserDetailsSideModal
      user={user}
      onDismiss={() => navigate(pb.siloUsers())}
      scope={scope}
      userGroups={groupsOfUser(groupsByUserId, user.id)}
    />
  )
}
