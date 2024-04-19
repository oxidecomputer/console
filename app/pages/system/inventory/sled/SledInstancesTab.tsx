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
import { InstanceResourceCell } from '~/table/cells/InstanceResourceCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
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
    query: { limit: PAGE_SIZE },
  })
  return null
}

// passing in empty function because we still want the copy ID button
const makeActions = (): MenuAction[] => []

const colHelper = createColumnHelper<SledInstance>()
const staticCols = [
  colHelper.accessor((i) => pick(i, 'name', 'siloName', 'projectName'), {
    header: 'name',
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
    cell: (info) => <InstanceStatusBadge key="run-state" status={info.getValue()} />,
  }),
  colHelper.accessor((i) => pick(i, 'memory', 'ncpus'), {
    header: 'specs',
    cell: (info) => <InstanceResourceCell value={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
  colHelper.accessor('timeModified', Columns.timeModified),
]

export function SledInstancesTab() {
  const { sledId } = useSledParams()
  const { Table } = useQueryTable(
    'sledInstanceList',
    { path: { sledId }, query: { limit: PAGE_SIZE } },
    { placeholderData: (x) => x }
  )

  const columns = useColsWithActions(staticCols, makeActions)

  return <Table columns={columns} emptyState={<EmptyState />} rowHeight="large" />
}
