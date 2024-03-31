/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, type SledInstance } from '@oxide/api'
import { Instances24Icon } from '@oxide/design-system/icons/react'

import { InstanceStatusBadge } from '~/components/StatusBadge'
import { requireSledParams, useSledParams } from '~/hooks'
import { DateCell } from '~/table/cells/DateCell'
import { InstanceResourceCell } from '~/table/cells/InstanceResourceCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable2'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pick } from '~/util/object'

const EmptyState = () => {
  return (
    <EmptyMessage
      icon={<Instances24Icon />}
      title="No instances found"
      body="Instances running on the sled will be shown here"
    />
  )
}

SledInstancesTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { sledId } = requireSledParams(params)
  await apiQueryClient.prefetchQuery('sledInstanceList', {
    path: { sledId },
    query: { limit: 25 },
  })
  return null
}

// passing in empty function because we still want the copy ID button
const makeActions = (): MenuAction[] => []

export function SledInstancesTab() {
  const { sledId } = useSledParams()
  const { Table } = useQueryTable(
    'sledInstanceList',
    { path: { sledId }, query: { limit: 25 } },
    { placeholderData: (x) => x }
  )
  const colHelper = createColumnHelper<SledInstance>()
  const staticCols = [
    colHelper.accessor((i) => pick(i, 'name', 'siloName', 'projectName'), {
      header: 'name',
      id: 'name',
      cell: (info) => {
        const value = info.getValue()
        return (
          <div className="space-y-0.5">
            <div className="text-quaternary">{`${value.siloName} / ${value.projectName}`}</div>
            <div className="text-default">{value.name}</div>
          </div>
        )
      },
    }),
    colHelper.accessor('state', {
      header: 'status',
      id: 'status',
      cell: (info) => <InstanceStatusBadge key="run-state" status={info.getValue()} />,
    }),
    colHelper.accessor((i) => pick(i, 'memory', 'ncpus'), {
      header: 'specs',
      id: 'specs',
      cell: (info) => <InstanceResourceCell value={info.getValue()} />,
    }),
    colHelper.accessor('timeCreated', {
      header: 'created',
      id: 'created',
      cell: (info) => <DateCell value={info.getValue()} />,
    }),
    colHelper.accessor('timeModified', {
      header: 'modified',
      id: 'modified',
      cell: (info) => <DateCell value={info.getValue()} />,
    }),
  ]

  const columns = useColsWithActions(staticCols, makeActions)

  return <Table emptyState={<EmptyState />} columns={columns} />
}
