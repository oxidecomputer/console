import type { MenuAction } from '@oxide/table'
import {
  DateCell,
  EnabledCell,
  FirewallFilterCell,
  TypeValueListCell,
  useQueryTable,
} from '@oxide/table'
import React, { useState } from 'react'
import { useParams } from 'app/hooks'
import type { VpcFirewallRule } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Button } from '@oxide/ui'
import {
  CreateFirewallRuleModal,
  EditFirewallRuleModal,
} from '../modals/firewall-rules'

export const VpcFirewallRulesTab = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')

  const { data: rules } = useApiQuery('vpcFirewallRulesGet', vpcParams)
  const { Table, Column } = useQueryTable('vpcFirewallRulesGet', vpcParams)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<VpcFirewallRule | null>(null)

  const actions = (rule: VpcFirewallRule): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => setEditing(rule),
    },
  ]

  return (
    <>
      <div className="mb-3 flex justify-end space-x-4">
        <Button
          size="xs"
          variant="dim"
          onClick={() => setCreateModalOpen(true)}
        >
          New rule
        </Button>
        <CreateFirewallRuleModal
          {...vpcParams}
          isOpen={createModalOpen}
          onDismiss={() => setCreateModalOpen(false)}
          existingRules={rules?.items || []}
        />
        <EditFirewallRuleModal
          {...vpcParams}
          originalRule={editing} // modal is open if this is non-null
          onDismiss={() => setEditing(null)}
        />
      </div>
      <Table selectable actions={actions}>
        <Column id="name" />
        <Column id="action" />
        <Column id="targets" cell={TypeValueListCell} />
        <Column id="filters" cell={FirewallFilterCell} />
        <Column id="status" header="state" cell={EnabledCell} />
        <Column id="created" accessor="timeCreated" cell={DateCell} />
      </Table>
    </>
  )
}
