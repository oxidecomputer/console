import '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import type { IdentityType, RoleKey } from '@oxide/api'
import { toPathQuery } from '@oxide/api'
import {
  apiQueryClient,
  byGroupThenName,
  deleteRole,
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
import {
  ProjectAccessAddUserSideModal,
  ProjectAccessEditUserSideModal,
} from 'app/forms/project-access'
import { getProjectSelector, useProjectSelector } from 'app/hooks'

const EmptyState = ({ onClick }: { onClick: () => void }) => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Access24Icon />}
      title="No authorized users"
      body="Give permission to view, edit, or administer this project"
      buttonText="Add user or group to project"
      onClick={onClick}
    />
  </TableEmptyBox>
)

ProjectAccessPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { organization, project } = getProjectSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('policyViewV1', {}),
    apiQueryClient.prefetchQuery('organizationPolicyViewV1', { path: { organization } }),
    apiQueryClient.prefetchQuery('projectPolicyViewV1', {
      path: { project },
      query: { organization },
    }),
    // used to resolve user names
    apiQueryClient.prefetchQuery('userList', {}),
    apiQueryClient.prefetchQuery('groupList', {}),
  ])
  return null
}

type UserRow = {
  id: string
  identityType: IdentityType
  name: string
  siloRole: RoleKey | undefined
  orgRole: RoleKey | undefined
  projectRole: RoleKey | undefined
  effectiveRole: RoleKey
}

const colHelper = createColumnHelper<UserRow>()

export function ProjectAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<UserRow | null>(null)
  const projectSelector = useProjectSelector()
  const projectPathQuery = toPathQuery('project', projectSelector)
  const { organization } = projectSelector

  const { data: siloPolicy } = useApiQuery('policyViewV1', {})
  const siloRows = useUserRows(siloPolicy?.roleAssignments, 'silo')

  const { data: orgPolicy } = useApiQuery('organizationPolicyViewV1', {
    path: { organization },
  })
  const orgRows = useUserRows(orgPolicy?.roleAssignments, 'org')

  const { data: projectPolicy } = useApiQuery('projectPolicyViewV1', projectPathQuery)
  const projectRows = useUserRows(projectPolicy?.roleAssignments, 'project')

  const rows = useMemo(() => {
    return groupBy(siloRows.concat(orgRows, projectRows), (u) => u.id)
      .map(([userId, userAssignments]) => {
        const siloRole = userAssignments.find((a) => a.roleSource === 'silo')?.roleName
        const orgRole = userAssignments.find((a) => a.roleSource === 'org')?.roleName
        const projectRole = userAssignments.find(
          (a) => a.roleSource === 'project'
        )?.roleName

        const roles = [siloRole, orgRole, projectRole].filter(isTruthy)

        const { name, identityType } = userAssignments[0]

        const row: UserRow = {
          id: userId,
          identityType,
          name,
          siloRole,
          orgRole,
          projectRole,
          // we know there has to be at least one
          effectiveRole: getEffectiveRole(roles)!,
        }

        return row
      })
      .sort(byGroupThenName)
  }, [siloRows, orgRows, projectRows])

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('projectPolicyUpdateV1', {
    onSuccess: () => queryClient.invalidateQueries('projectPolicyViewV1', projectPathQuery),
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
      colHelper.accessor('projectRole', {
        header: 'Project role',
        cell: RoleBadgeCell,
      }),
      // TODO: tooltips on disabled elements explaining why
      getActionsCol((row: UserRow) => [
        {
          label: 'Change role',
          onActivate: () => setEditingUserRow(row),
          disabled:
            !row.projectRole && "You don't have permission to change this user's role",
        },
        // TODO: only show if you have permission to do this
        {
          label: 'Delete',
          onActivate() {
            // TODO: confirm delete
            updatePolicy.mutate({
              ...projectPathQuery,
              // we know policy is there, otherwise there's no row to display
              body: deleteRole(row.id, projectPolicy!),
            })
          },
          disabled: !row.projectRole && "You don't have permission to delete this user",
        },
      ]),
    ],
    [projectPolicy, projectPathQuery, updatePolicy]
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
      {projectPolicy && addModalOpen && (
        <ProjectAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={projectPolicy}
        />
      )}
      {projectPolicy && editingUserRow?.projectRole && (
        <ProjectAccessEditUserSideModal
          onDismiss={() => setEditingUserRow(null)}
          policy={projectPolicy}
          identityId={editingUserRow.id}
          identityType={editingUserRow.identityType}
          defaultValues={{ roleName: editingUserRow.projectRole }}
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
