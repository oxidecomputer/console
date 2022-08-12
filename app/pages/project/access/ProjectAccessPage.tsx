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
import type { ProjectRole, UserAccessRow } from '@oxide/api'
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
    // used in useUserAccessRows to resolve user names
    apiQueryClient.prefetchQuery('userList', { limit: 200 }),
  ])
}

type UserRow = UserAccessRow<ProjectRole>

const colHelper = createColumnHelper<UserRow>()

export function ProjectAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<UserRow | null>(null)
  const projectParams = useRequiredParams('orgName', 'projectName')
  const { orgName } = projectParams
  const { data: siloPolicy } = useApiQuery('policyView', {})
  const { data: orgPolicy } = useApiQuery('organizationPolicyView', { orgName })
  const { data: projectPolicy } = useApiQuery('projectPolicyView', projectParams)

  const siloRows = useUserRows(siloPolicy?.roleAssignments, 'silo')
  const orgRows = useUserRows(orgPolicy?.roleAssignments, 'org')
  const projectRows = useUserRows(projectPolicy?.roleAssignments, 'project')
  const rows = useMemo(
    () => sortBy(siloRows.concat(orgRows, projectRows), (u) => u.id),
    [siloRows, orgRows, projectRows]
  )

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
              ...projectParams,
              // we know policy is there, otherwise there's no row to display
              body: setUserRole(row.id, null, projectPolicy!),
            })
          },
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
        <Button size="xs" variant="default" onClick={() => setAddModalOpen(true)}>
          Add user to project
        </Button>
      </TableActions>
      {projectPolicy && (
        <ProjectAccessAddUserSideModal
          isOpen={addModalOpen}
          onDismiss={() => setAddModalOpen(false)}
          // has to be project policy and not combined because you can still add a
          // user who's on the silo or org to the project policy
          // TODO: compute user list explicitly here instead of doing it inside
          // the modal
          policy={projectPolicy}
        />
      )}
      {projectPolicy && editingUserRow && (
        <ProjectAccessEditUserSideModal
          isOpen={!!editingUserRow}
          onDismiss={() => setEditingUserRow(null)}
          policy={projectPolicy}
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
