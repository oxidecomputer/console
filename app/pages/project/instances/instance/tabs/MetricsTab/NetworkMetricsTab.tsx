/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo, useState } from 'react'
import { type LoaderFunctionArgs } from 'react-router'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'

import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { Listbox } from '~/ui/lib/Listbox'
import { ALL_ISH } from '~/util/consts'

import { useMetricsContext } from '../MetricsTab'
import {
  getOxqlQuery,
  MetricCollection,
  MetricHeader,
  MetricRow,
  OxqlMetric,
  type OxqlNetworkMetricName,
} from './OxqlMetric'

export async function loader({ params }: LoaderFunctionArgs) {
  const { project, instance } = getInstanceSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('instanceDiskList', {
      path: { instance },
      query: { project },
    }),
    apiQueryClient.prefetchQuery('instanceView', {
      path: { instance },
      query: { project },
    }),
    // add interface prefetch
    apiQueryClient.prefetchQuery('instanceNetworkInterfaceList', {
      query: { project, instance, limit: ALL_ISH },
    }),
  ])
  return null
}

Component.displayName = 'NetworkMetricsTab'
export function Component() {
  const { project, instance } = useInstanceSelector()
  const prefetchPathAndQuery = { path: { instance }, query: { project } }
  const { data: instanceData } = usePrefetchedApiQuery('instanceView', prefetchPathAndQuery)
  const { data: interfaceData } = usePrefetchedApiQuery('instanceNetworkInterfaceList', {
    query: { project, instance, limit: ALL_ISH },
  })

  const { startTime, endTime, dateTimeRangePicker } = useMetricsContext()

  const networks = useMemo(
    () => [
      { name: 'All NICs', id: 'all' },
      ...interfaceData.items.map(({ name, id }) => ({ name, id })),
    ],
    [interfaceData]
  )

  const [nic, setNic] = useState(networks[0])
  const items = networks.map(({ name, id }) => ({ label: name, value: id }))

  const getQuery = (metricName: OxqlNetworkMetricName) =>
    getOxqlQuery({
      metricName,
      startTime,
      endTime,
      instanceId: instanceData.id,
      interfaceId: nic.id === 'all' ? undefined : nic.id,
      group: nic.id === 'all',
    })

  return (
    <>
      <MetricHeader>
        <Listbox
          className="w-64"
          aria-label="Choose disk"
          name="disk-name"
          selected={nic.id}
          items={items}
          onChange={(val) => {
            setNic({
              name: networks.find((n) => n.id === val)?.name || 'All NICs',
              id: val,
            })
          }}
        />
        {dateTimeRangePicker}
      </MetricHeader>
      <MetricCollection>
        <MetricRow>
          <OxqlMetric
            title="Packets Sent"
            query={getQuery('instance_network_interface:packets_sent')}
            startTime={startTime}
            endTime={endTime}
          />
          <OxqlMetric
            title="Packets Received"
            query={getQuery('instance_network_interface:packets_received')}
            startTime={startTime}
            endTime={endTime}
          />
        </MetricRow>
        <MetricRow>
          <OxqlMetric
            title="Bytes Sent"
            query={getQuery('instance_network_interface:bytes_sent')}
            startTime={startTime}
            endTime={endTime}
          />
          <OxqlMetric
            title="Bytes Received"
            query={getQuery('instance_network_interface:bytes_received')}
            startTime={startTime}
            endTime={endTime}
          />
        </MetricRow>
        <MetricRow>
          <OxqlMetric
            title="Packets Dropped"
            query={getQuery('instance_network_interface:packets_dropped')}
            startTime={startTime}
            endTime={endTime}
          />
        </MetricRow>
      </MetricCollection>
    </>
  )
}
