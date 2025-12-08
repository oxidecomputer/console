/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState, type ReactNode } from 'react'

import {
  api,
  byGroupThenName,
  deleteRole,
  getEffectiveRole,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  useUserRows,
  type IdentityType,
  type Policy,
  type RoleKey,
} from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { AccessEmptyState } from '~/components/AccessEmptyState'
import { HL } from '~/components/HL'
import {
  SiloAccessAddUserSideModal,
  SiloAccessEditUserSideModal,
} from '~/forms/silo-access'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'
import { CreateButton } from '~/ui/lib/CreateButton'
import { TableActions } from '~/ui/lib/Table'
import {
  filterByIdentityType,
  identityFilterLabel,
  identityTypeLabel,
  roleColor,
  type IdentityFilter,
} from '~/util/access'
import { groupBy } from '~/util/array'

type SiloAccessRow = {
  id: string
  identityType: IdentityType
  name: string
  siloRole: RoleKey | undefined
  effectiveRole: RoleKey
}

type SiloAccessTabProps = {
  filter: IdentityFilter
  children?: ReactNode
}

function useSiloAccessRows(
  siloRows: ReturnType<typeof useUserRows>,
  filter: IdentityFilter
) {
  return useMemo(() => {
    const rows = groupBy(siloRows, (u) => u.id)
      .map(([userId, userAssignments]) => {
        const { name, identityType } = userAssignments[0]
        const siloRole = userAssignments.find((a) => a.roleSource === 'silo')?.roleName

        // Silo access tab only shows identities with explicit silo roles
        if (!siloRole) {
          return null
        }

        const effectiveRole = getEffectiveRole([siloRole])
        if (!effectiveRole) {
          return null
        }

        const row: SiloAccessRow = {
          id: userId,
          identityType,
          name,
          siloRole,
          effectiveRole,
        }

        return row
      })
      .filter((row): row is SiloAccessRow => row !== null)

    return filterByIdentityType(rows, filter).sort(byGroupThenName)
  }, [siloRows, filter])
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
  const { mutateAsync: updatePolicy } = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('policyView')
    },
  })

  const columns = useMemo(() => {
    const colHelper = createColumnHelper<SiloAccessRow>()

    return [
      colHelper.accessor('name', { header: 'Name' }),
      // TODO: Add member information for groups once API provides it. Ideally:
      //   1. A /groups/{groupId}/members endpoint to list members
      //   2. A memberCount field on the Group type to show count,
      //      plus list of members in tooltip or expandable row
      // TODO: Add lastAccessed column for users once API provides it.
      ...(filter === 'all'
        ? [
            colHelper.accessor('identityType', {
              header: 'Type',
              cell: (info) => identityTypeLabel[info.getValue()],
            }),
          ]
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
        },
        {
          label: 'Delete',
          onActivate: confirmDelete({
            doDelete: async () => {
              await updatePolicy({
                body: deleteRole(row.id, policy),
              })
              addToast({ content: 'Access removed' })
            },
            label: (
              <span>
                the <HL>{row.siloRole}</HL> role for <HL>{row.name}</HL>
              </span>
            ),
          }),
          // TODO: disable delete on permissions you can't delete
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

  const { data: policy } = usePrefetchedQuery(q(api.policyView, {}))
  const siloRows = useUserRows(policy.roleAssignments, 'silo')
  const rows = useSiloAccessRows(siloRows, filter)

  const addButtonText = `Add ${identityFilterLabel[filter]}`

  return (
    <>
      <TableActions>
        <CreateButton onClick={() => setAddModalOpen(true)}>{addButtonText}</CreateButton>
      </TableActions>
      {policy && addModalOpen && (
        <SiloAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={policy}
          filter={filter}
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
