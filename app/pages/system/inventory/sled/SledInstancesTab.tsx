/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import type { LoaderFunctionArgs } from 'react-router'
import * as R from 'remeda'

import { getListQFn, queryClient, type SledInstance } from '@oxide/api'
import { Instances24Icon } from '@oxide/design-system/icons/react'

import { InstanceStateBadge } from '~/components/StateBadge'
import { requireSledParams, useSledParams } from '~/hooks/use-params'
import { InstanceResourceCell } from '~/table/cells/InstanceResourceCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'

const sledInstanceList = (sledId: string) =>
  getListQFn('sledInstanceList', { path: { sledId } })

const EmptyState = () => {
  return (
    <EmptyMessage
      icon={<Instances24Icon />}
      title="No instances found"
      body="Instances running on the sled will be shown here"
    />
  )
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { sledId } = requireSledParams(params)
  await queryClient.prefetchQuery(sledInstanceList(sledId).optionsFn())
  return null
}

// passing in empty function because we still want the copy ID button
const makeActions = (): MenuAction[] => []

const colHelper = createColumnHelper<SledInstance>()
const staticCols = [
  colHelper.accessor((i) => R.pick(i, ['name', 'siloName', 'projectName']), {
    header: 'name',
    cell: (info) => {
      const value = info.getValue()
      return (
        <div className="space-y-0.5">
          <div className="text-tertiary">{`${value.siloName} / ${value.projectName}`}</div>
          <div className="text-raise">{value.name}</div>
        </div>
      )
    },
  }),
  // we don't show run state last update time like on project instances because
  // it's not in this response
  colHelper.accessor('state', {
    header: 'State',
    cell: (info) => <InstanceStateBadge state={info.getValue()} />,
  }),
  colHelper.accessor((i) => R.pick(i, ['memory', 'ncpus']), {
    header: 'specs',
    cell: (info) => <InstanceResourceCell value={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

Component.displayName = 'SledInstancesTab'
export function Component() {
  const { sledId } = useSledParams()
  const columns = useColsWithActions(staticCols, makeActions)
  const { table } = useQueryTable({
    query: sledInstanceList(sledId),
    columns,
    emptyState: <EmptyState />,
    rowHeight: 'large',
  })
  return table
}
