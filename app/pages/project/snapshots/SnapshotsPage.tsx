import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { DateCell, SizeCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, PageHeader, PageTitle, Snapshots24Icon } from '@oxide/ui'

import { requireProjectParams, useRequiredParams } from 'app/hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Snapshots24Icon />}
    title="No snapshots"
    body="You need to create a snapshot to be able to see it here"
    // buttonText="New snapshot"
    // buttonTo="new"
  />
)

SnapshotsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('snapshotList', {
    ...requireProjectParams(params),
    limit: 10,
  })
}

export function SnapshotsPage() {
  const projectParams = useRequiredParams('orgName', 'projectName')
  const { Table, Column } = useQueryTable('snapshotList', projectParams)
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Snapshots24Icon />}>Snapshots</PageTitle>
      </PageHeader>
      <Table emptyState={<EmptyState />}>
        <Column accessor="name" />
        <Column accessor="description" />
        <Column accessor="size" cell={SizeCell} />
        <Column accessor="timeCreated" cell={DateCell} />
      </Table>
    </>
  )
}
