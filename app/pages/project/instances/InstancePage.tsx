/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { filesize } from 'filesize'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, type LoaderFunctionArgs } from 'react-router'

import {
  apiQueryClient,
  useApiMutation,
  useApiQuery,
  usePrefetchedApiQuery,
  type Instance,
  type InstanceNetworkInterface,
} from '@oxide/api'
import { Instances24Icon } from '@oxide/design-system/icons/react'

import {
  INSTANCE_MAX_CPU,
  INSTANCE_MAX_RAM_GiB,
  instanceAutoRestartingSoon,
  instanceCan,
  instanceTransitioning,
} from '~/api/util'
import { CopyIdItem } from '~/components/CopyIdItem'
import { ExternalIps } from '~/components/ExternalIps'
import { NumberField } from '~/components/form/fields/NumberField'
import { HL } from '~/components/HL'
import { InstanceAutoRestartPopover } from '~/components/InstanceAutoRestartPopover'
import { InstanceDocsPopover } from '~/components/InstanceDocsPopover'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { RefreshButton } from '~/components/RefreshButton'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { InstanceStateBadge } from '~/components/StateBadge'
import {
  getInstanceSelector,
  useInstanceSelector,
  useProjectSelector,
} from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { Button } from '~/ui/lib/Button'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { Spinner } from '~/ui/lib/Spinner'
import { Tooltip } from '~/ui/lib/Tooltip'
import { truncate } from '~/ui/lib/Truncate'
import { instanceMetricsBase, pb } from '~/util/path-builder'
import { pluralize } from '~/util/str'
import { GiB } from '~/util/units'

import { useMakeInstanceActions } from './actions'

function getPrimaryVpcId(nics: InstanceNetworkInterface[]) {
  const nic = nics.find((nic) => nic.primary)
  return nic ? nic.vpcId : undefined
}

// this is meant to cover everything that we fetch in the page
async function refreshData() {
  await Promise.all([
    apiQueryClient.invalidateQueries('instanceView'),
    apiQueryClient.invalidateQueries('instanceExternalIpList'),
    apiQueryClient.invalidateQueries('instanceNetworkInterfaceList'),
    apiQueryClient.invalidateQueries('instanceDiskList'), // storage tab
    apiQueryClient.invalidateQueries('antiAffinityGroupMemberList'),
    // note that we do not include timeseriesQuery because the charts on the
    // metrics tab will manage their own refresh intervals when we turn that
    // back on
  ])
}

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, instance } = getInstanceSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('instanceView', {
      path: { instance },
      query: { project },
    }),
    apiQueryClient.prefetchQuery('instanceExternalIpList', {
      path: { instance },
      query: { project },
    }),
    // The VPC fetch here ensures that the VPC shows up at pageload time without
    // a loading state. This is an unusual prefetch in that
    //
    //   a) one call depends on the result of another, so they are in sequence
    //   b) the corresponding render-time query is not right next to the loader
    //      (which is what we usually prefer) but inside VpcNameFromId
    //
    // Using .then() like this instead of doing the NICs call before the
    // entire Promise.all() means this whole *pair* of requests can happen in
    // parallel with the other two instead of only the second one.
    apiQueryClient
      .fetchQuery('instanceNetworkInterfaceList', {
        query: { project, instance },
      })
      .then((nics) => {
        const vpc = getPrimaryVpcId(nics.items)
        if (!vpc) return Promise.resolve()
        return apiQueryClient.prefetchQuery('vpcView', { path: { vpc } })
      }),
  ])
  return null
}

// both a little faster than the default on the list view
const sec = 1000 // ms, obviously
const POLL_INTERVAL_FAST = 2 * sec
const POLL_INTERVAL_SLOW = 30 * sec

const PollingSpinner = () => (
  <Tooltip content="Auto-refreshing while state changes" delay={150}>
    <button type="button">
      <Spinner className="ml-2" />
    </button>
  </Tooltip>
)

export default function InstancePage() {
  const instanceSelector = useInstanceSelector()
  const [resizeInstance, setResizeInstance] = useState(false)

  const navigate = useNavigate()

  const { makeButtonActions, makeMenuActions } = useMakeInstanceActions(instanceSelector, {
    onSuccess: refreshData,
    // go to project instances list since there's no more instance
    onDelete: () => {
      apiQueryClient.invalidateQueries('instanceList')
      navigate(pb.instances(instanceSelector))
    },
    onResizeClick: () => setResizeInstance(true),
  })

  const { data: instance } = usePrefetchedApiQuery(
    'instanceView',
    {
      path: { instance: instanceSelector.instance },
      query: { project: instanceSelector.project },
    },
    {
      // We're using this logic here on instance detail, but not on instance
      // list. Instance list will only poll for the transitioning case. We don't
      // show anything about auto-restart on the instance list, so the only point
      // of polling would be to catch a restart when it happens. But with the
      // cooldown period being an hour, we'd be doing a _lot_ of unnecessary
      // polling on the list page.
      refetchInterval: ({ state: { data: instance } }) => {
        if (!instance) return false
        if (instanceTransitioning(instance)) return POLL_INTERVAL_FAST

        if (instance.runState === 'failed' && instance.autoRestartEnabled) {
          return instanceAutoRestartingSoon(instance)
            ? POLL_INTERVAL_FAST
            : POLL_INTERVAL_SLOW
        }
      },
    }
  )

  const { data: nics } = usePrefetchedApiQuery('instanceNetworkInterfaceList', {
    query: {
      project: instanceSelector.project,
      instance: instanceSelector.instance,
    },
  })
  const primaryVpcId = getPrimaryVpcId(nics.items)

  // a little funny, as noted in the loader -- this should always be prefetched
  // when primaryVpcId is defined, but primaryVpcId might not be defined, so
  // we can't use usePrefetchedApiQuery
  const { data: vpc } = useApiQuery(
    'vpcView',
    { path: { vpc: primaryVpcId! } },
    { enabled: !!primaryVpcId }
  )

  const memory = filesize(instance.memory, { output: 'object', base: 2 })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Instances24Icon />}>{instance.name}</PageTitle>
        <div className="inline-flex gap-2">
          <RefreshButton onClick={refreshData} />
          <InstanceDocsPopover />
          <div className="flex space-x-2 border-l pl-2 border-default">
            {makeButtonActions(instance).map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                size="sm"
                onClick={action.onActivate}
                disabled={!!action.disabled}
                disabledReason={action.disabled}
              >
                {action.label}
              </Button>
            ))}
          </div>
          <MoreActionsMenu label="Instance actions">
            <CopyIdItem id={instance.id} />
            {makeMenuActions(instance).map((action) =>
              'to' in action ? (
                <DropdownMenu.LinkItem
                  key={action.label}
                  to={action.to}
                  className={action.className}
                >
                  {action.label}
                </DropdownMenu.LinkItem>
              ) : (
                <DropdownMenu.Item
                  key={action.label}
                  label={action.label}
                  onSelect={action.onActivate}
                  disabled={action.disabled}
                  className={action.className}
                />
              )
            )}
          </MoreActionsMenu>
        </div>
      </PageHeader>
      <PropertiesTable columns={2} className="-mt-8 mb-8">
        <PropertiesTable.Row label="cpu">
          <span className="text-default">{instance.ncpus}</span>
          <span className="ml-1 text-tertiary">{pluralize(' vCPU', instance.ncpus)}</span>
        </PropertiesTable.Row>
        <PropertiesTable.Row label="ram">
          <span className="text-default">{memory.value}</span>
          <span className="ml-1 text-tertiary"> {memory.unit}</span>
        </PropertiesTable.Row>
        <PropertiesTable.Row label="state">
          <div className="flex items-center gap-2">
            <InstanceStateBadge state={instance.runState} />
            {instanceTransitioning(instance) && <PollingSpinner />}
            <InstanceAutoRestartPopover instance={instance} />
          </div>
        </PropertiesTable.Row>
        <PropertiesTable.Row label="vpc">
          {vpc ? (
            <Link
              className="link-with-underline group text-sans-md"
              to={pb.vpc({ project: instanceSelector.project, vpc: vpc.name })}
            >
              {vpc.name}
            </Link>
          ) : (
            <EmptyCell />
          )}
        </PropertiesTable.Row>
        <PropertiesTable.DescriptionRow description={instance.description} />
        <PropertiesTable.DateRow date={instance.timeCreated} label="Created" />
        <PropertiesTable.IdRow id={instance.id} />
        <PropertiesTable.Row label="external IPs">
          {<ExternalIps {...instanceSelector} />}
        </PropertiesTable.Row>
      </PropertiesTable>
      <RouteTabs fullWidth>
        <Tab to={pb.instanceStorage(instanceSelector)}>Storage</Tab>
        <Tab to={pb.instanceNetworking(instanceSelector)}>Networking</Tab>
        <Tab
          to={pb.instanceCpuMetrics(instanceSelector)}
          activePrefix={instanceMetricsBase(instanceSelector)}
        >
          Metrics
        </Tab>
        <Tab to={pb.instanceConnect(instanceSelector)}>Connect</Tab>
        <Tab to={pb.instanceSettings(instanceSelector)}>Settings</Tab>
      </RouteTabs>
      {resizeInstance && (
        <ResizeInstanceModal
          instance={instance}
          onDismiss={() => setResizeInstance(false)}
        />
      )}
    </>
  )
}

export function ResizeInstanceModal({
  instance,
  onDismiss,
  onListView = false,
}: {
  instance: Instance
  onDismiss: () => void
  onListView?: boolean
}) {
  const { project } = useProjectSelector()
  const instanceUpdate = useApiMutation('instanceUpdate', {
    onSuccess(_updatedInstance) {
      apiQueryClient.invalidateQueries('instanceList')
      apiQueryClient.invalidateQueries('instanceView')

      onDismiss()
      addToast({
        content: (
          <>
            Instance <HL>{instance.name}</HL> resized
          </>
        ),
        cta: onListView
          ? {
              text: `View instance`,
              link: pb.instance({ project, instance: instance.name }),
            }
          : undefined, // Only link to the instance if we're not already on that page
      })
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
    onSettled: onDismiss,
  })

  const form = useForm({
    defaultValues: {
      ncpus: instance.ncpus,
      memory: instance.memory / GiB, // memory is stored as bytes
    },
    mode: 'onChange',
  })

  const canResize = instanceCan.resize(instance)
  const willChange =
    form.watch('ncpus') !== instance.ncpus || form.watch('memory') !== instance.memory / GiB
  const isDisabled = !form.formState.isValid || !canResize || !willChange

  const onSubmit = form.handleSubmit(({ ncpus, memory }) => {
    instanceUpdate.mutate({
      path: { instance: instance.name },
      query: { project },
      body: { ncpus, memory: memory * GiB, bootDisk: instance.bootDiskId },
    })
  })
  const formId = useId()

  return (
    <Modal title="Resize instance" isOpen onDismiss={onDismiss}>
      <Modal.Body>
        <Modal.Section>
          {!canResize ? (
            <Message variant="error" content="An instance must be stopped to be resized" />
          ) : (
            <Message
              variant="info"
              content={
                <div>
                  Current (
                  <span className="text-sans-semi-md">{truncate(instance.name, 20)}</span>
                  ): {instance.ncpus} vCPUs / {instance.memory / GiB} GiB
                </div>
              }
            />
          )}
          <form id={formId} autoComplete="off" className="space-y-4" onSubmit={onSubmit}>
            <NumberField
              required
              label="vCPUs"
              name="ncpus"
              min={1}
              control={form.control}
              validate={(cpus) => {
                if (cpus < 1) {
                  return `Must be at least 1 vCPU`
                }
                if (cpus > INSTANCE_MAX_CPU) {
                  return `Can be at most ${INSTANCE_MAX_CPU}`
                }
                // We can show this error and therefore inform the user
                // of the limit rather than preventing it completely
              }}
              disabled={!canResize}
            />
            <NumberField
              units="GiB"
              required
              label="Memory"
              name="memory"
              min={1}
              control={form.control}
              validate={(memory) => {
                if (memory < 1) {
                  return `Must be at least 1 GiB`
                }
                if (memory > INSTANCE_MAX_RAM_GiB) {
                  return `Can be at most ${INSTANCE_MAX_RAM_GiB} GiB`
                }
              }}
              disabled={!canResize}
            />
          </form>
          {instanceUpdate.error && (
            <p className="mt-4 text-error">{instanceUpdate.error.message}</p>
          )}
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        formId={formId}
        onDismiss={onDismiss}
        actionText="Resize"
        actionLoading={instanceUpdate.isPending}
        disabled={isDisabled}
      />
    </Modal>
  )
}
