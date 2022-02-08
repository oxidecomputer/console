import React from 'react'
import { useParams } from 'app/hooks'
import { useQueryTable, TypeValueCell } from '@oxide/table'

export const VpcSystemRoutesTab = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')

  const { Table, Column } = useQueryTable('routersRoutesGet', {
    routerName: 'system',
    ...vpcParams,
  })

  return (
    <Table>
      <Column id="name" header="Name" />
      <Column id="destination" header="destination" cell={TypeValueCell} />
      <Column id="target" header="target" cell={TypeValueCell} />
      <Column id="description" header="description" />
    </Table>
  )
}
