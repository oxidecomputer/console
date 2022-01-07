import React from 'react'
import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { buttonStyle, PageHeader, PageTitle, Instances24Icon } from '@oxide/ui'
import { useParams } from '../../../hooks'
import {
  linkCell,
  DateCell,
  InstanceResourceCell,
  InstanceStatusCell,
  useQueryTable,
} from '@oxide/table'
import { useInstanceActions } from './actions'

export const InstancesPage = () => {
  const { orgName, projectName } = useParams('orgName', 'projectName')
  const { data: project } = useApiQuery('organizationProjectsGetProject', {
    orgName,
    projectName,
  })

  const actions = useInstanceActions({ orgName, projectName })

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
          className={buttonStyle({ size: 'xs', variant: 'dim' })}
        >
          new instance
        </Link>
      </div>
      <Table selectable actions={actions}>
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
