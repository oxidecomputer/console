/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type UseQueryOptions } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { filesize } from 'filesize'
import { useMemo, useRef, useState } from 'react'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  getListQFn,
  queryClient,
  type ApiError,
  type Instance,
  type InstanceResultsPage,
} from '@oxide/api'
import { Instances24Icon } from '@oxide/design-system/icons/react'

import { instanceTransitioning } from '~/api/util'
import { InstanceDocsPopover } from '~/components/InstanceDocsPopover'
import { RefreshButton } from '~/components/RefreshButton'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { InstanceStateCell } from '~/table/cells/InstanceStateCell'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { getActionsCol } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { Tooltip } from '~/ui/lib/Tooltip'
import { setDiff } from '~/util/array'
import { toLocaleTimeString } from '~/util/date'
import { pb } from '~/util/path-builder'

import { useMakeInstanceActions } from './actions'
import { ResizeInstanceModal } from './instance/InstancePage'

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

const instanceList = (
  project: string,
  // kinda gnarly, but we need refetchInterval in the component but not in the loader.
  // pick refetchInterval to avoid annoying type conflicts on the full object
  options?: Pick<UseQueryOptions<InstanceResultsPage, ApiError>, 'refetchInterval'>
) => getListQFn('instanceList', { query: { project } }, options)

InstancesPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await queryClient.prefetchQuery(instanceList(project).optionsFn())
  return null
}

const refetchInstances = () => apiQueryClient.invalidateQueries('instanceList')

const sec = 1000 // ms, obviously
const POLL_FAST_TIMEOUT = 30 * sec
// a little slower than instance detail because this is a bigger response
const POLL_INTERVAL_FAST = 3 * sec
const POLL_INTERVAL_SLOW = 60 * sec

export function InstancesPage() {
  const { project } = useProjectSelector()
  const [resizeInstance, setResizeInstance] = useState<Instance | null>(null)

  const { makeButtonActions, makeMenuActions } = useMakeInstanceActions(
    { project },
    {
      onSuccess: refetchInstances,
      onDelete: refetchInstances,
      onResizeClick: setResizeInstance,
    }
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
          header: 'state',
          cell: (info) => <InstanceStateCell value={info.getValue()} />,
        }
      ),
      colHelper.accessor('timeCreated', Columns.timeCreated),
      getActionsCol((instance: Instance) => [
        ...makeButtonActions(instance),
        ...makeMenuActions(instance),
      ]),
    ],
    [project, makeButtonActions, makeMenuActions]
  )

  // this is a whole thing. sit down.

  // We initialize this set as empty because we don't have the instances on hand
  // yet. This is fine because the first fetch will recognize the presence of
  // any transitioning instances as a change in state and initiate polling
  const transitioningInstances = useRef<Set<string>>(new Set())
  const pollingStartTime = useRef<number>(Date.now())

  const { table, query } = useQueryTable({
    query: instanceList(project, {
      // The point of all this is to poll quickly for a certain amount of time
      // after some instance in the current page enters a transitional state
      // like starting or stopping. After that, it will keep polling, but more
      // slowly. For example, if you stop an instance, its state will change to
      // `stopping`, which will cause this logic to start polling the list until
      // it lands in `stopped`, at which point it will poll only slowly because
      // `stopped` is not considered transitional.
      refetchInterval({ state: { data } }) {
        const prevTransitioning = transitioningInstances.current
        const nextTransitioning = new Set(
          // Data will never actually be undefined because of the prefetch but whatever
          (data?.items || [])
            .filter(instanceTransitioning)
            // These are strings of instance ID + current state. This is done because
            // of the case where an instance is stuck in starting (for example), polling
            // times out, and then you manually stop it. Without putting the state in the
            // the key, that stop action would not be registered as a change in the set
            // of transitioning instances.
            .map((i) => i.id + '|' + i.runState)
        )

        // always update the ledger to the current state
        transitioningInstances.current = nextTransitioning

        // We use this set difference logic instead of set equality because if
        // you have two transitioning instances and one stops transitioning,
        // then that's a change in the set, but you shouldn't start polling
        // fast because of it! What you want to look for is *new* transitioning
        // instances.
        const anyTransitioning = nextTransitioning.size > 0
        const anyNewTransitioning = setDiff(nextTransitioning, prevTransitioning).size > 0

        // if there are new instances in transitioning, restart the timeout window
        if (anyNewTransitioning) pollingStartTime.current = Date.now()

        // important that elapsed is calculated *after* potentially bumping start time
        const elapsed = Date.now() - pollingStartTime.current
        return anyTransitioning && elapsed < POLL_FAST_TIMEOUT
          ? POLL_INTERVAL_FAST
          : POLL_INTERVAL_SLOW
      },
    }),
    columns,
    emptyState: <EmptyState />,
  })

  const { data: instances, dataUpdatedAt } = query

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

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Instances24Icon />}>Instances</PageTitle>
        <InstanceDocsPopover />
      </PageHeader>
      {/* Avoid changing justify-end on TableActions for this one case. We can
       * fix this properly when we add refresh and filtering for all tables. */}
      <TableActions className="!-mt-6 !justify-between">
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refetchInstances} />
          <Tooltip
            content="Auto-refresh is more frequent after instance actions"
            delay={150}
          >
            <span className="text-sans-sm text-tertiary">
              Updated {toLocaleTimeString(new Date(dataUpdatedAt))}
            </span>
          </Tooltip>
        </div>
        <CreateLink to={pb.instancesNew({ project })}>New Instance</CreateLink>
      </TableActions>
      {table}
      {resizeInstance && (
        <ResizeInstanceModal
          instance={resizeInstance}
          onDismiss={() => setResizeInstance(null)}
          onListView
        />
      )}
    </>
  )
}
