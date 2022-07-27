import { createColumnHelper } from '@tanstack/react-table'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import {
  orgRoleOrder,
  setUserRole,
  useApiMutation,
  useApiQueryClient,
  useUserAccessRows,
} from '@oxide/api'
import type { OrganizationRole, UserAccessRow } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Table, getActionsCol } from '@oxide/table'
import {
  Access24Icon,
  Badge,
  Button,
  EmptyMessage,
  PageHeader,
  PageTitle,
  TableActions,
  TableEmptyBox,
} from '@oxide/ui'

import { OrgAccessAddUserSideModal, OrgAccessEditUserSideModal } from 'app/forms/org-access'
import { useRequiredParams } from 'app/hooks'

type UserRow = UserAccessRow<OrganizationRole>

const EmptyState = ({ onClick }: { onClick: () => void }) => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Access24Icon />}
      title="No authorized users"
      body="Give permission to view, edit, or administer this organization"
      buttonText="Add user to organization"
      onClick={onClick}
    />
  </TableEmptyBox>
)

const colHelper = createColumnHelper<UserRow>()

export const OrgAccessPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<UserRow | null>(null)
  const orgParams = useRequiredParams('orgName')
  const { data: policy } = useApiQuery('organizationPolicyView', orgParams)

  const rows = useUserAccessRows(policy, orgRoleOrder)

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('organizationPolicyUpdate', {
    onSuccess: () => queryClient.invalidateQueries('organizationPolicyView', orgParams),
    // TODO: handle 403
  })

  // TODO: checkboxes and bulk delete? not sure
  // TODO: disable delete on permissions you can't delete

  const columns = useMemo(
    () => [
      colHelper.accessor('id', { header: 'ID' }),
      colHelper.accessor('name', { header: 'Name' }),
      colHelper.accessor('roleName', {
        header: 'Role',
        cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
      }),
      getActionsCol((row: UserRow) => [
        {
          label: 'Change role',
          onActivate: () => setEditingUserRow(row),
        },
        // TODO: only show if you have permission to do this
        {
          label: 'Delete',
          onActivate() {
            // TODO: confirm delete
            updatePolicy.mutate({
              ...orgParams,
              // we know policy is there, otherwise there's no row to display
              body: setUserRole(row.id, null, policy!),
            })
          },
        },
      ]),
    ],
    [policy, orgParams, updatePolicy]
  )

  const tableInstance = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Access24Icon />}>Access &amp; IAM</PageTitle>
      </PageHeader>

      <TableActions>
        <Button size="xs" variant="default" onClick={() => setAddModalOpen(true)}>
          Add user to organization
        </Button>
      </TableActions>
      {policy && (
        <OrgAccessAddUserSideModal
          isOpen={addModalOpen}
          onDismiss={() => setAddModalOpen(false)}
          onSuccess={() => setAddModalOpen(false)}
          policy={policy}
        />
      )}
      {policy && editingUserRow && (
        <OrgAccessEditUserSideModal
          isOpen={!!editingUserRow}
          onDismiss={() => setEditingUserRow(null)}
          onSuccess={() => setEditingUserRow(null)}
          policy={policy}
          userId={editingUserRow.id}
          initialValues={{ roleName: editingUserRow.roleName }}
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
