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
import {
  getAntiAffinityGroupSelector,
  useAntiAffinityGroupSelector,
} from '~/hooks/use-params'
import {
  antiAffinityGroupMemberList,
  antiAffinityGroupView,
  GroupPage,
} from '~/pages/project/affinity/utils'
import { pb } from '~/util/path-builder'

export const handle = makeCrumb(
  (p) => p.antiAffinityGroup!,
  (p) => pb.antiAffinityGroup(getAntiAffinityGroupSelector(p))
)

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const antiAffinityGroupSelector = getAntiAffinityGroupSelector(params)
  await Promise.all([
    queryClient.fetchQuery(antiAffinityGroupView(antiAffinityGroupSelector)),
    queryClient.fetchQuery(antiAffinityGroupMemberList(antiAffinityGroupSelector)),
  ])
  return null
}

export default function AntiAffinityPage() {
  const antiAffinityGroupSelector = useAntiAffinityGroupSelector()
  const { data: group } = usePrefetchedQuery(
    antiAffinityGroupView(antiAffinityGroupSelector)
  )
  const { data: members } = usePrefetchedQuery(
    antiAffinityGroupMemberList(antiAffinityGroupSelector)
  )
  return <GroupPage type="anti-affinity" group={group} members={members.items} />
}
