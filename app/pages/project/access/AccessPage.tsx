import { getCoreRowModel, useTableInstance } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { getProjectRole } from '@oxide/api'
import type { ProjectRole } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Table, createTable } from '@oxide/table'
import { Access24Icon, Badge, Button, PageHeader, PageTitle, TableActions } from '@oxide/ui'
import { groupBy } from '@oxide/util'

import { AddUserToProjectForm } from 'app/forms/add-user-to-project'
import { useParams } from 'app/hooks'

type RoleRow = {
  id: string
  name: string
  role: ProjectRole
}

const table = createTable().setRowType<RoleRow>()

const columns = [
  table.createDataColumn('id', { header: 'ID' }),
  table.createDataColumn('name', { header: 'Name' }),
  table.createDataColumn('role', {
    header: 'Role',
    cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
  }),
]

// when you build this page for real, check the git history of this file. there
// might be something useful in the old placeholder
export const AccessPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const projectParams = useParams('orgName', 'projectName')
  const { data: policy } = useApiQuery(
    'organizationProjectsGetProjectPolicy',
    projectParams
  )

  const { data: users } = useApiQuery('usersGet', { limit: 200 })

  // HACK: because the policy has no names, we are fetching ~all the users,
  // putting them in a dictionary, and adding the names to the rows
  const usersDict = useMemo(
    () => Object.fromEntries((users?.items || []).map((u) => [u.id, u])),
    [users]
  )

  const rows: RoleRow[] = useMemo(() => {
    // each group represents a user with multiple role assignments
    const groups = groupBy(policy?.roleAssignments || [], (u) => u.identityId)
    return Object.entries(groups).map(([userId, roleAssignments]) => ({
      id: userId,
      name: usersDict[userId]?.name || '',
      // assert non-null because we know there has to be one, otherwise there
      // wouldn't be a group
      role: getProjectRole(roleAssignments.map((ra) => ra.roleName))!,
    }))
  }, [policy, usersDict])

  // TODO: delete action on table rows
  // TODO: checkboxes and bulk delete? not sure
  // TODO: disable delete on permissions you can't delete

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
      <AddUserToProjectForm
        isOpen={addModalOpen}
        onDismiss={() => setAddModalOpen(false)}
        onSuccess={() => setAddModalOpen(false)}
      />
      <Table table={tableInstance} />
    </>
  )
}
