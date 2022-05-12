import { useParams } from 'app/hooks'
import { SizeCell, DateCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, Snapshots24Icon } from '@oxide/ui'

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
  const { Table, Column } = useQueryTable('projectSnapshotsGet', projectParams)
  return (
    <Table emptyState={<EmptyState />}>
      <Column id="name" />
      <Column id="description" />
      <Column id="size" cell={SizeCell} />
      <Column id="created" accessor="timeCreated" cell={DateCell} />
    </Table>
  )
}
