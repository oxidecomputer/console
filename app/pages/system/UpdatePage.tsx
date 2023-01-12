import { Outlet } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, PageHeader, PageTitle, SoftwareUpdate16Icon } from '@oxide/ui'

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
        <Column
          accessor="version"
          cell={linkCell((version) => pb.systemUpdateDetail({ version }))}
        />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
