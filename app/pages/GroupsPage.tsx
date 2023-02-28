import { Link } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { useQueryTable } from '@oxide/table'
import { EmptyMessage, PageHeader, PageTitle, Person24Icon } from '@oxide/ui'
import { pick } from '@oxide/util'

import { pb } from 'app/util/path-builder'

const EmptyState = () => <EmptyMessage icon={<Person24Icon />} title="No groups" />

GroupsPage.loader = async () => {
  await apiQueryClient.prefetchQuery('groupListV1', { query: { limit: 10 } })
  return null
}

export function GroupsPage() {
  const { Table, Column } = useQueryTable('groupListV1', {})
  return (
    <>
      <PageHeader>
        <PageTitle /* TODO: icon */>Groups</PageTitle>
      </PageHeader>
      <Table emptyState={<EmptyState />}>
        <Column
          id="name"
          accessor={(g) => pick(g, 'displayName', 'id')}
          header="Name"
          // TODO: helper for displaying one thing and linking to another
          cell={({ value: { id, displayName } }) => (
            <Link
              className="text-sans-semi-md text-default hover:underline"
              to={pb.group({ group: id })}
            >
              {displayName}
            </Link>
          )}
        />
      </Table>
    </>
  )
}
