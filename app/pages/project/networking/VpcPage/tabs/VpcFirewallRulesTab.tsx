import React, { useState, useMemo } from 'react'
import { createTable } from '@tanstack/react-table'
import type { MenuAction } from '@oxide/table'
import {
  actionsCol,
  DateCell,
  EnabledCell,
  FirewallFilterCell,
  TypeValueListCell,
  Table2,
  selectCol,
} from '@oxide/table'
import { useParams } from 'app/hooks'
import type { VpcFirewallRule } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Button } from '@oxide/ui'
import {
  CreateFirewallRuleModal,
  EditFirewallRuleModal,
} from '../modals/firewall-rules'

const tableHelper = createTable().RowType<VpcFirewallRule>()

export const VpcFirewallRulesTab = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')

  const { data } = useApiQuery('vpcFirewallRulesGet', vpcParams)
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
      tableHelper.createDataColumn('targets', {
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

  const table = tableHelper.useTable({
    data: rules,
    columns,
    autoResetRowSelection: false,
  })

  return (
    <>
      <div className="mb-3 flex justify-end space-x-4">
        <Button
          size="xs"
          variant="secondary"
          onClick={() => setCreateModalOpen(true)}
        >
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
      <Table2 table={table} />
    </>
  )
}
