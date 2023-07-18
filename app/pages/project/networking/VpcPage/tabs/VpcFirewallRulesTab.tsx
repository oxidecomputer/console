/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo, useState } from 'react'

import type { VpcFirewallRule } from '@oxide/api'
import { useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import {
  DateCell,
  EnabledCell,
  FirewallFilterCell,
  Table,
  TypeValueListCell,
  createColumnHelper,
  getActionsCol,
  useReactTable,
} from '@oxide/table'
import { Button, EmptyMessage, TableEmptyBox } from '@oxide/ui'

import { CreateFirewallRuleForm } from 'app/forms/firewall-rules-create'
import { EditFirewallRuleForm } from 'app/forms/firewall-rules-edit'
import { useVpcSelector } from 'app/hooks'
import { confirmDelete } from 'app/stores/confirm-delete'

const colHelper = createColumnHelper<VpcFirewallRule>()

/** columns that don't depend on anything in `render` */
const staticColumns = [
  colHelper.accessor('name', { header: 'Name' }),
  colHelper.accessor('action', { header: 'Action' }),
  colHelper.accessor('targets', {
    header: 'Targets',
    cell: (info) => <TypeValueListCell value={info.getValue()} />,
  }),
  colHelper.accessor('filters', {
    header: 'Filters',
    cell: (info) => <FirewallFilterCell value={info.getValue()} />,
  }),
  colHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <EnabledCell value={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', {
    id: 'created',
    header: 'Created',
    cell: (info) => <DateCell value={info.getValue()} />,
  }),
]

export const VpcFirewallRulesTab = () => {
  const queryClient = useApiQueryClient()
  const vpcSelector = useVpcSelector()

  const { data, isLoading } = useApiQuery('vpcFirewallRulesView', { query: vpcSelector })
  const rules = useMemo(() => data?.rules || [], [data])

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<VpcFirewallRule | null>(null)

  const updateRules = useApiMutation('vpcFirewallRulesUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcFirewallRulesView', { query: vpcSelector })
    },
  })

  // the whole thing can't be static because the action depends on setEditing
  const columns = useMemo(() => {
    return [
      ...staticColumns,
      getActionsCol((rule: VpcFirewallRule) => [
        { label: 'Edit', onActivate: () => setEditing(rule) },
        {
          label: 'Delete',
          onActivate: confirmDelete({
            doDelete: () =>
              updateRules.mutateAsync({
                query: vpcSelector,
                body: {
                  rules: rules.filter((r) => r.id !== rule.id),
                },
              }),
            label: rule.name,
          }),
        },
      ]),
    ]
  }, [setEditing, rules, updateRules, vpcSelector])

  const table = useReactTable({ columns, data: rules })

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
      <div className="mb-3 flex justify-end space-x-2">
        <Button size="sm" onClick={() => setCreateModalOpen(true)}>
          New rule
        </Button>
        {createModalOpen && (
          <CreateFirewallRuleForm
            existingRules={rules}
            onDismiss={() => setCreateModalOpen(false)}
          />
        )}
        {editing && (
          <EditFirewallRuleForm
            existingRules={rules}
            originalRule={editing}
            onDismiss={() => setEditing(null)}
          />
        )}
      </div>
      {rules.length > 0 || isLoading ? <Table table={table} /> : emptyState}
    </>
  )
}
