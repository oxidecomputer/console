import { TypeValueCell, useQueryTable } from '@oxide/table'
import { EmptyMessage } from '@oxide/ui'

import { useParams } from 'app/hooks'

const EmptyState = () => (
  <EmptyMessage
    title="No system routes"
    body="You need to create a system route to be able to see it here"
    // buttonText="New system route"
    // onClick={() => {}}
  />
)

export const VpcSystemRoutesTab = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')

  const { Table, Column } = useQueryTable('routersRoutesGet', {
    routerName: 'system',
    ...vpcParams,
  })

  return (
    <Table emptyState={<EmptyState />}>
      <Column accessor="name" />
      <Column accessor="destination" cell={TypeValueCell} />
      <Column accessor="target" cell={TypeValueCell} />
      <Column accessor="description" />
    </Table>
  )
}
