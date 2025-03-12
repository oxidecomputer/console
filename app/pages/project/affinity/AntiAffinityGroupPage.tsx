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
  const { project, antiAffinityGroup } = getAntiAffinityGroupSelector(params)
  await Promise.all([
    queryClient.fetchQuery(antiAffinityGroupView({ project, antiAffinityGroup })),
    queryClient.fetchQuery(antiAffinityGroupMemberList({ project, antiAffinityGroup })),
  ])
  return null
}

export default function AntiAffinityPage() {
  const { project, antiAffinityGroup } = useAntiAffinityGroupSelector()
  const { data: group } = usePrefetchedQuery(
    antiAffinityGroupView({ project, antiAffinityGroup })
  )
  const { data: members } = usePrefetchedQuery(
    antiAffinityGroupMemberList({ project, antiAffinityGroup })
  )
  return <GroupPage type="anti-affinity" group={group} members={members.items} />
}
