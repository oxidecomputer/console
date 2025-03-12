/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { LoaderFunctionArgs } from 'react-router'

import { queryClient, usePrefetchedQuery } from '~/api'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getAffinityGroupSelector, useAffinityGroupSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

import { affinityGroupMemberList, affinityGroupView, GroupPage } from './utils'

export const handle = makeCrumb(
  (p) => p.affinityGroup!,
  (p) => pb.affinityGroup(getAffinityGroupSelector(p))
)

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const affinityGroupSelector = getAffinityGroupSelector(params)
  await Promise.all([
    queryClient.fetchQuery(affinityGroupView(affinityGroupSelector)),
    queryClient.fetchQuery(affinityGroupMemberList(affinityGroupSelector)),
  ])
  return null
}

export default function AffinityPage() {
  const affinityGroupSelector = useAffinityGroupSelector()
  const { data: group } = usePrefetchedQuery(affinityGroupView(affinityGroupSelector))
  const { data: members } = usePrefetchedQuery(
    affinityGroupMemberList(affinityGroupSelector)
  )
  return <GroupPage type="affinity" group={group} members={members.items} />
}
