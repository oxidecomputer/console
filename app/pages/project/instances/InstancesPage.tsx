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

import { requireProjectParams, useProjectParams, useQuickActions } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { useMakeInstanceActions } from './actions'

const EmptyState = () => (
  <EmptyMessage
    icon={<Instances24Icon />}
    title="No instances"
    body="You need to create an instance to be able to see it here"
    buttonText="New instance"
    buttonTo={pb.instanceNew(useProjectParams())}
  />
)

InstancesPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('instanceList', {
    path: requireProjectParams(params),
    query: { limit: 10 },
  })
}

export function InstancesPage() {
  const projectParams = useProjectParams()
  const { orgName, projectName } = projectParams

  const queryClient = useApiQueryClient()
  const refetchInstances = () =>
    queryClient.invalidateQueries('instanceList', { path: projectParams })

  const makeActions = useMakeInstanceActions(projectParams, {
    onSuccess: refetchInstances,
  })

  const { data: instances } = useApiQuery('instanceList', {
    path: projectParams,
    query: { limit: 10 }, // to have same params as QueryTable
  })

  const navigate = useNavigate()
  useQuickActions(
    useMemo(
      () => [
        { value: 'New instance', onSelect: () => navigate(pb.instanceNew(projectParams)) },
        ...(instances?.items || []).map((i) => ({
          value: i.name,
          onSelect: () => navigate(pb.instance({ ...projectParams, instanceName: i.name })),
          navGroup: 'Go to instance',
        })),
      ],
      [projectParams, instances, navigate]
    )
  )

  const { Table, Column } = useQueryTable(
    'instanceList',
    { path: projectParams },
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
        <Link
          to={pb.instanceNew({ orgName, projectName })}
          className={buttonStyle({ size: 'sm' })}
        >
          New Instance
        </Link>
      </TableActions>
      <Table makeActions={makeActions} emptyState={<EmptyState />}>
        <Column
          accessor="name"
          cell={linkCell((instanceName) =>
            pb.instance({ orgName, projectName, instanceName })
          )}
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
