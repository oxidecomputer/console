import { DateCell, SizeCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, PageHeader, PageTitle, Snapshots24Icon } from '@oxide/ui'

import { useParams } from 'app/hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Snapshots24Icon />}
    title="No snapshots"
    body="You need to create a snapshot to be able to see it here"
    // buttonText="New snapshot"
    // buttonTo="new"
  />
)

export const SnapshotsPage = () => {
  const projectParams = useParams('orgName', 'projectName')
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
