/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import {
  apiQueryClient,
  byGroupThenName,
  deleteRole,
  getEffectiveRole,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  useUserRows,
  type IdentityType,
  type RoleKey,
} from '@oxide/api'
import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import {
  SiloAccessAddUserSideModal,
  SiloAccessEditUserSideModal,
} from '~/forms/silo-access'
import { confirmDelete } from '~/stores/confirm-delete'
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { CreateButton } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions, TableEmptyBox } from '~/ui/lib/Table'
import { identityTypeLabel, roleColor } from '~/util/access'
import { groupBy } from '~/util/array'
import { docLinks } from '~/util/links'

const EmptyState = ({ onClick }: { onClick: () => void }) => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Access24Icon />}
      title="No authorized users"
      body="Give permission to view, edit, or administer this silo"
      buttonText="Add user or group"
      onClick={onClick}
    />
  </TableEmptyBox>
)

export async function loader() {
  await Promise.all([
    apiQueryClient.fetchQuery('policyView', {}),
    // used to resolve user names
    apiQueryClient.fetchQuery('userList', {}),
    apiQueryClient.fetchQuery('groupList', {}),
  ])
  return null
}

type UserRow = {
  id: string
  identityType: IdentityType
  name: string
  siloRole: RoleKey | undefined
  effectiveRole: RoleKey
}

const colHelper = createColumnHelper<UserRow>()

Component.displayName = 'SiloAccessPage'
export function Component() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<UserRow | null>(null)

  const { data: siloPolicy } = usePrefetchedApiQuery('policyView', {})
  const siloRows = useUserRows(siloPolicy.roleAssignments, 'silo')

  const rows = useMemo(() => {
    return groupBy(siloRows, (u) => u.id)
      .map(([userId, userAssignments]) => {
        const siloRole = userAssignments.find((a) => a.roleSource === 'silo')?.roleName

        const roles = siloRole ? [siloRole] : []

        const { name, identityType } = userAssignments[0]

        const row: UserRow = {
          id: userId,
          identityType,
          name,
          siloRole,
          // we know there has to be at least one
          effectiveRole: getEffectiveRole(roles)!,
        }

        return row
      })
      .sort(byGroupThenName)
  }, [siloRows])

  const queryClient = useApiQueryClient()
  const { mutateAsync: updatePolicy } = useApiMutation('policyUpdate', {
    onSuccess: () => queryClient.invalidateQueries('policyView'),
    // TODO: handle 403
  })

  // TODO: checkboxes and bulk delete? not sure
  // TODO: disable delete on permissions you can't delete

  const columns = useMemo(
    () => [
      colHelper.accessor('name', { header: 'Name' }),
      colHelper.accessor('identityType', {
        header: 'Type',
        cell: (info) => identityTypeLabel[info.getValue()],
      }),
      colHelper.accessor('siloRole', {
        header: 'Role',
        cell: (info) => {
          const role = info.getValue()
          return role ? <Badge color={roleColor[role]}>silo.{role}</Badge> : null
        },
      }),
      // TODO: tooltips on disabled elements explaining why
      getActionsCol((row: UserRow) => [
        {
          label: 'Change role',
          onActivate: () => setEditingUserRow(row),
          disabled: !row.siloRole && "You don't have permission to change this user's role",
        },
        // TODO: only show if you have permission to do this
        {
          label: 'Delete',
          onActivate: confirmDelete({
            doDelete: () =>
              updatePolicy({
                // we know policy is there, otherwise there's no row to display
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
      <PageHeader>
        <PageTitle icon={<Access24Icon />}>Access</PageTitle>
        <DocsPopover
          heading="access"
          icon={<Access16Icon />}
          summary="Roles determine who can view, edit, or administer this silo and the projects within it. If a user or group has both a silo and project role, the stronger role takes precedence."
          links={[docLinks.keyConceptsIam, docLinks.access]}
        />
      </PageHeader>

      <TableActions>
        <CreateButton onClick={() => setAddModalOpen(true)}>Add user or group</CreateButton>
      </TableActions>
      {siloPolicy && addModalOpen && (
        <SiloAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={siloPolicy}
        />
      )}
      {siloPolicy && editingUserRow?.siloRole && (
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
        <EmptyState onClick={() => setAddModalOpen(true)} />
      ) : (
        <Table table={tableInstance} />
      )}
    </>
  )
}
