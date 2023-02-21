import { useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { Link, useNavigate } from 'react-router-dom'

import { apiQueryClient, useApiQuery, useApiQueryClient } from '@oxide/api'
import {
  DateCell,
  InstanceResourceCell,
  InstanceStatusCell,
  linkCell,
  useQueryTable,
} from '@oxide/table'
import {
  Button,
  EmptyMessage,
  Instances24Icon,
  PageHeader,
  PageTitle,
  Refresh16Icon,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { getProjectSelector, useProjectSelector, useQuickActions } from 'app/hooks'
import { pb2 } from 'app/util/path-builder'

import { useMakeInstanceActions } from './actions'

const EmptyState = () => (
  <EmptyMessage
    icon={<Instances24Icon />}
    title="No instances"
    body="You need to create an instance to be able to see it here"
    buttonText="New instance"
    buttonTo={pb2.instanceNew(useProjectSelector())}
  />
)

InstancesPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('instanceListV1', {
    query: { ...getProjectSelector(params), limit: 10 },
  })
  return null
}

export function InstancesPage() {
  const projectSelector = useProjectSelector()

  const queryClient = useApiQueryClient()
  const refetchInstances = () =>
    queryClient.invalidateQueries('instanceListV1', { query: projectSelector })

  const makeActions = useMakeInstanceActions(projectSelector, {
    onSuccess: refetchInstances,
  })

  const { data: instances } = useApiQuery('instanceListV1', {
    query: { ...projectSelector, limit: 10 }, // to have same params as QueryTable
  })

  const navigate = useNavigate()
  useQuickActions(
    useMemo(
      () => [
        {
          value: 'New instance',
          onSelect: () => navigate(pb2.instanceNew(projectSelector)),
        },
        ...(instances?.items || []).map((i) => ({
          value: i.name,
          onSelect: () =>
            navigate(pb2.instancePage({ ...projectSelector, instance: i.name })),
          navGroup: 'Go to instance',
        })),
      ],
      [projectSelector, instances, navigate]
    )
  )

  const { Table, Column } = useQueryTable(
    'instanceListV1',
    { query: projectSelector },
    { keepPreviousData: true }
  )

  if (!instances) return null

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Instances24Icon />}>Instances</PageTitle>
      </PageHeader>
      <TableActions>
        <Button size="icon" variant="ghost" onClick={refetchInstances}>
          <Refresh16Icon />
        </Button>
        <Link to={pb2.instanceNew(projectSelector)} className={buttonStyle({ size: 'sm' })}>
          New Instance
        </Link>
      </TableActions>
      <Table makeActions={makeActions} emptyState={<EmptyState />}>
        <Column
          accessor="name"
          cell={linkCell((instance) => pb2.instancePage({ ...projectSelector, instance }))}
        />
        <Column
          id="resources"
          header="CPU, RAM"
          accessor={(i) => ({ ncpus: i.ncpus, memory: i.memory })}
          cell={InstanceResourceCell}
        />
        <Column
          id="status"
          accessor={(i) => ({
            runState: i.runState,
            timeRunStateUpdated: i.timeRunStateUpdated,
          })}
          cell={InstanceStatusCell}
        />
        <Column accessor="hostname" />
        <Column accessor="timeCreated" header="created" cell={DateCell} />
      </Table>
    </>
  )
}
