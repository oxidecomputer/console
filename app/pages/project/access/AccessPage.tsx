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

type Row = ProjectRolesRoleAssignment & { name: string | undefined }

const table = createTable().setRowType<Row>()

const columns = [
  table.createDataColumn('identityId', { header: 'ID' }),
  table.createDataColumn('name', { header: 'Name' }),
  table.createDataColumn('roleName', {
    header: 'Role',
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

  const usersDict = useMemo(
    () => Object.fromEntries((users?.items || []).map((u) => [u.id, u])),
    [users]
  )

  // HACK: because the policy has no names, we are fetching ~all the users,
  // putting them in a dictionary, and adding the names to the rows
  const data = useMemo(
    () =>
      (policy?.roleAssignments || []).map((ra) => ({
        ...ra,
        name: usersDict[ra.identityId]?.name || undefined,
      })),
    [policy, usersDict]
  )

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
