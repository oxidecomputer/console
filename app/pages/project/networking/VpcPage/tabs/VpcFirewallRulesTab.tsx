import { getCoreRowModel, useTableInstance } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import type { VpcFirewallRule } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import {
  DateCell,
  EnabledCell,
  FirewallFilterCell,
  Table,
  TypeValueListCell,
  createTable,
  getActionsCol,
  getSelectCol,
} from '@oxide/table'
import { Button, EmptyMessage, TableEmptyBox } from '@oxide/ui'

import { CreateFirewallRuleSideModalForm } from 'app/forms/firewall-rules-create'
import { EditFirewallRuleForm } from 'app/forms/firewall-rules-edit'
import { useParams } from 'app/hooks'

const tableHelper = createTable().setRowType<VpcFirewallRule>()

/** columns that don't depend on anything in `render` */
const staticColumns = [
  tableHelper.createDisplayColumn(getSelectCol()),
  tableHelper.createDataColumn('name', { header: 'Name' }),
  tableHelper.createDataColumn('action', { header: 'Action' }),
  // map() fixes the fact that IpNets aren't strings
  tableHelper.createDataColumn('targets', {
    header: 'Targets',
    cell: (info) => <TypeValueListCell value={info.getValue()} />,
  }),
  tableHelper.createDataColumn('filters', {
    header: 'Filters',
    cell: (info) => <FirewallFilterCell value={info.getValue()} />,
  }),
  tableHelper.createDataColumn('status', {
    header: 'Status',
    cell: (info) => <EnabledCell value={info.getValue()} />,
  }),
  tableHelper.createDataColumn('timeCreated', {
    id: 'created',
    header: 'Created',
    cell: (info) => <DateCell value={info.getValue()} />,
  }),
]

export const VpcFirewallRulesTab = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')

  const { data, isLoading } = useApiQuery('vpcFirewallRulesView', vpcParams)
  const rules = useMemo(() => data?.rules || [], [data])

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<VpcFirewallRule | null>(null)

  // the whole thing can't be static because the action depends on setEditing
  const columns = useMemo(() => {
    return [
      ...staticColumns,
      tableHelper.createDisplayColumn(
        getActionsCol((rule) => [{ label: 'Edit', onActivate: () => setEditing(rule) }])
      ),
    ]
  }, [setEditing])

  const table = useTableInstance(tableHelper, {
    data: rules,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
        <Button size="xs" variant="default" onClick={() => setCreateModalOpen(true)}>
          New rule
        </Button>
        <CreateFirewallRuleSideModalForm
          isOpen={createModalOpen}
          existingRules={rules}
          onDismiss={() => setCreateModalOpen(false)}
        />
        <EditFirewallRuleForm
          isOpen={!!editing}
          existingRules={rules}
          originalRule={editing || ({} as VpcFirewallRule)}
          onDismiss={() => setEditing(null)}
        />
      </div>
      {rules.length > 0 || isLoading ? <Table table={table} /> : emptyState}
    </>
  )
}
