import type { LoaderFunctionArgs } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { useQueryTable } from '@oxide/table'
import { EmptyMessage, PageHeader, PageTitle, Person24Icon } from '@oxide/ui'

import { getGroupSelector, useGroupSelector } from 'app/hooks'

const EmptyState = () => (
  <EmptyMessage icon={<Person24Icon />} title="No users" body="This group is empty" />
)

GroupPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { group } = getGroupSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('userListV1', { query: { group, limit: 10 } }),
    apiQueryClient.prefetchQuery('groupView', { path: { group } }),
  ])
  return null
}

export function GroupPage() {
  const groupSel = useGroupSelector()
  const { Table, Column } = useQueryTable('userListV1', { query: groupSel })
  const { data: group } = useApiQuery('groupView', { path: groupSel })
  invariant(group, 'group should be prefetched')

  return (
    <>
      <PageHeader>
        <PageTitle /* TODO: icon */>{group.displayName}</PageTitle>
      </PageHeader>
      <Table emptyState={<EmptyState />}>
        <Column accessor="displayName" header="Name" />
      </Table>
    </>
  )
}
