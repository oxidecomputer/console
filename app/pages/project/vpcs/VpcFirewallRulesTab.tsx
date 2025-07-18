/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router'
import * as R from 'remeda'

import {
  apiq,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type VpcFirewallRule,
} from '@oxide/api'

import { ListPlusCell } from '~/components/ListPlusCell'
import { ProtocolBadge } from '~/components/ProtocolBadge'
import { getVpcSelector, useVpcSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { EnabledCell } from '~/table/cells/EnabledCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { TypeValueCell } from '~/table/cells/TypeValueCell'
import { getActionsCol } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'
import { getProtocolKey } from '~/util/protocol'
import { titleCase } from '~/util/str'

const colHelper = createColumnHelper<VpcFirewallRule>()

/** columns that don't depend on anything in `render` */
const staticColumns = [
  colHelper.accessor('priority', {
    header: 'Priority',
    cell: (info) => <div className="text-default">{info.getValue()}</div>,
  }),
  colHelper.accessor('action', {
    header: 'Action',
    cell: (info) => <div className="text-default">{titleCase(info.getValue())}</div>,
  }),
  colHelper.accessor('direction', {
    header: 'Direction',
    cell: (info) => <div className="text-default">{titleCase(info.getValue())}</div>,
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
        ...(hosts || []).map((tv, i) => (
          <TypeValueCell key={`host-${tv.type}-${tv.value}-${i}`} {...tv} />
        )),
        ...(protocols || []).map((p) => (
          <ProtocolBadge key={getProtocolKey(p)} protocol={p} />
        )),
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

const rulesView = (query: PP.Vpc) => apiq('vpcFirewallRulesView', { query })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, vpc } = getVpcSelector(params)
  await queryClient.prefetchQuery(rulesView({ project, vpc }))
  return null
}

export default function VpcFirewallRulesTab() {
  const vpcSelector = useVpcSelector()

  const { data } = usePrefetchedQuery(rulesView(vpcSelector))

  const rules = useMemo(() => R.sortBy(data.rules, (r) => r.priority), [data])

  const navigate = useNavigate()

  const { mutateAsync: updateRules } = useApiMutation('vpcFirewallRulesUpdate', {
    onSuccess() {
      queryClient.invalidateEndpoint('vpcFirewallRulesView')
    },
  })

  // the whole thing can't be static because the action depends on setEditing
  const columns = useMemo(() => {
    return [
      colHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <LinkCell to={pb.vpcFirewallRuleEdit({ ...vpcSelector, rule: info.getValue() })}>
            {info.getValue()}
          </LinkCell>
        ),
      }),
      ...staticColumns,
      getActionsCol((rule: VpcFirewallRule) => [
        {
          label: 'Edit',
          onActivate() {
            navigate(pb.vpcFirewallRuleEdit({ ...vpcSelector, rule: rule.name }))
          },
        },
        {
          label: 'Clone',
          onActivate() {
            navigate(pb.vpcFirewallRuleClone({ ...vpcSelector, rule: rule.name }))
          },
        },
        {
          label: 'Delete',
          onActivate: confirmDelete({
            doDelete: () =>
              updateRules({
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
  }, [navigate, rules, updateRules, vpcSelector])

  const table = useReactTable({ columns, data: rules, getCoreRowModel: getCoreRowModel() })

  const emptyState = (
    <TableEmptyBox>
      <EmptyMessage
        title="No firewall rules"
        body="Create a rule to see it here"
        buttonText="New rule"
        buttonTo={pb.vpcFirewallRulesNew(vpcSelector)}
      />
    </TableEmptyBox>
  )

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <CreateLink to={pb.vpcFirewallRulesNew(vpcSelector)}>New rule</CreateLink>
      </div>
      {rules.length > 0 ? <Table table={table} /> : emptyState}
      <Outlet />
    </>
  )
}
