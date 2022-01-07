import React from 'react'
import { useParams } from '../../../../../hooks'
import { useQueryTable, DateCell, LabelCell } from '@oxide/table'

export const VpcRoutersTab = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')

  const { Table, Column } = useQueryTable('vpcRoutersGet', vpcParams)

  return (
    <Table selectable>
      <Column id="name" header="Name" accessor="identity.name" />
      <Column id="kind" header="type" accessor="kind" cell={LabelCell} />
      <Column
        id="created"
        header="Created"
        accessor="identity.timeCreated"
        cell={DateCell}
      />
    </Table>
  )
}
