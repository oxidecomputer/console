/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { deleteRole, usePrefetchedQuery, useUserRows } from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { accessQueries } from '~/api/access-queries'
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
import type { SiloAccessRow } from '~/types/access'
import { CreateButton } from '~/ui/lib/CreateButton'
import { TableActions } from '~/ui/lib/Table'
import { roleColor } from '~/util/access'

const colHelper = createColumnHelper<SiloAccessRow>()

export default function SiloAccessUsersTab() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<SiloAccessRow | null>(null)

  const { data: siloPolicy } = usePrefetchedQuery(accessQueries.siloPolicy())
  const siloRows = useUserRows(siloPolicy.roleAssignments, 'silo')
  const rows = useSiloAccessRows(siloRows, 'users')

  const { updatePolicy } = useSiloAccessMutations()

  const columns = useMemo(
    () => [
      colHelper.accessor('name', { header: 'Name' }),
      // TODO: Add lastAccessed column once API provides it. The User type should include
      // a lastAccessed timestamp field to show when each user last logged in or accessed
      // the system. This helps identify inactive users.
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
          onActivate: () => setEditingUserRow(row),
          disabled: !row.siloRole && "You don't have permission to change this user's role",
        },
        {
          label: 'Delete',
          onActivate: confirmDelete({
            doDelete: () =>
              updatePolicy({
                body: deleteRole(row.id, siloPolicy),
              }),
            label: (
              <span>
                the <HL>{row.siloRole}</HL> role for <HL>{row.name}</HL>
              </span>
            ),
          }),
          disabled: !row.siloRole && "You don't have permission to delete this user",
        },
      ]),
    ],
    [siloPolicy, updatePolicy]
  )

  const tableInstance = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <TableActions>
        <CreateButton onClick={() => setAddModalOpen(true)}>Add user</CreateButton>
      </TableActions>
      {addModalOpen && (
        <SiloAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={siloPolicy}
        />
      )}
      {editingUserRow?.siloRole && (
        <SiloAccessEditUserSideModal
          onDismiss={() => setEditingUserRow(null)}
          policy={siloPolicy}
          name={editingUserRow.name}
          identityId={editingUserRow.id}
          identityType={editingUserRow.identityType}
          defaultValues={{ roleName: editingUserRow.siloRole }}
        />
      )}
      {rows.length === 0 ? (
        <AccessEmptyState
          scope="silo"
          filter="users"
          onClick={() => setAddModalOpen(true)}
        />
      ) : (
        <Table table={tableInstance} />
      )}
    </>
  )
}
