/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate } from 'react-router'

import { api, q, queryClient, usePrefetchedQuery } from '@oxide/api'

import { GroupMembersSideModal } from '~/components/access/GroupMembersSideModal'
import { useSiloPolicyScope } from '~/components/access/policy-scope'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useSiloGroupSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import type { Route } from './+types/SiloGroupDetail'

const groupView = ({ groupId }: PP.SiloGroup) => q(api.groupView, { path: { groupId } })

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { groupId } = params
  // fetchQuery throws on a bad ID so the error boundary renders Not Found
  await queryClient.fetchQuery(groupView({ groupId }))
  return null
}

export const handle = titleCrumb('Group')

export default function SiloGroupDetail() {
  const selector = useSiloGroupSelector()
  const navigate = useNavigate()
  const { data: group } = usePrefetchedQuery(groupView(selector))
  const scope = useSiloPolicyScope()

  return (
    <GroupMembersSideModal
      group={group}
      onDismiss={() => navigate(pb.siloGroups())}
      scope={scope}
    />
  )
}
