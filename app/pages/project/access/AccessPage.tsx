import { getCoreRowModel, useTableInstance } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { useApiQuery } from '@oxide/api'
import { Table, createTable } from '@oxide/table'
import {
  Access24Icon,
  Button,
  PageHeader,
  PageTitle,
  Success16Icon,
  TableActions,
  Unauthorized12Icon,
} from '@oxide/ui'
import { groupBy } from '@oxide/util'

import { AddUserToProjectForm } from 'app/forms/add-user-to-project'
import { useParams } from 'app/hooks'

const AccessIcon = ({ value }: { value: boolean }) => (
  <div className="text-center">
    {value ? (
      <Success16Icon title="Permitted" className="text-accent" />
    ) : (
      <Unauthorized12Icon title="Prohibited" className="text-error" />
    )}
  </div>
)

type RoleRow = {
  id: string
  name: string
  admin: boolean
  collaborator: boolean
  viewer: boolean
}

const table = createTable().setRowType<RoleRow>()

const columns = [
  table.createDataColumn('id', { header: 'ID' }),
  table.createDataColumn('name', { header: 'Name' }),
  table.createDataColumn('viewer', {
    header: 'Viewer',
    cell: (info) => <AccessIcon value={info.getValue()} />,
  }),
  table.createDataColumn('collaborator', {
    header: 'Collaborator',
    cell: (info) => <AccessIcon value={info.getValue()} />,
  }),
  table.createDataColumn('admin', {
    header: 'Admin',
    cell: (info) => <AccessIcon value={info.getValue()} />,
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
      admin: roleAssignments.some((ra) => ra.roleName === 'admin'),
      collaborator: roleAssignments.some((ra) => ra.roleName === 'collaborator'),
      viewer: roleAssignments.some((ra) => ra.roleName === 'viewer'),
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
