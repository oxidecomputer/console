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
import { MetricCollection, MetricHeader, MetricRow, OxqlMetric } from './OxqlMetric'

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

const groupByInstanceId = { cols: ['instance_id'], op: 'sum' } as const

Component.displayName = 'NetworkMetricsTab'
export function Component() {
  const { project, instance } = useInstanceSelector()
  const prefetchPathAndQuery = { path: { instance }, query: { project } }
  const { data: instanceData } = usePrefetchedApiQuery('instanceView', prefetchPathAndQuery)
  const { data: interfaceData } = usePrefetchedApiQuery('instanceNetworkInterfaceList', {
    query: { project, instance, limit: ALL_ISH },
  })

  const { startTime, endTime, dateTimeRangePicker, intervalPicker } = useMetricsContext()

  const networks = useMemo(
    () => [
      { name: 'All NICs', id: 'all' },
      ...interfaceData.items.map(({ name, id }) => ({ name, id })),
    ],
    [interfaceData]
  )

  const [nic, setNic] = useState(networks[0])
  const items = networks.map(({ name, id }) => ({ label: name, value: id }))

  const queryBase = {
    startTime,
    endTime,
    eqFilters: useMemo(
      () => ({
        instance_id: instanceData.id,
        interface_id: nic.id === 'all' ? undefined : nic.id,
      }),
      [instanceData.id, nic.id]
    ),
    groupBy: nic.id === 'all' ? groupByInstanceId : undefined,
  }

  return (
    <>
      <MetricHeader>
        <div className="flex gap-2">
          {intervalPicker}

          {networks.length > 2 && (
            <Listbox
              className="w-52"
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
          )}
        </div>
        {dateTimeRangePicker}
      </MetricHeader>
      <MetricCollection>
        <MetricRow>
          <OxqlMetric
            title="Packets Sent"
            description="Number of packets sent on the link"
            metricName="instance_network_interface:packets_sent"
            {...queryBase}
          />
          <OxqlMetric
            title="Packets Received"
            description="Number of packets received on the link"
            metricName="instance_network_interface:packets_received"
            {...queryBase}
          />
        </MetricRow>
        <MetricRow>
          <OxqlMetric
            title="Bytes Sent"
            description="Number of bytes sent on the link"
            metricName="instance_network_interface:bytes_sent"
            {...queryBase}
          />
          <OxqlMetric
            title="Bytes Received"
            description="Number of bytes received on the link"
            metricName="instance_network_interface:bytes_received"
            {...queryBase}
          />
        </MetricRow>
        <MetricRow>
          <OxqlMetric
            title="Packets Dropped"
            metricName="instance_network_interface:packets_dropped"
            {...queryBase}
          />
        </MetricRow>
      </MetricCollection>
    </>
  )
}
