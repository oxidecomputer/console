import { createColumnHelper } from '@tanstack/react-table'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  getEffectiveOrgRole,
  setUserRole,
  useApiMutation,
  useApiQueryClient,
  useUserRows,
} from '@oxide/api'
import type { OrganizationRole, SiloRole } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Table, getActionsCol } from '@oxide/table'
import {
  Access24Icon,
  Button,
  EmptyMessage,
  PageHeader,
  PageTitle,
  TableActions,
  TableEmptyBox,
} from '@oxide/ui'
import { groupBy, isTruthy, sortBy } from '@oxide/util'

import { RoleBadgeCell } from 'app/components/RoleBadgeCell'
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
    // used to resolve user names
    apiQueryClient.prefetchQuery('userList', {}),
  ])
}

type UserRow = {
  id: string
  name: string
  siloRole: SiloRole | undefined
  orgRole: OrganizationRole | undefined
  // all these types are the same but this is strictly more correct than using one
  effectiveRole: SiloRole | OrganizationRole
}

const colHelper = createColumnHelper<UserRow>()

export function OrgAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<UserRow | null>(null)
  const orgParams = useRequiredParams('orgName')

  const { data: siloPolicy } = useApiQuery('policyView', {})
  const siloRows = useUserRows(siloPolicy?.roleAssignments, 'silo')

  const { data: orgPolicy } = useApiQuery('organizationPolicyView', orgParams)
  const orgRows = useUserRows(orgPolicy?.roleAssignments, 'org')

  const rows = useMemo(() => {
    const users = groupBy(siloRows.concat(orgRows), (u) => u.id).map(
      ([userId, userAssignments]) => {
        const siloRole = userAssignments.find((a) => a.roleSource === 'silo')?.roleName
        const orgRole = userAssignments.find((a) => a.roleSource === 'org')?.roleName

        const roles = [siloRole, orgRole].filter(isTruthy)

        const row: UserRow = {
          id: userId,
          name: userAssignments[0].name,
          siloRole,
          orgRole,
          // we know there has to be at least one
          effectiveRole: getEffectiveOrgRole(roles)!,
        }

        return row
      }
    )
    return sortBy(users, (u) => u.name)
  }, [siloRows, orgRows])

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
      colHelper.accessor('siloRole', {
        header: 'Silo role',
        cell: RoleBadgeCell,
      }),
      colHelper.accessor('orgRole', {
        header: 'Org role',
        cell: RoleBadgeCell,
      }),
      // TODO: tooltips on disabled elements explaining why
      getActionsCol((row: UserRow) => [
        {
          label: 'Change role',
          onActivate: () => setEditingUserRow(row),
          disabled: !row.orgRole,
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
          disabled: !row.orgRole,
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
          policy={orgPolicy}
        />
      )}
      {orgPolicy && editingUserRow?.orgRole && (
        <OrgAccessEditUserSideModal
          isOpen={!!editingUserRow}
          onDismiss={() => setEditingUserRow(null)}
          onSuccess={() => setEditingUserRow(null)}
          policy={orgPolicy}
          userId={editingUserRow.id}
          initialValues={{ roleName: editingUserRow.orgRole }}
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
