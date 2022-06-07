import { useMemo } from 'react'
import { getCoreRowModel, useTableInstance } from '@tanstack/react-table'

import type { ProjectRolesRoleAssignment } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { createTable, Table } from '@oxide/table'
import { Access24Icon, PageHeader, PageTitle } from '@oxide/ui'
import { useParams } from 'app/hooks'

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

  const data = useMemo(() => policy?.roleAssignments || [], [policy])

  // TODO: to match the design, rather than listing every role a user has on a
  // project we need to aggregate all the roles for each user into one row, with
  // checkmarks indicating which roles they have. One interesting consequence of
  // this is that QueryTable will not work as-is for this purpose because it
  // doesn't support aggregation. We could extend the API of useQueryTable to
  // include this, but I think it would make more sense to break it up into
  // composable pieces instead.

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

      <Table table={tableInstance} />
    </>
  )
}
