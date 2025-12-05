/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState, type ReactNode } from 'react'

import { deleteRole, usePrefetchedQuery, useUserRows, type Policy } from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { accessQueries } from '~/api/access-queries'
import {
  getFilterEntityLabel,
  getNoPermissionMessage,
  identityTypeColumnDef,
} from '~/components/access/shared'
import { AccessEmptyState } from '~/components/AccessEmptyState'
import { HL } from '~/components/HL'
import {
  SiloAccessAddUserSideModal,
  SiloAccessEditUserSideModal,
} from '~/forms/silo-access'
import { useSiloAccessMutations } from '~/hooks/use-access-mutations'
import { useSiloAccessRows } from '~/hooks/use-access-rows'
import { confirmDelete } from '~/stores/confirm-delete'
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'
import type { IdentityFilter, SiloAccessRow } from '~/types/access'
import { CreateButton } from '~/ui/lib/CreateButton'
import { TableActions } from '~/ui/lib/Table'
import { roleColor } from '~/util/access'

type SiloAccessTabProps = {
  filter: IdentityFilter
  children?: ReactNode
}

function SiloAccessTable({
  filter,
  rows,
  policy,
  onEditRow,
}: {
  filter: IdentityFilter
  rows: SiloAccessRow[]
  policy: Policy
  onEditRow: (row: SiloAccessRow) => void
}) {
  const { updatePolicy } = useSiloAccessMutations()

  const columns = useMemo(() => {
    const colHelper = createColumnHelper<SiloAccessRow>()

    return [
      colHelper.accessor('name', { header: 'Name' }),
      // TODO: Add member information for groups once API provides it. Ideally:
      //   1. A /groups/{groupId}/members endpoint to list members
      //   2. A memberCount field on the Group type
      // This would allow showing member count in the table and displaying members
      // in a tooltip or expandable row.
      // TODO: Add lastAccessed column for users once API provides it. The User type
      // should include a lastAccessed timestamp to show when users last logged in.
      ...(filter === 'all'
        ? [colHelper.accessor('identityType', identityTypeColumnDef)]
        : []),
      colHelper.accessor('siloRole', {
        header: 'Role',
        cell: (info) => {
          const role = info.getValue()
          return role ? <Badge color={roleColor[role]}>silo.{role}</Badge> : null
        },
      }),
      getActionsCol((row: SiloAccessRow) => [
        {
          label: 'Change role',
          onActivate: () => onEditRow(row),
          disabled: !row.siloRole && getNoPermissionMessage('change', row.identityType),
        },
        {
          label: 'Delete',
          onActivate: confirmDelete({
            doDelete: async () =>
              await updatePolicy({
                body: deleteRole(row.id, policy),
              }),
            label: (
              <span>
                the <HL>{row.siloRole}</HL> role for <HL>{row.name}</HL>
              </span>
            ),
          }),
          // TODO: disable delete on permissions you can't delete
          disabled: !row.siloRole && getNoPermissionMessage('delete', row.identityType),
        },
      ]),
    ]
  }, [filter, policy, updatePolicy, onEditRow])

  const tableInstance = useReactTable<SiloAccessRow>({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return <Table table={tableInstance} />
}

/**
 * Access control tab for silo-level permissions.
 * Displays users and groups with their silo roles, and allows adding/editing/deleting role assignments.
 */
export function SiloAccessTab({ filter, children }: SiloAccessTabProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<SiloAccessRow | null>(null)

  const { data: policy } = usePrefetchedQuery(accessQueries.siloPolicy())
  const siloRows = useUserRows(policy.roleAssignments, 'silo')
  const rows = useSiloAccessRows(siloRows, filter)

  const addButtonText = `Add ${getFilterEntityLabel(filter)}`

  return (
    <>
      <TableActions>
        <CreateButton onClick={() => setAddModalOpen(true)}>{addButtonText}</CreateButton>
      </TableActions>
      {policy && addModalOpen && (
        <SiloAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={policy}
        />
      )}
      {policy && editingRow && editingRow.siloRole && (
        <SiloAccessEditUserSideModal
          onDismiss={() => setEditingRow(null)}
          policy={policy}
          name={editingRow.name}
          identityId={editingRow.id}
          identityType={editingRow.identityType}
          defaultValues={{ roleName: editingRow.siloRole }}
        />
      )}
      {children}
      {rows.length === 0 ? (
        <AccessEmptyState
          scope="silo"
          filter={filter}
          onClick={() => setAddModalOpen(true)}
        />
      ) : (
        <SiloAccessTable
          filter={filter}
          rows={rows}
          policy={policy}
          onEditRow={setEditingRow}
        />
      )}
    </>
  )
}
