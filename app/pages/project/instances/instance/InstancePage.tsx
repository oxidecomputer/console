/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { format } from 'date-fns'
import filesize from 'filesize'
import { useMemo } from 'react'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type InstanceNetworkInterface,
} from '@oxide/api'
import { EmptyCell } from '@oxide/table'
import {
  Instances24Icon,
  PageHeader,
  PageTitle,
  PropertiesTable,
  Truncate,
} from '@oxide/ui'

import { ExternalIps } from 'app/components/ExternalIps'
import { MoreActionsMenu } from 'app/components/MoreActionsMenu'
import { RouteTabs, Tab } from 'app/components/RouteTabs'
import { InstanceStatusBadge } from 'app/components/StatusBadge'
import { getInstanceSelector, useInstanceSelector, useQuickActions } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { useMakeInstanceActions } from '../actions'
import { VpcNameFromId } from './tabs/NetworkingTab'

function getPrimaryVpcId(nics: InstanceNetworkInterface[]) {
  const nic = nics.find((nic) => nic.primary)
  return nic ? nic.vpcId : undefined
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
  const queryClient = useApiQueryClient()
  const makeActions = useMakeInstanceActions(instanceSelector, {
    onSuccess: () => {
      queryClient.invalidateQueries('instanceView')
    },
    // go to project instances list since there's no more instance
    onDelete: () => navigate(pb.instances(instanceSelector)),
  })

  const { data: instance } = usePrefetchedApiQuery('instanceView', {
    path: { instance: instanceSelector.instance },
    query: { project: instanceSelector.project },
  })

  const { data: nics } = usePrefetchedApiQuery('instanceNetworkInterfaceList', {
    query: {
      project: instanceSelector.project,
      instance: instanceSelector.instance,
    },
  })
  const primaryVpcId = getPrimaryVpcId(nics.items)

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
  const quickActions = useMemo(
    () =>
      actions
        // in the quick menu we do not show disabled actions
        .filter((a) => !a.disabled)
        // append "instance" to labels
        // TODO: if these were in an "Instance actions" subsection they might not
        // need the suffix for clarity
        .map((a) => ({ onSelect: a.onActivate, value: a.label })),
    [actions]
  )
  useQuickActions(quickActions)

  const memory = filesize(instance.memory, { output: 'object', base: 2 })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Instances24Icon />}>{instance.name}</PageTitle>
        <MoreActionsMenu label="Instance actions" actions={actions} />
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
            <InstanceStatusBadge status={instance.runState} />
          </PropertiesTable.Row>
          <PropertiesTable.Row label="vpc">
            <span className="text-secondary">
              {primaryVpcId ? VpcNameFromId({ value: primaryVpcId }) : <EmptyCell />}
            </span>
          </PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="description">
            <span className="text-secondary">
              <Truncate text={instance.description} maxLength={40} />
            </span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="created">
            <span className="text-secondary">
              {format(instance.timeCreated, 'MMM d, yyyy')}{' '}
            </span>
            <span className="ml-1 text-quaternary">
              {format(instance.timeCreated, 'p')}
            </span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="id">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-secondary">
              {instance.id}
            </span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="external IP">
            {<ExternalIps {...instanceSelector} />}
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>
      <RouteTabs fullWidth>
        <Tab to={pb.instanceStorage(instanceSelector)}>Storage</Tab>
        <Tab to={pb.instanceMetrics(instanceSelector)}>Metrics</Tab>
        <Tab to={pb.nics(instanceSelector)}>Network Interfaces</Tab>
        <Tab to={pb.instanceConnect(instanceSelector)}>Connect</Tab>
      </RouteTabs>
    </>
  )
}
