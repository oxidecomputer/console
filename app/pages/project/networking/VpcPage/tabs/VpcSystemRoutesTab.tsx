import React from 'react'
import { useParams } from 'app/hooks'
import { useQueryTable, TypeValueCell } from '@oxide/table'
import { EmptyMessage } from '@oxide/ui'

const EmptyState = () => (
  <EmptyMessage
    title="No system routes"
    body="You need to create a system route to be able to see it here"
    buttonText="New system route"
    buttonTo="new"
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
      <Column id="name" header="Name" />
      <Column id="destination" header="destination" cell={TypeValueCell} />
      <Column id="target" header="target" cell={TypeValueCell} />
      <Column id="description" header="description" />
    </Table>
  )
}
