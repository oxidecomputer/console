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
import { TableActions } from '~/ui/lib/Table'
import { setDiff } from '~/util/array'
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

const sec = 1000 // ms, obviously
const POLL_TIMEOUT = 30 * sec
const POLL_INTERVAL = 3 * sec

export function InstancesPage() {
  const { project } = useProjectSelector()

  const queryClient = useApiQueryClient()
  const refetchInstances = () => queryClient.invalidateQueries('instanceList')

  const makeActions = useMakeInstanceActions(
    { project },
    { onSuccess: refetchInstances, onDelete: refetchInstances }
  )

  // this is a whole thing. sit down.

  // We initialize this set as empty because we don't have the instances on hand
  // yet. This is fine because the first fetch will recognize the presence of
  // any transitioning instances as a change in state and initiate polling
  const transitioningInstances = useRef<Set<string>>(new Set())
  const pollingStartTime = useRef<number>(Date.now())

  const { data: instances } = usePrefetchedApiQuery(
    'instanceList',
    { query: { project, limit: PAGE_SIZE } },
    {
      // The point of all this is to poll for a certain amount of time after
      // some instance in the current page is transitioning. For example, if
      // you manually stop an instance, its state will change to `stopping`,
      // which will cause this logic to start polling the list until it lands
      // in `stopped`, which is not a transitional state. We want polling to
      // eventually time out so we're not polling forever if an instance is
      // stuck in starting or whatever.
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

        // always update. we don't have to worry about doing this in all the branches below.
        transitioningInstances.current = nextTransitioning

        // We use this setDiff logic instead of just checking whether the set
        // has changed because if you have two transitioning instances and
        // one stops transitioning, then that's a change in the set, but you
        // shouldn't start polling because of it! What you want to look for is
        // new transitioning instances.
        const anyTransitioning = nextTransitioning.size > 0
        const anyNewTransitioning = setDiff(nextTransitioning, prevTransitioning).size > 0

        if (anyTransitioning) {
          // if we have new transitioning instances, restart the timeout clock
          if (anyNewTransitioning) pollingStartTime.current = Date.now()

          // important that elapsed is calculated *after* bumping start time
          const elapsed = Date.now() - pollingStartTime.current
          if (elapsed < POLL_TIMEOUT) return POLL_INTERVAL
          // otherwise fall through to false below
        }

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
        <RefreshButton onClick={refetchInstances} />
        <CreateLink to={pb.instancesNew({ project })}>New Instance</CreateLink>
      </TableActions>
      <Table columns={columns} emptyState={<EmptyState />} />
    </>
  )
}
