import { Link, Outlet } from 'react-router-dom'

import type { IpPool } from '@oxide/api'
import { apiQueryClient, useApiMutation, useApiQueryClient } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, useQueryTable } from '@oxide/table'
import {
  EmptyMessage,
  Networking24Icon,
  PageHeader,
  PageTitle,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { confirmDelete } from 'app/stores/confirm-delete'
import { addToast } from 'app/stores/toast'
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
  const queryClient = useApiQueryClient()
  const { Table, Column } = useQueryTable('ipPoolList', {})

  const deleteIpPools = useApiMutation('ipPoolDelete', {
    onSuccess(_, { path }) {
      addToast({
        content: `${path.pool} has been deleted`,
      })
      queryClient.invalidateQueries('ipPoolList', {})
    },
  })

  const makeActions = (ipPool: IpPool): MenuAction[] => [
    {
      label: 'Delete',
      onActivate: confirmDelete({
        doDelete: () => deleteIpPools.mutateAsync({ path: { pool: ipPool.name } }),
        label: ipPool.name,
      }),
    },
  ]

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
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" />
        <Column accessor="description" />
        <Column accessor="timeModified" header="Last updated" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
