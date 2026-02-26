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
  useUserRows,
  type FleetRole,
  type IdentityType,
} from '@oxide/api'
import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import {
  SystemAccessAddUserSideModal,
  SystemAccessEditUserSideModal,
} from '~/forms/system-access'
import { useCurrentUser } from '~/hooks/use-current-user'
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
import { docLinks } from '~/util/links'

const EmptyState = ({ onClick }: { onClick: () => void }) => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Access24Icon />}
      title="No authorized users"
      body="Give permission to view, edit, or administer this fleet"
      buttonText="Add user or group"
      onClick={onClick}
    />
  </TableEmptyBox>
)

const systemPolicyView = q(api.systemPolicyView, {})
const userList = q(api.userList, {})
const groupList = q(api.groupList, {})

export async function clientLoader() {
  await Promise.all([
    queryClient.prefetchQuery(systemPolicyView),
    // used to resolve user names
    queryClient.prefetchQuery(userList),
    queryClient.prefetchQuery(groupList),
  ])
  return null
}

export const handle = { crumb: 'System Access' }

type UserRow = {
  id: string
  identityType: IdentityType
  name: string
  fleetRole: FleetRole
}

const colHelper = createColumnHelper<UserRow>()

export default function SystemAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<UserRow | null>(null)

  const { me } = useCurrentUser()
  const { data: fleetPolicy } = usePrefetchedQuery(systemPolicyView)
  const fleetRows = useUserRows(fleetPolicy.roleAssignments, 'fleet')

  const rows = useMemo(() => {
    return groupBy(fleetRows, (u) => u.id)
      .map(([userId, userAssignments]) => {
        const { name, identityType, roleName: fleetRole } = userAssignments[0]

        const row: UserRow = {
          id: userId,
          identityType,
          name,
          fleetRole,
        }

        return row
      })
      .sort(byGroupThenName)
  }, [fleetRows])

  const { mutateAsync: updatePolicy } = useApiMutation(api.systemPolicyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('systemPolicyView')
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
      colHelper.accessor('fleetRole', {
        header: 'Role',
        cell: (info) => {
          const role = info.getValue()
          return <Badge color={roleColor[role]}>fleet.{role}</Badge>
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
            doDelete: () =>
              updatePolicy({
                // we know policy is there, otherwise there's no row to display
                body: deleteRole(row.id, fleetPolicy),
              }),
            label: (
              <span>
                the <HL>{row.fleetRole}</HL> role for <HL>{row.name}</HL>
              </span>
            ),
            extraContent:
              row.id === me.id ? 'This will remove your own fleet access.' : undefined,
          }),
        },
      ]),
    ],
    [fleetPolicy, updatePolicy, me]
  )

  const tableInstance = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Access24Icon />}>System Access</PageTitle>
        <DocsPopover
          heading="access"
          icon={<Access16Icon />}
          summary="Roles determine who can view, edit, or administer this fleet."
          links={[docLinks.keyConceptsIam, docLinks.access]}
        />
      </PageHeader>

      <TableActions>
        <CreateButton onClick={() => setAddModalOpen(true)}>Add user or group</CreateButton>
      </TableActions>
      {addModalOpen && (
        <SystemAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={fleetPolicy}
        />
      )}
      {editingUserRow && (
        <SystemAccessEditUserSideModal
          onDismiss={() => setEditingUserRow(null)}
          policy={fleetPolicy}
          name={editingUserRow.name}
          identityId={editingUserRow.id}
          identityType={editingUserRow.identityType}
          defaultValues={{ roleName: editingUserRow.fleetRole }}
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
