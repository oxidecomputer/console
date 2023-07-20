/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
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
import { pb } from 'app/util/path-builder'

import { useMakeInstanceActions } from './actions'

const EmptyState = () => (
  <EmptyMessage
    icon={<Instances24Icon />}
    title="No instances"
    body="You need to create an instance to be able to see it here"
    buttonText="New instance"
    buttonTo={pb.instanceNew(useProjectSelector())}
  />
)

InstancesPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('instanceList', {
    query: { ...getProjectSelector(params), limit: 10 },
  })
  return null
}

export function InstancesPage() {
  const projectSelector = useProjectSelector()

  const queryClient = useApiQueryClient()
  const refetchInstances = () => queryClient.invalidateQueries('instanceList')

  const makeActions = useMakeInstanceActions(projectSelector, {
    onSuccess: refetchInstances,
  })

  const { data: instances } = useApiQuery('instanceList', {
    query: { ...projectSelector, limit: 10 }, // to have same params as QueryTable
  })

  const navigate = useNavigate()
  useQuickActions(
    useMemo(
      () => [
        {
          value: 'New instance',
          onSelect: () => navigate(pb.instanceNew(projectSelector)),
        },
        ...(instances?.items || []).map((i) => ({
          value: i.name,
          onSelect: () =>
            navigate(pb.instancePage({ ...projectSelector, instance: i.name })),
          navGroup: 'Go to instance',
        })),
      ],
      [projectSelector, instances, navigate]
    )
  )

  const { Table, Column } = useQueryTable(
    'instanceList',
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
        <Link to={pb.instanceNew(projectSelector)} className={buttonStyle({ size: 'sm' })}>
          New Instance
        </Link>
      </TableActions>
      <Table makeActions={makeActions} emptyState={<EmptyState />}>
        <Column
          accessor="name"
          cell={linkCell((instance) => pb.instancePage({ ...projectSelector, instance }))}
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
