/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Outlet } from 'react-router'
import * as R from 'remeda'

import {
  sortRoleEntries,
  usePrefetchedQuery,
  userScopedRoleEntries,
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

import { groupListAll, type PolicyScope } from './policy-scope'

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
  const sortedGroups = useMemo(
    () => R.sortBy(groups.items, (g) => g.displayName.toLowerCase()),
    [groups]
  )

  // groups can't be in other groups, so passing no groups yields only the
  // group's direct roles in each scope
  const effectiveRole = useCallback(
    (group: Group) =>
      sortRoleEntries(userScopedRoleEntries(group.id, [], siloPolicy, projectPolicy)).at(0),
    [siloPolicy, projectPolicy]
  )

  const columns = useMemo(
    () => [
      colHelper.accessor('displayName', {
        header: 'Name',
        cell: (info) => (
          <LinkCell to={groupPath(info.row.original.id)}>{info.getValue()}</LinkCell>
        ),
      }),
      colHelper.display({
        id: 'role',
        header: 'Role',
        cell: ({ row }) => {
          const effective = effectiveRole(row.original)
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
    [groupPath, effectiveRole]
  )

  const table = useReactTable({
    columns,
    data: sortedGroups,
    getRowId: (group) => group.id,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      {sortedGroups.length === 0 ? <GroupEmptyState /> : <Table table={table} />}
      <Outlet />
    </>
  )
}
