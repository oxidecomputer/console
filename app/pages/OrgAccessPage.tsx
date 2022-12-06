import { useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import type { IdentityType, RoleKey } from '@oxide/api'
import { deleteRole } from '@oxide/api'
import {
  apiQueryClient,
  byGroupThenName,
  getEffectiveRole,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  useUserRows,
} from '@oxide/api'
import { Table, createColumnHelper, getActionsCol, useReactTable } from '@oxide/table'
import {
  Access24Icon,
  Button,
  EmptyMessage,
  PageHeader,
  PageTitle,
  TableActions,
  TableEmptyBox,
} from '@oxide/ui'
import { groupBy, isTruthy } from '@oxide/util'

import { AccessNameCell } from 'app/components/AccessNameCell'
import { RoleBadgeCell } from 'app/components/RoleBadgeCell'
import { OrgAccessAddUserSideModal, OrgAccessEditUserSideModal } from 'app/forms/org-access'
import { requireOrgParams, useRequiredParams } from 'app/hooks'

const EmptyState = ({ onClick }: { onClick: () => void }) => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Access24Icon />}
      title="No authorized users"
      body="Give permission to view, edit, or administer this organization"
      buttonText="Add user or group to organization"
      onClick={onClick}
    />
  </TableEmptyBox>
)

OrgAccessPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await Promise.all([
    apiQueryClient.prefetchQuery('policyView', {}),
    apiQueryClient.prefetchQuery('organizationPolicyView', {
      path: requireOrgParams(params),
    }),
    // used to resolve user names
    apiQueryClient.prefetchQuery('userList', {}),
    apiQueryClient.prefetchQuery('groupList', {}),
  ])
}

type UserRow = {
  id: string
  identityType: IdentityType
  name: string
  siloRole: RoleKey | undefined
  orgRole: RoleKey | undefined
  // all these types are the same but this is strictly more correct than using one
  effectiveRole: RoleKey
}

const colHelper = createColumnHelper<UserRow>()

export function OrgAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<UserRow | null>(null)
  const orgParams = useRequiredParams('orgName')

  const { data: siloPolicy } = useApiQuery('policyView', {})
  const siloRows = useUserRows(siloPolicy?.roleAssignments, 'silo')

  const { data: orgPolicy } = useApiQuery('organizationPolicyView', { path: orgParams })
  const orgRows = useUserRows(orgPolicy?.roleAssignments, 'org')

  const rows = useMemo(() => {
    return groupBy(siloRows.concat(orgRows), (u) => u.id)
      .map(([userId, userAssignments]) => {
        const siloRole = userAssignments.find((a) => a.roleSource === 'silo')?.roleName
        const orgRole = userAssignments.find((a) => a.roleSource === 'org')?.roleName

        const roles = [siloRole, orgRole].filter(isTruthy)

        const { name, identityType } = userAssignments[0]

        const row: UserRow = {
          id: userId,
          identityType,
          name,
          siloRole,
          orgRole,
          // we know there has to be at least one
          effectiveRole: getEffectiveRole(roles)!,
        }

        return row
      })
      .sort(byGroupThenName)
  }, [siloRows, orgRows])

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('organizationPolicyUpdate', {
    onSuccess: () =>
      queryClient.invalidateQueries('organizationPolicyView', { path: orgParams }),
    // TODO: handle 403
  })

  // TODO: checkboxes and bulk delete? not sure
  // TODO: disable delete on permissions you can't delete

  const columns = useMemo(
    () => [
      colHelper.accessor('id', { header: 'ID' }),
      colHelper.accessor('name', { header: 'Name', cell: AccessNameCell }),
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
          disabled: !row.orgRole && "You don't have permission to change this user's role",
        },
        // TODO: only show if you have permission to do this
        {
          label: 'Delete',
          onActivate() {
            // TODO: confirm delete
            updatePolicy.mutate({
              path: orgParams,
              // we know policy is there, otherwise there's no row to display
              body: deleteRole(row.id, orgPolicy!),
            })
          },
          disabled: !row.orgRole && "You don't have permission to delete this user",
        },
      ]),
    ],
    [orgPolicy, orgParams, updatePolicy]
  )

  const tableInstance = useReactTable({ columns, data: rows })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Access24Icon />}>Access &amp; IAM</PageTitle>
      </PageHeader>

      <TableActions>
        <Button size="sm" onClick={() => setAddModalOpen(true)}>
          Add user or group
        </Button>
      </TableActions>
      {orgPolicy && addModalOpen && (
        <OrgAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={orgPolicy}
        />
      )}
      {orgPolicy && editingUserRow?.orgRole && (
        <OrgAccessEditUserSideModal
          onDismiss={() => setEditingUserRow(null)}
          policy={orgPolicy}
          identityId={editingUserRow.id}
          identityType={editingUserRow.identityType}
          defaultValues={{ roleName: editingUserRow.orgRole }}
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
