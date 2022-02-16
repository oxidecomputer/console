import React, { useState, useMemo } from 'react'
import { useTable, useRowSelect } from 'react-table'
import type { MenuAction } from '@oxide/table'
import {
  getActionsCol,
  getSelectCol,
  DateCell,
  EnabledCell,
  FirewallFilterCell,
  TypeValueListCell,
  Table,
} from '@oxide/table'
import { useParams } from 'app/hooks'
import type { VpcFirewallRule } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Button } from '@oxide/ui'
import {
  CreateFirewallRuleModal,
  EditFirewallRuleModal,
} from '../modals/firewall-rules'

const columns = [
  {
    accessor: 'name' as const,
    Header: 'Name',
  },
  {
    accessor: 'action' as const,
    Header: 'Action',
  },
  {
    accessor: 'targets' as const,
    Header: 'Targets',
    Cell: TypeValueListCell,
  },
  {
    accessor: 'filters' as const,
    Header: 'Filters',
    Cell: FirewallFilterCell,
  },
  {
    accessor: 'status' as const,
    Header: 'Status',
    Cell: EnabledCell,
  },
  {
    id: 'created',
    accessor: 'timeCreated' as const,
    Header: 'Created',
    Cell: DateCell,
  },
]

export const VpcFirewallRulesTab = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')

  const { data } = useApiQuery('vpcFirewallRulesGet', vpcParams)
  const rules = useMemo(() => data?.rules || [], [data])

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<VpcFirewallRule | null>(null)

  const actions = (rule: VpcFirewallRule): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => setEditing(rule),
    },
  ]

  const table = useTable(
    { data: rules, columns, autoResetSelectedRows: false },
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        getSelectCol(),
        ...columns,
        getActionsCol(actions),
      ])
    }
  )

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
      <Table table={table} />
    </>
  )
}
