import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useApiQuery, useApiQueryClient } from '@oxide/api'
import {
  DateCell,
  InstanceResourceCell,
  InstanceStatusCell,
  linkCell,
  useQueryTable,
} from '@oxide/table'
import {
  EmptyMessage,
  Instances24Icon,
  PageHeader,
  PageTitle,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { useParams, useQuickActions } from 'app/hooks'

import { useMakeInstanceActions } from './actions'

const EmptyState = () => (
  <EmptyMessage
    icon={<Instances24Icon />}
    title="No instances"
    body="You need to create an instance to be able to see it here"
    buttonText="New instance"
    buttonTo="new"
  />
)

export const InstancesPage = () => {
  const projectParams = useParams('orgName', 'projectName')
  const { orgName, projectName } = projectParams

  const queryClient = useApiQueryClient()
  const refetchInstances = () =>
    queryClient.invalidateQueries('instanceList', projectParams)

  const makeActions = useMakeInstanceActions(projectParams, {
    onSuccess: refetchInstances,
  })

  const { data: instances } = useApiQuery('instanceList', {
    ...projectParams,
    limit: 10, // to have same params as QueryTable
  })

  const navigate = useNavigate()
  useQuickActions(
    useMemo(
      () => [
        { value: 'New instance', onSelect: () => navigate('new') },
        ...(instances?.items || []).map((p) => ({
          value: p.name,
          onSelect: () => navigate(p.name),
          navGroup: 'Go to instance',
        })),
      ],
      [instances, navigate]
    )
  )

  const { Table, Column } = useQueryTable('instanceList', projectParams, {
    refetchInterval: 5000,
    keepPreviousData: true,
  })

  if (!instances) return null

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Instances24Icon />}>Instances</PageTitle>
      </PageHeader>
      <TableActions>
        <Link
          to={`/orgs/${orgName}/projects/${projectName}/instances/new`}
          className={buttonStyle({ size: 'xs', variant: 'default' })}
        >
          New Instance
        </Link>
      </TableActions>
      <Table makeActions={makeActions} emptyState={<EmptyState />}>
        <Column
          accessor="name"
          cell={linkCell(
            (name) => `/orgs/${orgName}/projects/${projectName}/instances/${name}`
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
