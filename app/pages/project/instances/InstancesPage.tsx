import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useApiQuery, useApiQueryClient } from '@oxide/api'
import { buttonStyle, TableActions } from '@oxide/ui'
import { useParams, useQuickActions } from 'app/hooks'
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

  const queryClient = useApiQueryClient()
  const refetchInstances = () =>
    queryClient.invalidateQueries('projectInstancesGet', projectParams)

  const makeActions = useMakeInstanceActions(projectParams, {
    onSuccess: refetchInstances,
  })

  const { data: instances } = useApiQuery('projectInstancesGet', {
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

  const { Table, Column } = useQueryTable(
    'projectInstancesGet',
    projectParams,
    {
      refetchInterval: 5000,
      keepPreviousData: true,
    }
  )

  if (!instances) return null

  return (
    <>
      <TableActions>
        <Link
          to={`/orgs/${orgName}/projects/${projectName}/instances/new`}
          className={buttonStyle({ size: 'xs', variant: 'secondary' })}
        >
          New Instance
        </Link>
      </TableActions>
      <Table makeActions={makeActions}>
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
