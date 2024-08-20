/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { filesize } from 'filesize'
import { useMemo } from 'react'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type Instance,
} from '@oxide/api'
import { Instances16Icon, Instances24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { RefreshButton } from '~/components/RefreshButton'
import { getProjectSelector, useProjectSelector, useQuickActions } from '~/hooks'
import { InstanceStatusCell } from '~/table/cells/InstanceStatusCell'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { getActionsCol } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

import { useMakeInstanceActions } from './actions'

const EmptyState = () => (
  <EmptyMessage
    icon={<Instances24Icon />}
    title="No instances"
    body="Create an instance to see it here"
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

  const makeActions = useMakeInstanceActions(
    { project },
    { onSuccess: refetchInstances, onDelete: refetchInstances }
  )

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
          onSelect: () => navigate(pb.instance({ project, instance: i.name })),
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
        cell: makeLinkCell((instance) => pb.instance({ project, instance })),
      }),
      colHelper.accessor('ncpus', {
        header: 'CPU',
        cell: (info) => (
          <>
            {info.getValue()} <span className="ml-1 text-quaternary">vCPU</span>
          </>
        ),
      }),
      colHelper.accessor('memory', {
        header: 'RAM',
        cell: (info) => {
          const memory = filesize(info.getValue(), { output: 'object', base: 2 })
          return (
            <>
              {memory.value} <span className="ml-1 text-quaternary">{memory.unit}</span>
            </>
          )
        },
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
        <DocsPopover
          heading="instances"
          icon={<Instances16Icon />}
          summary="Instances are virtual machines that run on the Oxide platform."
          links={[docLinks.instances, docLinks.instanceActions]}
        />
      </PageHeader>
      <TableActions>
        <RefreshButton onClick={refetchInstances} />
        <CreateLink to={pb.instancesNew({ project })}>New Instance</CreateLink>
      </TableActions>
      <Table columns={columns} emptyState={<EmptyState />} />
    </>
  )
}
