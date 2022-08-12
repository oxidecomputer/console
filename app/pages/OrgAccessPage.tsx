import { createColumnHelper } from '@tanstack/react-table'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  setUserRole,
  useApiMutation,
  useApiQueryClient,
  useUserRows,
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
import { sortBy } from '@oxide/util'

import { OrgAccessAddUserSideModal, OrgAccessEditUserSideModal } from 'app/forms/org-access'
import { requireOrgParams, useRequiredParams } from 'app/hooks'

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

OrgAccessPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await Promise.all([
    apiQueryClient.prefetchQuery('policyView', {}),
    apiQueryClient.prefetchQuery('organizationPolicyView', requireOrgParams(params)),
    // used in useUserAccessRows to resolve user names
    apiQueryClient.prefetchQuery('userList', { limit: 200 }),
  ])
}

type UserRow = UserAccessRow<OrganizationRole>

const colHelper = createColumnHelper<UserRow>()

export function OrgAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<UserRow | null>(null)
  const orgParams = useRequiredParams('orgName')
  const { data: siloPolicy } = useApiQuery('policyView', {})
  const { data: orgPolicy } = useApiQuery('organizationPolicyView', orgParams)

  const orgRows = useUserRows(orgPolicy?.roleAssignments, 'org')
  const siloRows = useUserRows(siloPolicy?.roleAssignments, 'silo')
  const rows = useMemo(
    () => sortBy(orgRows.concat(siloRows), (u) => u.id),
    [orgRows, siloRows]
  )

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
        cell: (info) => <Badge>{info.getValue()}</Badge>,
      }),
      colHelper.accessor('roleSource', {
        header: 'Role source',
        cell: (info) => <Badge>{info.getValue()}</Badge>,
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
              body: setUserRole(row.id, null, orgPolicy!),
            })
          },
        },
      ]),
    ],
    [orgPolicy, orgParams, updatePolicy]
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
      {orgPolicy && (
        <OrgAccessAddUserSideModal
          isOpen={addModalOpen}
          onDismiss={() => setAddModalOpen(false)}
          onSuccess={() => setAddModalOpen(false)}
          // has to be org policy and not combined because you can still add a
          // user who's on the silo to the org policy
          // TODO: compute user list explicitly here instead of doing it inside
          // the modal
          policy={orgPolicy}
        />
      )}
      {orgPolicy && editingUserRow && (
        <OrgAccessEditUserSideModal
          isOpen={!!editingUserRow}
          onDismiss={() => setEditingUserRow(null)}
          onSuccess={() => setEditingUserRow(null)}
          policy={orgPolicy}
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
