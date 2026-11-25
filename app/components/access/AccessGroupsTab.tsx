/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Outlet } from 'react-router'

import {
  groupScopedRoleEntries,
  queryClient,
  sortRoleEntries,
  usePrefetchedQuery,
  type Group,
} from '@oxide/api'
import { PersonGroup24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { EmptyCell } from '~/table/cells/EmptyCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { MemberCountCell } from '~/table/cells/MemberCountCell'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'
import { roleColor } from '~/util/access'

import { groupListAll, groupView } from './access-data'
import { type PolicyScope } from './policy-scope'

const colHelper = createColumnHelper<Group>()

const memberCountCol = colHelper.display({
  id: 'memberCount',
  header: 'Users',
  cell: ({ row }) => <MemberCountCell groupId={row.original.id} />,
})

const timeCreatedCol = colHelper.accessor('timeCreated', Columns.timeCreated)

const GroupEmptyState = () => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<PersonGroup24Icon />}
      title="No groups"
      body="No groups have been added to this silo"
    />
  </TableEmptyBox>
)

export function AccessGroupsTab({ scope }: { scope: PolicyScope }) {
  const { siloPolicy, projectPolicy, groupPath } = scope

  const { data: groups } = usePrefetchedQuery(groupListAll)

  const columns = useMemo(
    () => [
      colHelper.accessor('displayName', {
        header: 'Name',
        cell: (info) => (
          <LinkCell
            to={groupPath(info.row.original.id)}
            // seed the detail query so the side modal opens without a fetch
            onClick={() => {
              const group = info.row.original
              queryClient.setQueryData(groupView({ groupId: group.id }).queryKey, group)
            }}
          >
            {info.getValue()}
          </LinkCell>
        ),
      }),
      colHelper.display({
        id: 'role',
        header: 'Role',
        cell: ({ row }) => {
          const effective = sortRoleEntries(
            groupScopedRoleEntries(row.original.id, siloPolicy, projectPolicy)
          ).at(0)
          if (!effective) return <EmptyCell />
          return (
            <Badge color={roleColor[effective.roleName]}>
              {effective.scope}.{effective.roleName}
            </Badge>
          )
        },
      }),
      memberCountCol,
      timeCreatedCol,
    ],
    [groupPath, siloPolicy, projectPolicy]
  )

  const table = useReactTable({
    columns,
    data: groups.items,
    getRowId: (group) => group.id,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      {groups.items.length === 0 ? <GroupEmptyState /> : <Table table={table} />}
      <Outlet />
    </>
  )
}
