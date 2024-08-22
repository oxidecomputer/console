/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { filesize } from 'filesize'
import { useMemo } from 'react'
import { Link, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiQuery,
  usePrefetchedApiQuery,
  type InstanceNetworkInterface,
} from '@oxide/api'
import { Instances24Icon } from '@oxide/design-system/icons/react'

import { instanceTransitioning } from '~/api/util'
import { ExternalIps } from '~/components/ExternalIps'
import { InstanceDocsPopover } from '~/components/InstanceDocsPopover'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { RefreshButton } from '~/components/RefreshButton'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { InstanceStatusBadge } from '~/components/StatusBadge'
import { getInstanceSelector, useInstanceSelector } from '~/hooks'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { DateTime } from '~/ui/lib/DateTime'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { Spinner } from '~/ui/lib/Spinner'
import { Tooltip } from '~/ui/lib/Tooltip'
import { Truncate } from '~/ui/lib/Truncate'
import { pb } from '~/util/path-builder'

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

export function InstancePage() {
  const instanceSelector = useInstanceSelector()

  const navigate = useNavigate()
  const makeActions = useMakeInstanceActions(instanceSelector, {
    onSuccess: refreshData,
    // go to project instances list since there's no more instance
    onDelete: () => {
      apiQueryClient.invalidateQueries('instanceList')
      navigate(pb.instances(instanceSelector))
    },
  })

  const { data: instance } = usePrefetchedApiQuery(
    'instanceView',
    {
      path: { instance: instanceSelector.instance },
      query: { project: instanceSelector.project },
    },
    {
      refetchInterval: ({ state: { data: instance } }) =>
        instance && instanceTransitioning(instance) ? 1000 : false,
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

  const actions = useMemo(
    () => [
      {
        label: 'Copy ID',
        onActivate() {
          window.navigator.clipboard.writeText(instance.id || '')
        },
      },
      ...makeActions(instance),
    ],
    [instance, makeActions]
  )

  const memory = filesize(instance.memory, { output: 'object', base: 2 })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Instances24Icon />}>{instance.name}</PageTitle>
        <div className="inline-flex gap-2">
          <InstanceDocsPopover />
          <RefreshButton onClick={refreshData} />
          <MoreActionsMenu label="Instance actions" actions={actions} />
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
          <PropertiesTable.Row label="status">
            <div className="flex">
              <InstanceStatusBadge status={instance.runState} />
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
                className="link-with-underline group text-sans-semi-md"
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
    </>
  )
}
