import { getCoreRowModel, useTableInstance } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { getProjectRole, setUserRole, useApiMutation, useApiQueryClient } from '@oxide/api'
import type { ProjectRole } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Table, createTable, getActionsCol } from '@oxide/table'
import { Access24Icon, Badge, Button, PageHeader, PageTitle, TableActions } from '@oxide/ui'
import { groupBy } from '@oxide/util'

import {
  ProjectAccessAddUserSideModal,
  ProjectAccessEditUserSideModal,
} from 'app/forms/project-access'
import { useParams } from 'app/hooks'

type UserRow = {
  id: string
  name: string
  roleName: ProjectRole
}

const table = createTable().setRowType<UserRow>()

// when you build this page for real, check the git history of this file. there
// might be something useful in the old placeholder
export const ProjectAccessPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<UserRow | null>(null)
  const projectParams = useParams('orgName', 'projectName')
  const { data: policy } = useApiQuery(
    'organizationProjectsGetProjectPolicy',
    projectParams
  )

  // TODO: this hits /users, which returns system users, not silo users. We need
  // an endpoint to list silo users. I'm hoping we might end up using /users for
  // that. See https://github.com/oxidecomputer/omicron/issues/1235
  const { data: users } = useApiQuery('usersGet', { limit: 200 })

  // HACK: because the policy has no names, we are fetching ~all the users,
  // putting them in a dictionary, and adding the names to the rows
  const usersDict = useMemo(
    () => Object.fromEntries((users?.items || []).map((u) => [u.id, u])),
    [users]
  )

  const rows: UserRow[] = useMemo(() => {
    // each group represents a user with multiple role assignments
    const groups = groupBy(policy?.roleAssignments || [], (u) => u.identityId)
    return Object.entries(groups).map(([userId, roleAssignments]) => ({
      id: userId,
      name: usersDict[userId]?.name || '',
      // assert non-null because we know there has to be one, otherwise there
      // wouldn't be a group
      roleName: getProjectRole(roleAssignments.map((ra) => ra.roleName))!,
    }))
  }, [policy, usersDict])

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
      table.createDataColumn('name', { header: 'Name' }),
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
