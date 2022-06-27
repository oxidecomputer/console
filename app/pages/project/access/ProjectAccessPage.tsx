import { getCoreRowModel, useTableInstance } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import {
  projectRoleOrder,
  setUserRole,
  useApiMutation,
  useApiQueryClient,
  useUserAccessRows,
} from '@oxide/api'
import type { ProjectRole, UserAccessRow } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Table, createTable, getActionsCol } from '@oxide/table'
import { Access24Icon, Badge, Button, PageHeader, PageTitle, TableActions } from '@oxide/ui'

import {
  ProjectAccessAddUserSideModal,
  ProjectAccessEditUserSideModal,
} from 'app/forms/project-access'
import { useParams } from 'app/hooks'

type UserRow = UserAccessRow<ProjectRole>

const table = createTable().setRowType<UserRow>()

export const ProjectAccessPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<UserRow | null>(null)
  const projectParams = useParams('orgName', 'projectName')
  const { data: policy } = useApiQuery(
    'organizationProjectsGetProjectPolicy',
    projectParams
  )

  const rows = useUserAccessRows(policy, projectRoleOrder)

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('organizationProjectsPutProjectPolicy', {
    onSuccess: () =>
      queryClient.invalidateQueries('organizationProjectsGetProjectPolicy', projectParams),
    // TODO: handle 403
  })

  // TODO: checkboxes and bulk delete? not sure
  // TODO: disable delete on permissions you can't delete

  const columns = useMemo(
    () => [
      table.createDataColumn('id', { header: 'ID' }),
      table.createDataColumn('roleName', {
        header: 'Role',
        cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
      }),
      table.createDisplayColumn(
        getActionsCol((row) => [
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
        ])
      ),
    ],
    [policy, projectParams, updatePolicy]
  )

  const tableInstance = useTableInstance(table, {
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
        <Button size="xs" variant="secondary" onClick={() => setAddModalOpen(true)}>
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
      <Table table={tableInstance} />
    </>
  )
}
