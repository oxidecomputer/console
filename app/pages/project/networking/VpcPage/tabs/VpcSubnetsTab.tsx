import React from 'react'
import { useParams } from '../../../../../hooks'
import { useQueryTable, TwoLineCell, DateCell } from '@oxide/table'

export const VpcSubnetsTab = () => {
  const { orgName: organizationName, ...other } = useParams(
    'orgName',
    'projectName',
    'vpcName'
  )

  const { Table, Column } = useQueryTable('vpcSubnetsGet', {
    organizationName,
    ...other,
  })

  return (
    <Table selectable>
      <Column id="name" accessor="identity.name" />
      <Column
        id="ip-block"
        header="IP Block"
        accessor={(vpc) => [vpc.ipv4Block, vpc.ipv6Block]}
        cell={TwoLineCell}
      />
      <Column id="created" accessor="identity.timeCreated" cell={DateCell} />
    </Table>
  )
}
