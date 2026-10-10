/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import { api, q, queryClient, usePrefetchedQuery } from '@oxide/api'

import { GroupMembersSideModal } from '~/components/access/GroupMembersSideModal'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getSiloGroupSelector, useSiloGroupSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const groupView = ({ groupId }: PP.SiloGroup) => q(api.groupView, { path: { groupId } })
// prefetched by the parent Users & Groups loader
const policyView = q(api.policyView, {})

export async function clientLoader({ params }: LoaderFunctionArgs) {
  // fetchQuery throws on a bad ID so the error boundary renders Not Found
  await queryClient.fetchQuery(groupView(getSiloGroupSelector(params)))
  return null
}

export const handle = titleCrumb('Group')

export default function SiloGroupDetail() {
  const selector = useSiloGroupSelector()
  const navigate = useNavigate()
  const { data: group } = usePrefetchedQuery(groupView(selector))
  const { data: siloPolicy } = usePrefetchedQuery(policyView)

  return (
    <GroupMembersSideModal
      group={group}
      onDismiss={() => navigate(pb.siloGroups())}
      siloPolicy={siloPolicy}
    />
  )
}
