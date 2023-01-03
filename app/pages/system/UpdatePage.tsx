import { Outlet } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { useQueryTable } from '@oxide/table'
import { Badge, Cloud16Icon, EmptyMessage, PageHeader, PageTitle } from '@oxide/ui'

const EmptyState = () => (
  // TODO: icon
  <EmptyMessage icon={<Cloud16Icon />} title="No updates available" />
)

// TODO: add page size limit once I add that in the API

UpdatePage.loader = async () => {
  await Promise.all([apiQueryClient.prefetchQuery('systemUpdateList', {})])
  return null
}

export function UpdatePage() {
  const { Table, Column } = useQueryTable('systemUpdateList', {})

  return (
    <>
      <PageHeader>
        <PageTitle /*icon={icon}*/>System update</PageTitle>
      </PageHeader>
      {/* <TableActions>
        <Link to={pb.siloIdpNew({ siloName })} className={buttonStyle({ size: 'sm' })}>
          New provider
        </Link>
      </TableActions> */}
      <Table emptyState={<EmptyState />}>
        <Column accessor="id" />
        <Column
          accessor="version"
          header="Version"
          cell={({ value }) => <Badge color="neutral">{value}</Badge>}
        />
      </Table>
      <Outlet />
    </>
  )
}
