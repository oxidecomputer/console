import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, InstanceResourceCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, Instances24Icon } from '@oxide/ui'
import { pick } from '@oxide/util'

import { InstanceStatusBadge } from 'app/components/StatusBadge'
import { requireSledParams, useSledParams } from 'app/hooks'

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
    query: { limit: 10 },
  })
  return null
}

export function SledInstancesTab() {
  const { sledId } = useSledParams()
  const { Table, Column } = useQueryTable(
    'sledInstanceList',
    { path: { sledId }, query: { limit: 10 } },
    { keepPreviousData: true }
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
