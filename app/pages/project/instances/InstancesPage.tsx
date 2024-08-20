/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { filesize } from 'filesize'
import { useMemo, useRef } from 'react'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  instanceTransitioning,
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
import { Spinner } from '~/ui/lib/Spinner'
import { TableActions } from '~/ui/lib/Table'
import { isSetEqual } from '~/util/array'
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

const POLLING_TIMEOUT = 5_000 // 30 seconds

export function InstancesPage() {
  const { project } = useProjectSelector()

  const queryClient = useApiQueryClient()
  const refetchInstances = () => queryClient.invalidateQueries('instanceList')

  const makeActions = useMakeInstanceActions(
    { project },
    { onSuccess: refetchInstances, onDelete: refetchInstances }
  )

  // this is a whole thing. sit down.
  const transitioningInstances = useRef<Set<string>>(new Set())
  const pollingStart = useRef<number | null>(Date.now())

  const { data: instances, isFetching } = usePrefetchedApiQuery(
    'instanceList',
    {
      query: { project, limit: PAGE_SIZE },
    },
    {
      refetchInterval({ state }) {
        const currTransitioning = transitioningInstances.current
        const nextTransitioning = new Set(
          // data will never actually be undefined because of the prefetch but whatever
          state.data?.items.filter(instanceTransitioning).map((i) => i.id) || []
        )

        // always update. we don't have to worry about doing this in all the branches below.
        transitioningInstances.current = nextTransitioning

        // if no instances are transitioning, stop polling
        if (nextTransitioning.size === 0) {
          pollingStart.current = null
          return false
        }

        // if we have new transitioning instances, we always restart polling
        // regardless of whether we were polling before
        if (!isSetEqual(currTransitioning, nextTransitioning)) {
          pollingStart.current = Date.now()
          return 1000
        }

        // if the set hasn't changed, we still poll unless we've hit the timeout
        if (
          pollingStart.current !== null &&
          Date.now() - pollingStart.current < POLLING_TIMEOUT
        ) {
          // don't update pollingStart: we need the timer to keep running down
          return 1000
        }

        // at this point we know:
        // - the set of transitioning instances hasn't changed
        // - we are no longer within the polling window
        pollingStart.current = null
        return false
      },
    }
  )

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
        header: 'Memory',
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
        (i) => ({ runState: i.runState, timeRunStateUpdated: i.timeRunStateUpdated }),
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
        {isFetching && (
          <div>
            <Spinner />
          </div>
        )}
        <RefreshButton onClick={refetchInstances} />
        <CreateLink to={pb.instancesNew({ project })}>New Instance</CreateLink>
      </TableActions>
      <Table columns={columns} emptyState={<EmptyState />} />
    </>
  )
}
