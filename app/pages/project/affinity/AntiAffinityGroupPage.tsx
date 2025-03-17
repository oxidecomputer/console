/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import type { LoaderFunctionArgs } from 'react-router'

import {
  getListQFn,
  queryClient,
  usePrefetchedQuery,
  type AntiAffinityGroupMember,
} from '~/api'
import { makeCrumb } from '~/hooks/use-crumbs'
import {
  getAntiAffinityGroupSelector,
  useAntiAffinityGroupSelector,
} from '~/hooks/use-params'
import {
  AffinityGroupEmptyState,
  antiAffinityGroupView,
  GroupPage,
} from '~/pages/project/affinity/utils'
import { useQueryTable } from '~/table/QueryTable'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

export const handle = makeCrumb(
  (p) => p.antiAffinityGroup!,
  (p) => pb.antiAffinityGroup(getAntiAffinityGroupSelector(p))
)

const colHelper = createColumnHelper<AntiAffinityGroupMember>()

const memberList = (query: PP.AntiAffinityGroup) =>
  getListQFn('antiAffinityGroupMemberList', {
    path: { antiAffinityGroup: query.antiAffinityGroup },
    query: { project: query.project },
  })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const antiAffinityGroupSelector = getAntiAffinityGroupSelector(params)
  await Promise.all([
    queryClient.fetchQuery(antiAffinityGroupView(antiAffinityGroupSelector)),
    queryClient.fetchQuery(memberList(antiAffinityGroupSelector).optionsFn()),
  ])
  return null
}

export default function AntiAffinityPage() {
  const antiAffinityGroupSelector = useAntiAffinityGroupSelector()
  const { data: group } = usePrefetchedQuery(
    antiAffinityGroupView(antiAffinityGroupSelector)
  )
  const { data: members } = usePrefetchedQuery(
    memberList(antiAffinityGroupSelector).optionsFn()
  )
  const membersCount = members?.items.length ?? 0
  const columns = [
    colHelper.accessor('value.name', {
      header: 'Name',
      cell: (info) => info.getValue(),
    }),
    colHelper.accessor('type', {}),
  ]

  const { table } = useQueryTable({
    query: memberList(antiAffinityGroupSelector),
    columns,
    emptyState: <AffinityGroupEmptyState type="anti-affinity" />,
    getId: (member: AntiAffinityGroupMember) => member.value.id,
  })

  return (
    <GroupPage type="anti-affinity" group={group} table={table} members={membersCount} />
  )
}
