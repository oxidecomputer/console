import { createColumnHelper } from '@tanstack/react-table'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  getEffectiveProjectRole,
  setUserRole,
  useApiMutation,
  useApiQueryClient,
  useUserRows,
} from '@oxide/api'
import type { OrganizationRole, ProjectRole, SiloRole } from '@oxide/api'
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
import {
  ProjectAccessAddUserSideModal,
  ProjectAccessEditUserSideModal,
} from 'app/forms/project-access'
import { requireProjectParams, useRequiredParams } from 'app/hooks'

const EmptyState = ({ onClick }: { onClick: () => void }) => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Access24Icon />}
      title="No authorized users"
      body="Give permission to view, edit, or administer this project"
      buttonText="Add user to project"
      onClick={onClick}
    />
  </TableEmptyBox>
)

ProjectAccessPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { orgName, projectName } = requireProjectParams(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('policyView', {}),
    apiQueryClient.prefetchQuery('organizationPolicyView', { orgName }),
    apiQueryClient.prefetchQuery('projectPolicyView', { orgName, projectName }),
    // used to resolve user names
    apiQueryClient.prefetchQuery('userList', {}),
  ])
}

type UserRow = {
  id: string
  name: string
  siloRole: SiloRole | undefined
  orgRole: OrganizationRole | undefined
  projectRole: ProjectRole | undefined
  // all these types are the same but this is strictly more correct than using one
  effectiveRole: SiloRole | OrganizationRole | ProjectRole
}

const colHelper = createColumnHelper<UserRow>()

export function ProjectAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<UserRow | null>(null)
  const projectParams = useRequiredParams('orgName', 'projectName')
  const { orgName } = projectParams

  const { data: siloPolicy } = useApiQuery('policyView', {})
  const siloRows = useUserRows(siloPolicy?.roleAssignments, 'silo')

  const { data: orgPolicy } = useApiQuery('organizationPolicyView', { orgName })
  const orgRows = useUserRows(orgPolicy?.roleAssignments, 'org')

  const { data: projectPolicy } = useApiQuery('projectPolicyView', projectParams)
  const projectRows = useUserRows(projectPolicy?.roleAssignments, 'project')

  const rows = useMemo(() => {
    const users = groupBy(siloRows.concat(orgRows, projectRows), (u) => u.id).map(
      ([userId, userAssignments]) => {
        const siloRole = userAssignments.find((a) => a.roleSource === 'silo')?.roleName
        const orgRole = userAssignments.find((a) => a.roleSource === 'org')?.roleName
        const projectRole = userAssignments.find(
          (a) => a.roleSource === 'project'
        )?.roleName

        const roles = [siloRole, orgRole, projectRole].filter(isTruthy)

        const row: UserRow = {
          id: userId,
          name: userAssignments[0].name,
          siloRole,
          orgRole,
          projectRole,
          // we know there has to be at least one
          effectiveRole: getEffectiveProjectRole(roles)!,
        }

        return row
      }
    )
    return sortBy(users, (u) => u.name)
  }, [siloRows, orgRows, projectRows])

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('projectPolicyUpdate', {
    onSuccess: () => queryClient.invalidateQueries('projectPolicyView', projectParams),
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
      colHelper.accessor('projectRole', {
        header: 'Project role',
        cell: RoleBadgeCell,
      }),
      // TODO: tooltips on disabled elements explaining why
      getActionsCol((row: UserRow) => [
        {
          label: 'Change role',
          onActivate: () => setEditingUserRow(row),
          disabled: !row.projectRole,
        },
        // TODO: only show if you have permission to do this
        {
          label: 'Delete',
          onActivate() {
            // TODO: confirm delete
            updatePolicy.mutate({
              ...projectParams,
              // we know policy is there, otherwise there's no row to display
              body: setUserRole(row.id, null, projectPolicy!),
            })
          },
          disabled: !row.projectRole,
        },
      ]),
    ],
    [projectPolicy, projectParams, updatePolicy]
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
        <Button size="sm" variant="default" onClick={() => setAddModalOpen(true)}>
          Add user to project
        </Button>
      </TableActions>
      {projectPolicy && (
        <ProjectAccessAddUserSideModal
          isOpen={addModalOpen}
          onDismiss={() => setAddModalOpen(false)}
          policy={projectPolicy}
        />
      )}
      {projectPolicy && editingUserRow?.projectRole && (
        <ProjectAccessEditUserSideModal
          isOpen={!!editingUserRow}
          onDismiss={() => setEditingUserRow(null)}
          policy={projectPolicy}
          userId={editingUserRow.id}
          initialValues={{ roleName: editingUserRow.projectRole }}
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
