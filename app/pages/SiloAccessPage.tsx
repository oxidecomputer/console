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
  api,
  byGroupThenName,
  deleteRole,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type IdentityType,
  type SiloRole,
} from '@oxide/api'
import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import {
  SiloAccessAddUserSideModal,
  SiloAccessEditUserSideModal,
} from '~/forms/silo-access'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'
import { CreateButton } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions, TableEmptyBox } from '~/ui/lib/Table'
import { identityTypeLabel, roleColor } from '~/util/access'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'

const policyView = q(api.policyView, {})
const userList = q(api.userList, { query: { limit: ALL_ISH } })
const groupList = q(api.groupList, { query: { limit: ALL_ISH } })

export async function clientLoader() {
  await Promise.all([
    queryClient.prefetchQuery(policyView),
    queryClient.prefetchQuery(userList),
    queryClient.prefetchQuery(groupList),
  ])
  return null
}

export const handle = { crumb: 'Silo Access' }

type AccessRow = {
  id: string
  name: string
  identityType: IdentityType
  role: SiloRole
}

const colHelper = createColumnHelper<AccessRow>()

const EmptyState = ({ onClick }: { onClick: () => void }) => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Access24Icon />}
      title="No silo roles assigned"
      body="Give permission to view, edit, or administer this silo."
      buttonText="Add user or group"
      onClick={onClick}
    />
  </TableEmptyBox>
)

export default function SiloAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<AccessRow | null>(null)

  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const { data: users } = usePrefetchedQuery(userList)
  const { data: groups } = usePrefetchedQuery(groupList)

  const { mutateAsync: updatePolicy } = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('policyView')
      addToast({ content: 'Access removed' })
    },
  })

  const rows: AccessRow[] = useMemo(() => {
    const userById = new Map(users.items.map((u) => [u.id, u]))
    const groupById = new Map(groups.items.map((g) => [g.id, g]))

    const userRows: AccessRow[] = siloPolicy.roleAssignments
      .filter((ra) => ra.identityType === 'silo_user')
      .map((ra) => ({
        id: ra.identityId,
        name: userById.get(ra.identityId)?.displayName ?? ra.identityId,
        identityType: 'silo_user' as IdentityType,
        role: ra.roleName,
      }))

    const groupRows: AccessRow[] = siloPolicy.roleAssignments
      .filter((ra) => ra.identityType === 'silo_group')
      .map((ra) => ({
        id: ra.identityId,
        name: groupById.get(ra.identityId)?.displayName ?? ra.identityId,
        identityType: 'silo_group' as IdentityType,
        role: ra.roleName,
      }))

    return [...groupRows, ...userRows].sort(byGroupThenName)
  }, [siloPolicy, users, groups])

  const columns = useMemo(
    () => [
      colHelper.accessor('name', { header: 'Name' }),
      colHelper.accessor('identityType', {
        header: 'Type',
        cell: (info) => identityTypeLabel[info.getValue()],
      }),
      colHelper.accessor('role', {
        header: 'Silo Role',
        cell: (info) => (
          <Badge color={roleColor[info.getValue()]}>silo.{info.getValue()}</Badge>
        ),
      }),
      getActionsCol((row: AccessRow) => [
        {
          label: 'Change role',
          onActivate: () => setEditingRow(row),
        },
        {
          label: 'Remove role',
          onActivate: confirmDelete({
            doDelete: () => updatePolicy({ body: deleteRole(row.id, siloPolicy) }),
            label: (
              <span>
                the <HL>{row.role}</HL> role for <HL>{row.name}</HL>
              </span>
            ),
          }),
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

  useQuickActions(
    () => [
      {
        value: 'Add user or group',
        navGroup: 'Actions',
        action: () => setAddModalOpen(true),
      },
    ],
    []
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Access24Icon />}>Silo Access</PageTitle>
        <DocsPopover
          heading="access"
          icon={<Access16Icon />}
          summary="Roles determine who can view, edit, or administer this silo and the projects within it. If a user or group has both a silo and project role, the stronger role takes precedence."
          links={[docLinks.keyConceptsIam, docLinks.access, docLinks.identityProviders]}
        />
      </PageHeader>
      <TableActions>
        <CreateButton onClick={() => setAddModalOpen(true)}>Add user or group</CreateButton>
      </TableActions>
      {addModalOpen && (
        <SiloAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={siloPolicy}
        />
      )}
      {editingRow && (
        <SiloAccessEditUserSideModal
          onDismiss={() => setEditingRow(null)}
          policy={siloPolicy}
          name={editingRow.name}
          identityId={editingRow.id}
          identityType={editingRow.identityType}
          defaultValues={{ roleName: editingRow.role }}
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
