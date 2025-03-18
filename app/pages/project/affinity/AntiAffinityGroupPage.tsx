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
  apiq,
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
import { AffinityGroupEmptyState, AffinityPageHeader } from '~/pages/project/affinity/utils'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { Badge } from '~/ui/lib/Badge'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

export const handle = makeCrumb(
  (p) => p.antiAffinityGroup!,
  (p) => pb.antiAffinityGroup(getAntiAffinityGroupSelector(p))
)

const colHelper = createColumnHelper<AntiAffinityGroupMember>()

const antiAffinityGroupView = ({ project, antiAffinityGroup }: PP.AntiAffinityGroup) =>
  apiq('antiAffinityGroupView', { path: { antiAffinityGroup }, query: { project } })
const memberList = ({ project, antiAffinityGroup }: PP.AntiAffinityGroup) =>
  getListQFn('antiAffinityGroupMemberList', {
    path: { antiAffinityGroup: antiAffinityGroup },
    query: { project: project },
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
  const { project } = antiAffinityGroupSelector
  const { data: group } = usePrefetchedQuery(
    antiAffinityGroupView(antiAffinityGroupSelector)
  )
  const { id, name, description, policy, timeCreated } = group
  const { data: members } = usePrefetchedQuery(
    memberList(antiAffinityGroupSelector).optionsFn()
  )
  const membersCount = members?.items.length ?? 0
  const columns = [
    colHelper.accessor('value.name', {
      header: 'Name',
      cell: makeLinkCell((instance) => pb.instance({ project, instance })),
    }),
    colHelper.accessor('value.runState', Columns.instanceState),
  ]

  const { table } = useQueryTable({
    query: memberList(antiAffinityGroupSelector),
    columns,
    emptyState: <AffinityGroupEmptyState />,
    getId: (member: AntiAffinityGroupMember) => member.value.id,
  })

  return (
    <>
      <AffinityPageHeader name={name} />
      <PropertiesTable columns={2} className="-mt-8 mb-8">
        <PropertiesTable.Row label="type">
          <Badge>anti-affinity</Badge>
        </PropertiesTable.Row>
        <PropertiesTable.DescriptionRow description={description} />
        <PropertiesTable.Row label="policy">
          <Badge color="neutral">{policy}</Badge>
        </PropertiesTable.Row>
        <PropertiesTable.DateRow date={timeCreated} label="Created" />
        <PropertiesTable.Row label="Members">{membersCount}</PropertiesTable.Row>
        <PropertiesTable.IdRow id={id} />
      </PropertiesTable>
      {table}
    </>
  )
}
