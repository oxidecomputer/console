import {
  DateCell,
  EnabledCell,
  FirewallFilterCell,
  TypeValueListCell,
  useQueryTable,
} from '@oxide/table'
import React from 'react'
import { useParams } from 'app/hooks'

export const VpcFirewallRulesTab = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')

  const { Table, Column } = useQueryTable('vpcFirewallRulesGet', vpcParams)

  return (
    <Table>
      <Column id="name" />
      <Column id="action" />
      <Column id="targets" cell={TypeValueListCell} />
      <Column id="filters" cell={FirewallFilterCell} />
      <Column id="status" header="state" cell={EnabledCell} />
      <Column id="created" accessor="timeCreated" cell={DateCell} />
    </Table>
  )
}
