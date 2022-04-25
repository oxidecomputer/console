import React, { useState, useMemo } from 'react'
import { createTable, getCoreRowModelSync, useTableInstance } from '@tanstack/react-table'
import type { MenuAction } from '@oxide/table'
import {
  actionsCol,
  DateCell,
  EnabledCell,
  FirewallFilterCell,
  TypeValueListCell,
  Table,
  selectCol,
} from '@oxide/table'
import { useParams } from 'app/hooks'
import type { VpcFirewallRule } from '@oxide/api'
import { useApiQuery, firewallTargetToTypeValue } from '@oxide/api'
import { Button, EmptyMessage, TableEmptyBox } from '@oxide/ui'
import { CreateFirewallRuleModal, EditFirewallRuleModal } from '../modals/firewall-rules'

const tableHelper = createTable().setRowType<VpcFirewallRule>()

export const VpcFirewallRulesTab = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')

  const { data, isLoading } = useApiQuery('vpcFirewallRulesGet', vpcParams)
  const rules = useMemo(() => data?.rules || [], [data])

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<VpcFirewallRule | null>(null)

  const columns = useMemo(() => {
    const actions = (rule: VpcFirewallRule): MenuAction[] => [
      {
        label: 'Edit',
        onActivate: () => setEditing(rule),
      },
    ]

    return tableHelper.createColumns([
      tableHelper.createDisplayColumn(selectCol()),
      tableHelper.createDataColumn('name', { header: 'Name' }),
      tableHelper.createDataColumn('action', { header: 'Action' }),
      // map() fixes the fact that IpNets aren't strings
      tableHelper.createDataColumn((rule) => rule.targets.map(firewallTargetToTypeValue), {
        id: 'targets',
        header: 'Targets',
        cell: TypeValueListCell,
      }),
      tableHelper.createDataColumn('filters', {
        header: 'Filters',
        cell: FirewallFilterCell,
      }),
      tableHelper.createDataColumn('status', {
        header: 'Status',
        cell: EnabledCell,
      }),
      tableHelper.createDataColumn('timeCreated', {
        id: 'created',
        header: 'Created',
        cell: DateCell,
      }),
      tableHelper.createDisplayColumn(actionsCol(actions)),
    ])
  }, [setEditing])

  const table = useTableInstance(tableHelper, {
    data: rules,
    columns,
    autoResetRowSelection: false,
    getCoreRowModel: getCoreRowModelSync(),
  })

  const emptyState = (
    <TableEmptyBox>
      <EmptyMessage
        title="No firewall rules"
        body="You need to create a rule to be able to see it here"
        buttonText="New rule"
        onClick={() => setCreateModalOpen(true)}
      />
    </TableEmptyBox>
  )

  return (
    <>
      <div className="mb-3 flex justify-end space-x-4">
        <Button size="xs" variant="secondary" onClick={() => setCreateModalOpen(true)}>
          New rule
        </Button>
        <CreateFirewallRuleModal
          {...vpcParams}
          isOpen={createModalOpen}
          onDismiss={() => setCreateModalOpen(false)}
          existingRules={rules}
        />
        <EditFirewallRuleModal
          {...vpcParams}
          onDismiss={() => setEditing(null)}
          existingRules={rules}
          originalRule={editing} // modal is open if this is non-null
        />
      </div>
      {rules.length > 0 || isLoading ? <Table table={table} /> : emptyState}
    </>
  )
}
