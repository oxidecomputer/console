/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router'

import { Affinity24Icon } from '@oxide/design-system/icons/react'

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
import { makeLinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { CardBlock } from '~/ui/lib/CardBlock'
import { Divider } from '~/ui/lib/Divider'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { TableEmptyBox } from '~/ui/lib/Table'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import { AffinityPageHeader } from './AffinityPage'

export const handle = makeCrumb(
  (p) => p.antiAffinityGroup!,
  (p) => pb.antiAffinityGroup(getAntiAffinityGroupSelector(p))
)

const colHelper = createColumnHelper<AntiAffinityGroupMember>()

const antiAffinityGroupView = ({ antiAffinityGroup, project }: PP.AntiAffinityGroup) =>
  apiq('antiAffinityGroupView', { path: { antiAffinityGroup }, query: { project } })
const memberList = ({ antiAffinityGroup, project }: PP.AntiAffinityGroup) =>
  getListQFn('antiAffinityGroupMemberList', {
    path: { antiAffinityGroup },
    // member limit in DB is currently 32, so pagination isn't needed
    query: { project, limit: ALL_ISH },
  })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { antiAffinityGroup, project } = getAntiAffinityGroupSelector(params)
  await Promise.all([
    queryClient.fetchQuery(antiAffinityGroupView({ antiAffinityGroup, project })),
    queryClient.fetchQuery(memberList({ antiAffinityGroup, project }).optionsFn()),
  ])
  return null
}

const AntiAffinityGroupMemberEmptyState = () => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Affinity24Icon />}
      title="No anti-affinity group members"
      body="Add an instance to the group to see it here"
    />
  </TableEmptyBox>
)

export default function AntiAffinityPage() {
  const { antiAffinityGroup, project } = useAntiAffinityGroupSelector()
  const { data: group } = usePrefetchedQuery(
    antiAffinityGroupView({ antiAffinityGroup, project })
  )
  const { id, name, description, policy, timeCreated } = group
  const { data: members } = usePrefetchedQuery(
    memberList({ antiAffinityGroup, project }).optionsFn()
  )
  const membersCount = members.items.length
  const columns = useMemo(
    () => [
      colHelper.accessor('value.name', {
        header: 'Name',
        cell: makeLinkCell((instance) => pb.instance({ project, instance })),
      }),
      colHelper.accessor('value.runState', Columns.instanceState),
    ],
    [project]
  )

  const table = useReactTable({
    columns,
    data: members.items,
    getCoreRowModel: getCoreRowModel(),
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
      <Divider className="mb-10" />
      <CardBlock>
        <CardBlock.Header
          title="Members"
          description="Instances in this anti-affinity group"
        />
        <CardBlock.Body>
          {membersCount ? <Table table={table} /> : <AntiAffinityGroupMemberEmptyState />}
        </CardBlock.Body>
      </CardBlock>
    </>
  )
}
