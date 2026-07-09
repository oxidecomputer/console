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
  getEffectiveRole,
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
import { makeCrumb } from '~/hooks/use-crumbs'
import { useCurrentUser } from '~/hooks/use-current-user'
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
import { groupBy } from '~/util/array'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

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

const policyView = q(api.policyView, {})
// full lists to resolve names; the API only sorts by id
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

export const handle = makeCrumb('Silo Access', pb.siloAccess())

type UserRow = {
  id: string
  identityType: IdentityType
  name: string
  siloRole: SiloRole
}

const colHelper = createColumnHelper<UserRow>()

export default function SiloAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<UserRow | null>(null)

  const { me } = useCurrentUser()
  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const { data: users } = usePrefetchedQuery(userList)
  const { data: groups } = usePrefetchedQuery(groupList)

  const rows = useMemo(() => {
    const nameById = new Map(
      [...users.items, ...groups.items].map((u) => [u.id, u.displayName])
    )
    return groupBy(siloPolicy.roleAssignments, (ra) => ra.identityId)
      .map(([userId, assignments]) => {
        const { identityType } = assignments[0]
        // getEffectiveRole because the API allows multiple assignments per
        // identity; non-null because groupBy only creates groups for existing items
        const siloRole = getEffectiveRole(assignments.map((a) => a.roleName))!
        return {
          id: userId,
          identityType,
          name: nameById.get(userId) ?? userId,
          siloRole,
        } satisfies UserRow
      })
      .sort(byGroupThenName)
  }, [siloPolicy, users, groups])

  const { mutateAsync: updatePolicy } = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('policyView')
      addToast({ content: 'Access removed' })
    },
  })

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
          return <Badge color={roleColor[role]}>silo.{role}</Badge>
        },
      }),
      getActionsCol((row: UserRow) => [
        {
          label: 'Change role',
          onActivate: () => setEditingUserRow(row),
        },
        {
          label: 'Delete',
          onActivate: confirmDelete({
            doDelete: () => updatePolicy({ body: deleteRole(row.id, siloPolicy) }),
            label: (
              <span>
                the <HL>{row.siloRole}</HL> role for <HL>{row.name}</HL>
              </span>
            ),
            resourceKind: 'role assignment',
            extraContent:
              row.id === me.id ? 'This will remove your own silo access.' : undefined,
          }),
        },
      ]),
    ],
    [siloPolicy, updatePolicy, me]
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
      {editingUserRow && (
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
