/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo, useState } from 'react'
import { type LoaderFunctionArgs } from 'react-router'

import {
  apiQueryClient,
  usePrefetchedApiQuery,
  type InstanceNetworkInterface,
} from '@oxide/api'
import { Networking24Icon } from '@oxide/design-system/icons/react'

import {
  MetricCollection,
  MetricHeader,
  MetricRow,
  OxqlMetric,
} from '~/components/oxql-metrics/OxqlMetric'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Listbox } from '~/ui/lib/Listbox'
import { TableEmptyBox } from '~/ui/lib/Table'
import { ALL_ISH } from '~/util/consts'

import { useMetricsContext } from '../common'

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, instance } = getInstanceSelector(params)
  await apiQueryClient.prefetchQuery('instanceNetworkInterfaceList', {
    query: { project, instance, limit: ALL_ISH },
  })
  return null
}

const groupByInstanceId = { cols: ['instance_id'], op: 'sum' } as const

export const handle = { crumb: 'Network' }

export default function NetworkMetricsTab() {
  const { project, instance } = useInstanceSelector()
  const { data: nics } = usePrefetchedApiQuery('instanceNetworkInterfaceList', {
    query: { project, instance, limit: ALL_ISH },
  })

  if (nics.items.length === 0) {
    return (
      <TableEmptyBox>
        <EmptyMessage
          icon={<Networking24Icon />}
          title="No network metrics available"
          body="Network metrics are only available if there are network interfaces attached"
        />
      </TableEmptyBox>
    )
  }

  return <NetworkMetrics nics={nics.items} />
}

function NetworkMetrics({ nics }: { nics: InstanceNetworkInterface[] }) {
  const { project, instance } = useInstanceSelector()
  const { data: instanceData } = usePrefetchedApiQuery('instanceView', {
    path: { instance },
    query: { project },
  })
  const { startTime, endTime, dateTimeRangePicker } = useMetricsContext()

  const nicItems = useMemo(
    () => [
      { label: 'All NICs', value: 'all' },
      ...nics.map((n) => ({ label: n.name, value: n.id })),
    ],
    [nics]
  )

  const [selectedNic, setSelectedNic] = useState(nicItems[0].value)

  const queryBase = {
    startTime,
    endTime,
    eqFilters: useMemo(
      () => ({
        instance_id: instanceData.id,
        interface_id: selectedNic === 'all' ? undefined : selectedNic,
      }),
      [instanceData.id, selectedNic]
    ),
    groupBy: selectedNic === 'all' ? groupByInstanceId : undefined,
  }

  return (
    <>
      <MetricHeader>
        <div className="flex gap-2">
          <Listbox
            className="w-52"
            aria-label="Choose network interface"
            name="nic-name"
            selected={selectedNic}
            items={nicItems}
            onChange={(val) => setSelectedNic(val)}
          />
        </div>
        {dateTimeRangePicker}
      </MetricHeader>
      <MetricCollection>
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
            title="Packets Dropped"
            metricName="instance_network_interface:packets_dropped"
            {...queryBase}
          />
        </MetricRow>
      </MetricCollection>
    </>
  )
}
