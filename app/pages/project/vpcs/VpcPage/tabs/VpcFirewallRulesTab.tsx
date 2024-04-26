/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import {
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type VpcFirewallRule,
} from '@oxide/api'

import { ListPlusCell } from '~/components/ListPlusCell'
import { CreateFirewallRuleForm } from '~/forms/firewall-rules-create'
import { EditFirewallRuleForm } from '~/forms/firewall-rules-edit'
import { useVpcSelector } from '~/hooks'
import { confirmDelete } from '~/stores/confirm-delete'
import { EnabledCell } from '~/table/cells/EnabledCell'
import { ButtonCell } from '~/table/cells/LinkCell'
import { TypeValueCell } from '~/table/cells/TypeValueCell'
import { getActionsCol } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { CreateButton } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'
import { sortBy } from '~/util/array'
import { titleCase } from '~/util/str'

const colHelper = createColumnHelper<VpcFirewallRule>()

/** columns that don't depend on anything in `render` */
const staticColumns = [
  colHelper.accessor('priority', {
    header: 'Priority',
    cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
  }),
  colHelper.accessor('action', {
    header: 'Action',
    cell: (info) => <div className="text-secondary">{titleCase(info.getValue())}</div>,
  }),
  colHelper.accessor('direction', {
    header: 'Direction',
    cell: (info) => <div className="text-secondary">{titleCase(info.getValue())}</div>,
  }),
  colHelper.accessor('targets', {
    header: 'Targets',
    cell: (info) => {
      const targets = info.getValue()
      const children = targets.map(({ type, value }) => (
        <TypeValueCell key={type + '|' + value} type={type} value={value} />
      ))
      // if there's going to be overflow anyway, might as well make the cell narrow
      const numInCell = children.length <= 2 ? 2 : 1
      return (
        <ListPlusCell numInCell={numInCell} tooltipTitle="Other targets">
          {info.getValue().map(({ type, value }) => (
            <TypeValueCell key={type + '|' + value} type={type} value={value} />
          ))}
        </ListPlusCell>
      )
    },
  }),
  colHelper.accessor('filters', {
    header: 'Filters',
    cell: (info) => {
      const { hosts, ports, protocols } = info.getValue()
      const children = [
        ...(hosts || []).map((tv, i) => <TypeValueCell key={`${tv}-${i}`} {...tv} />),
        ...(protocols || []).map((p, i) => <Badge key={`${p}-${i}`}>{p}</Badge>),
        ...(ports || []).map((p, i) => (
          <TypeValueCell key={`port-${p}-${i}`} type="Port" value={p} />
        )),
      ]
      // if there's going to be overflow anyway, might as well make the cell narrow
      const numInCell = children.length <= 2 ? 2 : 1
      return (
        <ListPlusCell numInCell={numInCell} tooltipTitle="Other filters">
          {children}
        </ListPlusCell>
      )
    },
  }),
  colHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <EnabledCell value={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

export const VpcFirewallRulesTab = () => {
  const queryClient = useApiQueryClient()
  const vpcSelector = useVpcSelector()

  const { data } = usePrefetchedApiQuery('vpcFirewallRulesView', {
    query: vpcSelector,
  })
  const rules = useMemo(() => sortBy(data.rules, (r) => r.priority), [data])

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<VpcFirewallRule | null>(null)

  const updateRules = useApiMutation('vpcFirewallRulesUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcFirewallRulesView')
    },
  })

  // the whole thing can't be static because the action depends on setEditing
  const columns = useMemo(() => {
    return [
      colHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <ButtonCell onClick={() => setEditing(info.row.original)}>
            {info.getValue()}
          </ButtonCell>
        ),
      }),
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

  const table = useReactTable({ columns, data: rules, getCoreRowModel: getCoreRowModel() })

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
        <CreateButton onClick={() => setCreateModalOpen(true)}>New rule</CreateButton>
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
      {rules.length > 0 ? <Table table={table} /> : emptyState}
    </>
  )
}
