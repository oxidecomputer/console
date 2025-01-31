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

import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { Listbox } from '~/ui/lib/Listbox'
import { ALL_ISH } from '~/util/consts'

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

Component.displayName = 'NetworkMetricsTab'
export function Component() {
  const { project, instance } = useInstanceSelector()
  const prefetchPathAndQuery = { path: { instance }, query: { project } }
  const { data: instanceData } = usePrefetchedApiQuery('instanceView', prefetchPathAndQuery)
  const { data: interfaceData } = usePrefetchedApiQuery('instanceNetworkInterfaceList', {
    query: { project, instance, limit: ALL_ISH },
  })

  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker({
    initialPreset: 'lastDay',
  })

  const networks = useMemo(
    () => interfaceData.items.map(({ name, id }) => ({ name, id })),
    [interfaceData]
  )

  const [nic, setNic] = useState({
    name: networks[0]?.name || '',
    id: networks[0]?.id || '',
  })
  const items = networks.map(({ name }) => ({ label: name, value: name }))

  const commonProps = {
    startTime,
    endTime,
    instanceId: instanceData.id,
  }

  return (
    <>
      <MetricHeader>
        <Listbox
          className="w-64"
          aria-label="Choose disk"
          name="disk-name"
          selected={nic.name}
          items={items}
          onChange={(val) => {
            if (val) {
              setNic({ name: val, id: networks.find((n) => n.name === val)?.id || '' })
            }
          }}
        />
        {dateTimeRangePicker}
      </MetricHeader>
      <MetricCollection>
        <MetricRow>
          <OxqlMetric
            {...commonProps}
            title="Packets Sent"
            unit="Count"
            metricName="instance_network_interface:packets_sent"
          />
          <OxqlMetric
            {...commonProps}
            title="Packets Received"
            unit="Count"
            metricName="instance_network_interface:packets_received"
          />
        </MetricRow>
        <MetricRow>
          <OxqlMetric
            {...commonProps}
            title="Bytes Sent"
            unit="Bytes"
            metricName="instance_network_interface:bytes_sent"
          />
          <OxqlMetric
            {...commonProps}
            title="Bytes Received"
            unit="Bytes"
            metricName="instance_network_interface:bytes_received"
          />
        </MetricRow>
        <MetricRow>
          <OxqlMetric
            {...commonProps}
            title="Packets Dropped"
            unit="Count"
            metricName="instance_network_interface:packets_dropped"
          />
        </MetricRow>
      </MetricCollection>
    </>
  )
}
