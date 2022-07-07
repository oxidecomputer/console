import { createColumnHelper } from '@tanstack/react-table'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  projectRoleOrder,
  setUserRole,
  useApiMutation,
  useApiQueryClient,
  useUserAccessRows,
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
  await Promise.all([
    apiQueryClient.prefetchQuery('projectPolicyView', requireProjectParams(params)),
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
  const { data: policy } = useApiQuery('projectPolicyView', projectParams)
  const { data: orgPolicy } = useApiQuery('organizationPolicyView', {
    orgName: projectParams.orgName,
  })

  // user can also get roles from the silo (and possibly the fleet?) but the
  // silo policy view endpoint is `/silos/:siloName/policy`, and we don't have
  // the silo name, so we can't fetch it yet. need to think about this

  const combinedPolicy = {
    roleAssignments: [
      ...(policy?.roleAssignments || []),
      ...(orgPolicy?.roleAssignments || []),
    ],
  }

  const rows = useUserAccessRows(combinedPolicy, projectRoleOrder)

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
              ...projectParams,
              // we know policy is there, otherwise there's no row to display
              body: setUserRole(row.id, null, policy!),
            })
          },
        },
      ]),
    ],
    [policy, projectParams, updatePolicy]
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
      {policy && (
        <ProjectAccessAddUserSideModal
          isOpen={addModalOpen}
          onDismiss={() => setAddModalOpen(false)}
          policy={policy}
        />
      )}
      {policy && editingUserRow && (
        <ProjectAccessEditUserSideModal
          isOpen={!!editingUserRow}
          onDismiss={() => setEditingUserRow(null)}
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
