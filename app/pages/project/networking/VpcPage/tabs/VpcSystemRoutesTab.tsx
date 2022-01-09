import React from 'react'
import { useParams } from '../../../../../hooks'
import { useQueryTable, TypeValueCell } from '@oxide/table'

export const VpcSystemRoutesTab = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')

  const { Table, Column } = useQueryTable('routersRoutesGet', {
    routerName: 'system',
    ...vpcParams,
  })

  return (
    <Table>
      <Column id="name" header="Name" accessor="identity.name" />
      <Column
        id="destination"
        header="destination"
        accessor="destination"
        cell={TypeValueCell}
      />
      <Column
        id="target"
        header="target"
        accessor="target"
        cell={TypeValueCell}
      />
      <Column
        id="description"
        header="description"
        accessor="identity.description"
      />
    </Table>
  )
}
