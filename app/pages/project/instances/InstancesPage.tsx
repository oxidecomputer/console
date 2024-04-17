/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Link, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type Instance,
} from '@oxide/api'
import { Instances24Icon } from '@oxide/design-system/icons/react'

import { RefreshButton } from '~/components/RefreshButton'
import { getProjectSelector, useProjectSelector, useQuickActions } from '~/hooks'
import { InstanceResourceCell } from '~/table/cells/InstanceResourceCell'
import { InstanceStatusCell } from '~/table/cells/InstanceStatusCell'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { getActionsCol } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { buttonStyle } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'

import { useMakeInstanceActions } from './actions'

const EmptyState = () => (
  <EmptyMessage
    icon={<Instances24Icon />}
    title="No instances"
    body="You need to create an instance to be able to see it here"
    buttonText="New instance"
    buttonTo={pb.instancesNew(useProjectSelector())}
  />
)

const colHelper = createColumnHelper<Instance>()

InstancesPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await apiQueryClient.prefetchQuery('instanceList', {
    query: { project, limit: PAGE_SIZE },
  })
  return null
}

export function InstancesPage() {
  const { project } = useProjectSelector()

  const queryClient = useApiQueryClient()
  const refetchInstances = () => queryClient.invalidateQueries('instanceList')

  const makeActions = useMakeInstanceActions({ project }, { onSuccess: refetchInstances })

  const { data: instances } = usePrefetchedApiQuery('instanceList', {
    query: { project, limit: PAGE_SIZE },
  })

  const navigate = useNavigate()
  useQuickActions(
    useMemo(
      () => [
        {
          value: 'New instance',
          onSelect: () => navigate(pb.instancesNew({ project })),
        },
        ...(instances?.items || []).map((i) => ({
          value: i.name,
          onSelect: () => navigate(pb.instancePage({ project, instance: i.name })),
          navGroup: 'Go to instance',
        })),
      ],
      [project, instances, navigate]
    )
  )

  const { Table } = useQueryTable(
    'instanceList',
    { query: { project } },
    { placeholderData: (x) => x }
  )

  const columns = useMemo(
    () => [
      colHelper.accessor('name', {
        cell: makeLinkCell((instance) => pb.instancePage({ project, instance })),
      }),
      colHelper.accessor((i) => ({ ncpus: i.ncpus, memory: i.memory }), {
        header: 'CPU, RAM',
        cell: (info) => <InstanceResourceCell value={info.getValue()} />,
      }),
      colHelper.accessor(
        (i) => ({
          runState: i.runState,
          timeRunStateUpdated: i.timeRunStateUpdated,
        }),
        {
          header: 'status',
          cell: (info) => <InstanceStatusCell value={info.getValue()} />,
        }
      ),
      colHelper.accessor('hostname', {}),
      colHelper.accessor('timeCreated', Columns.timeCreated),
      getActionsCol(makeActions),
    ],
    [project, makeActions]
  )

  if (!instances) return null

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Instances24Icon />}>Instances</PageTitle>
      </PageHeader>
      <TableActions>
        <RefreshButton onClick={() => apiQueryClient.invalidateQueries('instanceList')} />
        <Link to={pb.instancesNew({ project })} className={buttonStyle({ size: 'sm' })}>
          New Instance
        </Link>
      </TableActions>
      <Table columns={columns} emptyState={<EmptyState />} />
    </>
  )
}
