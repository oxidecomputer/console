/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { Instances24Icon } from '@oxide/design-system/icons/react'

import { InstanceStatusBadge } from '~/components/StatusBadge'
import { requireSledParams, useSledParams } from '~/hooks'
import { DateCell } from '~/table/cells/DateCell'
import { InstanceResourceCell } from '~/table/cells/InstanceResourceCell'
import type { MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
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

export function SledInstancesTab() {
  const { sledId } = useSledParams()
  const { Table, Column } = useQueryTable(
    'sledInstanceList',
    { path: { sledId }, query: { limit: 25 } },
    { placeholderData: (x) => x }
  )

  const makeActions = (): MenuAction[] => []

  return (
    <Table emptyState={<EmptyState />} makeActions={makeActions}>
      <Column
        id="name"
        accessor={(i) => pick(i, 'name', 'siloName', 'projectName')}
        cell={({ value }) => {
          return (
            <div className="space-y-0.5">
              <div className="text-quaternary">{`${value.siloName} / ${value.projectName}`}</div>
              <div className="text-default">{value.name}</div>
            </div>
          )
        }}
      />
      <Column
        id="status"
        accessor="state"
        cell={({ value }) => <InstanceStatusBadge key="run-state" status={value} />}
      />
      <Column
        id="specs"
        accessor={(i) => pick(i, 'memory', 'ncpus')}
        cell={InstanceResourceCell}
      />
      <Column id="created" accessor="timeCreated" cell={DateCell} />
      <Column id="modified" accessor="timeModified" cell={DateCell} />
    </Table>
  )
}
