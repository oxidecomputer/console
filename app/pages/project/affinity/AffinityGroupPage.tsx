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
  type AffinityGroupMember,
} from '~/api'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getAffinityGroupSelector, useAffinityGroupSelector } from '~/hooks/use-params'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import { AffinityGroupEmptyState, affinityGroupView, GroupPage } from './utils'

export const handle = makeCrumb(
  (p) => p.affinityGroup!,
  (p) => pb.affinityGroup(getAffinityGroupSelector(p))
)

const colHelper = createColumnHelper<AffinityGroupMember>()

const memberList = (query: PP.AffinityGroup) =>
  getListQFn('affinityGroupMemberList', {
    path: { affinityGroup: query.affinityGroup },
    query: { project: query.project },
  })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const affinityGroupSelector = getAffinityGroupSelector(params)
  await Promise.all([
    queryClient.fetchQuery(affinityGroupView(affinityGroupSelector)),
    queryClient.fetchQuery(memberList(affinityGroupSelector).optionsFn()),
  ])
  return null
}

export default function AffinityPage() {
  const affinityGroupSelector = useAffinityGroupSelector()
  const { data: group } = usePrefetchedQuery(affinityGroupView(affinityGroupSelector))
  const { data: members } = usePrefetchedQuery(
    memberList(affinityGroupSelector).optionsFn()
  )
  const membersCount = members?.items.length ?? 0
  const columns = [
    colHelper.accessor('value.name', {
      header: 'Name',
      cell: makeLinkCell((instance) =>
        pb.instance({ project: affinityGroupSelector.project, instance })
      ),
    }),
    colHelper.accessor('value.runState', Columns.instanceState),
  ]

  const { table } = useQueryTable({
    query: memberList(affinityGroupSelector),
    columns,
    emptyState: <AffinityGroupEmptyState type="affinity" />,
    getId: (member) => member.value.id,
  })

  return <GroupPage type="affinity" group={group} table={table} members={membersCount} />
}
