import { Link, Outlet } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { DateCell, useQueryTable } from '@oxide/table'
import { Badge, EmptyMessage, PageHeader, PageTitle, SoftwareUpdate16Icon } from '@oxide/ui'
import { pick } from '@oxide/util'

import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage icon={<SoftwareUpdate16Icon />} title="No updates available" />
)

UpdatePage.loader = async () => {
  await apiQueryClient.prefetchQuery('systemUpdateList', { query: { limit: 10 } })
  return null
}

export function UpdatePage() {
  const { Table, Column } = useQueryTable('systemUpdateList', {})

  return (
    <>
      <PageHeader>
        <PageTitle icon={<SoftwareUpdate16Icon />}>System Update</PageTitle>
      </PageHeader>
      {/* <TableActions>
        <Link to={pb.siloIdpNew({ siloName })} className={buttonStyle({ size: 'sm' })}>
          New provider
        </Link>
      </TableActions> */}
      <Table emptyState={<EmptyState />}>
        {/* HACK: API doesn't have fetch by version string yet, so we display the 
            version string but construct the link href out of the ID */}
        <Column
          id="version"
          accessor={(row) => pick(row, 'id', 'version')}
          cell={({ value: { id, version } }) => (
            <Link
              className="text-sans-semi-md text-default hover:underline"
              to={pb.systemUpdateDetail({ id })}
            >
              <Badge color="neutral">{version}</Badge>
            </Link>
          )}
        />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
