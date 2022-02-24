import React from 'react'
import { Link } from 'react-router-dom'

import { useApiQuery, useApiQueryClient } from '@oxide/api'
import { buttonStyle, PageHeader, PageTitle, Instances24Icon } from '@oxide/ui'
import { useParams } from 'app/hooks'
import {
  linkCell,
  DateCell,
  InstanceResourceCell,
  InstanceStatusCell,
  useQueryTable,
} from '@oxide/table'
import { useMakeInstanceActions } from './actions'

export const InstancesPage = () => {
  const projectParams = useParams('orgName', 'projectName')
  const { orgName, projectName } = projectParams
  const { data: project } = useApiQuery(
    'organizationProjectsGetProject',
    projectParams
  )

  const queryClient = useApiQueryClient()
  const refetchInstances = () =>
    queryClient.invalidateQueries('projectInstancesGet', projectParams)

  const makeActions = useMakeInstanceActions(projectParams, {
    onSuccess: refetchInstances,
  })

  const { Table, Column } = useQueryTable(
    'projectInstancesGet',
    { orgName, projectName },
    {
      refetchInterval: 5000,
      keepPreviousData: true,
    }
  )

  if (!project) return null

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Instances24Icon title="Project" />}>
          {project.name}
        </PageTitle>
      </PageHeader>

      <div className="-mt-11 mb-3 flex justify-end space-x-4">
        <Link
          to={`/orgs/${orgName}/projects/${projectName}/instances/new`}
          className={buttonStyle({ size: 'xs', variant: 'secondary' })}
        >
          New Instance
        </Link>
      </div>
      <Table selectable makeActions={makeActions}>
        <Column
          id="name"
          cell={linkCell(
            (name) =>
              `/orgs/${orgName}/projects/${projectName}/instances/${name}`
          )}
        />
        <Column
          id="resources"
          header="CPU, RAM / IMAGE"
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
        <Column id="hostname" />
        <Column id="created" accessor="timeCreated" cell={DateCell} />
      </Table>
    </>
  )
}
