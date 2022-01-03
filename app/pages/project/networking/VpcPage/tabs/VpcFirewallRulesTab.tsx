import {
  DateCell,
  EnabledCell,
  FirewallFilterCell,
  TypeValueListCell,
  useQueryTable,
} from '@oxide/table'
import React from 'react'
import { useParams } from '../../../../../hooks'

export const VpcFirewallRulesTab = () => {
  const { orgName: organizationName, ...other } = useParams(
    'orgName',
    'projectName',
    'vpcName'
  )

  const { Table, Column } = useQueryTable('vpcFirewallRulesGet', {
    organizationName,
    ...other,
  })

  return (
    <Table selectable>
      <Column id="name" accessor="identity.name" />
      <Column id="action" />
      <Column id="targets" cell={TypeValueListCell} />
      <Column id="filters" cell={FirewallFilterCell} />
      <Column id="status" header="state" cell={EnabledCell} />
      <Column id="created" accessor="identity.timeCreated" cell={DateCell} />
    </Table>
  )
}
