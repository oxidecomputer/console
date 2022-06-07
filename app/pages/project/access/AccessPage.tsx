import { useMemo, useState } from 'react'
import { getCoreRowModel, useTableInstance } from '@tanstack/react-table'

import type { ProjectRolesRoleAssignment } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { createTable, Table } from '@oxide/table'
import {
  Access24Icon,
  Button,
  PageHeader,
  PageTitle,
  SideModal,
  TableActions,
} from '@oxide/ui'
import { useParams } from 'app/hooks'
import { AddUserToProjectForm } from 'app/forms/add-user-to-project'

const table = createTable().setRowType<ProjectRolesRoleAssignment>()

const columns = [
  table.createDataColumn('identityId', {
    header: 'User',
    cell: (info) => <div>{info.getValue()}</div>,
  }),
  table.createDataColumn('roleName', {
    header: 'Role',
    cell: (info) => <div>{info.getValue()}</div>,
  }),
]

// when you build this page for real, check the git history of this file. there
// might be something useful in the old placeholder
export const AccessPage = () => {
  const projectParams = useParams('orgName', 'projectName')
  const { data: policy } = useApiQuery(
    'organizationProjectsGetProjectPolicy',
    projectParams
  )

  const [addModalOpen, setAddModalOpen] = useState(false)

  const data = useMemo(() => policy?.roleAssignments || [], [policy])

  // TODO: to match the design, rather than listing every role a user has on a
  // project we need to aggregate all the roles for each user into one row, with
  // checkmarks indicating which roles they have. One interesting consequence of
  // this is that QueryTable will not work as-is for this purpose because it
  // doesn't support aggregation. We could extend the API of useQueryTable to
  // include this, but I think it would make more sense to break it up into
  // composable pieces instead.

  // TODO: delete action on table rows

  // TODO: checkboxes and bulk delete? not sure

  // TODO: disable delete on permissions you can't delete, like your own?

  const tableInstance = useTableInstance(table, {
    columns,
    data,
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
      <SideModal
        id="add-user-to-project-modal"
        isOpen={addModalOpen}
        onDismiss={() => setAddModalOpen(false)}
      >
        <AddUserToProjectForm onSubmit={() => setAddModalOpen(false)} />
      </SideModal>
      <Table table={tableInstance} />
    </>
  )
}
