import { useState, useMemo } from 'react'
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
import { Button, EmptyMessage, SideModal, TableEmptyBox } from '@oxide/ui'
import { CreateFirewallRuleForm } from 'app/forms/firewall-rules-create'
import { EditFirewallRuleForm } from 'app/forms/firewall-rules-edit'

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

  const { data, isLoading } = useApiQuery('vpcFirewallRulesGet', vpcParams)
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
        <SideModal id="create-firewall-rule-modal" isOpen={createModalOpen}>
          <CreateFirewallRuleForm
            existingRules={rules}
            onSuccess={() => setCreateModalOpen(false)}
            onDismiss={() => setCreateModalOpen(false)}
          />
        </SideModal>
        <SideModal id="create-firewall-rule-modal" isOpen={!!editing}>
          {editing && (
            <EditFirewallRuleForm
              existingRules={rules}
              originalRule={editing}
              onSuccess={() => setEditing(null)}
              onDismiss={() => setEditing(null)}
            />
          )}
        </SideModal>
      </div>
      {rules.length > 0 || isLoading ? <Table table={table} /> : emptyState}
    </>
  )
}
