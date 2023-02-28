import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
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
    // fetch group detail
  ])
  return null
}

// No group name until we have a fetch group by ID endpoint
// See: https://github.com/oxidecomputer/omicron/pull/2455

export function GroupPage() {
  const { group } = useGroupSelector()
  const { Table, Column } = useQueryTable('userListV1', { query: { group } })
  return (
    <>
      <PageHeader>
        <PageTitle /* TODO: icon */>&lt;group name&gt;</PageTitle>
      </PageHeader>
      <Table emptyState={<EmptyState />}>
        <Column accessor="displayName" header="Name" />
      </Table>
    </>
  )
}
