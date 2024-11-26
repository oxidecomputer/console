/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { filesize } from 'filesize'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

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
  instanceCan,
  instanceTransitioning,
} from '~/api/util'
import { ExternalIps } from '~/components/ExternalIps'
import { NumberField } from '~/components/form/fields/NumberField'
import { HL } from '~/components/HL'
import { InstanceDocsPopover } from '~/components/InstanceDocsPopover'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { RefreshButton } from '~/components/RefreshButton'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { InstanceStateBadge } from '~/components/StateBadge'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { Button } from '~/ui/lib/Button'
import { DateTime } from '~/ui/lib/DateTime'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { Spinner } from '~/ui/lib/Spinner'
import { Tooltip } from '~/ui/lib/Tooltip'
import { Truncate } from '~/ui/lib/Truncate'
import { pb } from '~/util/path-builder'
import { GiB } from '~/util/units'

import { useMakeInstanceActions } from '../actions'

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
    apiQueryClient.invalidateQueries('diskMetricsList'), // metrics tab
  ])
}

InstancePage.loader = async ({ params }: LoaderFunctionArgs) => {
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

const POLL_INTERVAL = 1000

export function InstancePage() {
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
      refetchInterval: ({ state: { data: instance } }) =>
        instance && instanceTransitioning(instance) ? POLL_INTERVAL : false,
    }
  )

  const polling = instanceTransitioning(instance)

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

  const allMenuActions = useMemo(
    () => [
      {
        label: 'Copy ID',
        onActivate() {
          window.navigator.clipboard.writeText(instance.id || '')
        },
      },
      ...makeMenuActions(instance),
    ],
    [instance, makeMenuActions]
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
          <MoreActionsMenu label="Instance actions" actions={allMenuActions} />
        </div>
      </PageHeader>
      <PropertiesTable.Group className="-mt-8 mb-16">
        <PropertiesTable>
          <PropertiesTable.Row label="cpu">
            <span className="text-secondary">{instance.ncpus}</span>
            <span className="ml-1 text-quaternary"> vCPUs</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="ram">
            <span className="text-secondary">{memory.value}</span>
            <span className="ml-1 text-quaternary"> {memory.unit}</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="state">
            <div className="flex">
              <InstanceStateBadge state={instance.runState} />
              {polling && (
                <Tooltip content="Auto-refreshing while state changes" delay={150}>
                  <button type="button">
                    <Spinner className="ml-2" />
                  </button>
                </Tooltip>
              )}
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
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="description">
            <span className="text-secondary">
              <Truncate text={instance.description} maxLength={40} />
            </span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="created">
            <DateTime date={instance.timeCreated} />
          </PropertiesTable.Row>
          <PropertiesTable.Row label="id">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-secondary">
              {instance.id}
            </span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="external IPs">
            {<ExternalIps {...instanceSelector} />}
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>
      <RouteTabs fullWidth>
        <Tab to={pb.instanceStorage(instanceSelector)}>Storage</Tab>
        <Tab to={pb.instanceMetrics(instanceSelector)}>Metrics</Tab>
        <Tab to={pb.instanceNetworking(instanceSelector)}>Networking</Tab>
        <Tab to={pb.instanceConnect(instanceSelector)}>Connect</Tab>
      </RouteTabs>
      {resizeInstance && (
        <ResizeInstanceModal
          instance={instance}
          project={instanceSelector.project}
          onDismiss={() => setResizeInstance(false)}
        />
      )}
    </>
  )
}

export function ResizeInstanceModal({
  instance,
  project,
  onDismiss,
  onListView = false,
}: {
  instance: Instance
  project: string
  onDismiss: () => void
  onListView?: boolean
}) {
  const instanceUpdate = useApiMutation('instanceUpdate', {
    onSuccess(_updatedInstance) {
      if (onListView) {
        apiQueryClient.invalidateQueries('instanceList')
      } else {
        apiQueryClient.invalidateQueries('instanceView')
      }
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

  const canResize = instanceCan.update(instance)
  const willChange =
    form.watch('ncpus') !== instance.ncpus || form.watch('memory') !== instance.memory / GiB
  const isDisabled = !form.formState.isValid || !canResize || !willChange

  const onAction = form.handleSubmit(({ ncpus, memory }) => {
    instanceUpdate.mutate({
      path: { instance: instance.name },
      query: { project },
      body: { ncpus, memory: memory * GiB, bootDisk: instance.bootDiskId },
    })
  })

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
                  Current ({instance.name}): {instance.ncpus} vCPUs /{' '}
                  {instance.memory / GiB} GiB
                </div>
              }
            />
          )}
          <form autoComplete="off" className="space-y-4">
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
                  return `CPUs capped to ${INSTANCE_MAX_CPU}`
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
        onDismiss={onDismiss}
        onAction={onAction}
        actionText="Resize"
        actionLoading={instanceUpdate.isPending}
        disabled={isDisabled}
      />
    </Modal>
  )
}
