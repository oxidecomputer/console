import { Link, Outlet } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { DateCell, useQueryTable } from '@oxide/table'
import {
  EmptyMessage,
  Networking24Icon,
  PageHeader,
  PageTitle,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No IP pools"
    body="You need to create an IP pool to be able to see it here"
    buttonText="New IP pool"
    buttonTo={pb.systemIpPoolNew()}
  />
)

IpPoolsPage.loader = async () => {
  await apiQueryClient.prefetchQuery('ipPoolList', { query: { limit: 10 } })
  return null
}

export function IpPoolsPage() {
  const { Table, Column } = useQueryTable('ipPoolList', {})

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>IP Pools</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to={pb.systemIpPoolNew()} className={buttonStyle({ size: 'sm' })}>
          New IP pool
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />}>
        <Column accessor="name" />
        <Column accessor="description" />
        <Column accessor="timeModified" header="Last updated" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
