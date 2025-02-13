/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type LoaderFunctionArgs } from 'react-router'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'

import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'

import { useMetricsContext } from '../MetricsTab'
import {
  getOxqlQuery,
  MetricCollection,
  MetricHeader,
  MetricRow,
  OxqlMetric,
  type OxqlQuery,
  type OxqlVcpuState,
  type OxqlVmMetricName,
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
  ])
  return null
}

Component.displayName = 'CpuMetricsTab'
export function Component() {
  const { project, instance } = useInstanceSelector()
  const { data: instanceData } = usePrefetchedApiQuery('instanceView', {
    path: { instance },
    query: { project },
  })

  const { startTime, endTime, dateTimeRangePicker, intervalPicker } = useMetricsContext()

  const getQuery = (metricName: OxqlVmMetricName, state?: OxqlVcpuState): OxqlQuery => ({
    metricName,
    startTime,
    endTime,
    eqFilters: { instance_id: instanceData.id, state },
    groupBy: { cols: ['instance_id'], op: 'sum' },
  })

  return (
    <>
      <MetricHeader>
        {intervalPicker} {dateTimeRangePicker}
      </MetricHeader>
      <MetricCollection>
        <MetricRow>
          <OxqlMetric
            title="CPU Utilization"
            description="Cumulative time all vCPUs have spent in a state"
            query={getOxqlQuery(getQuery('virtual_machine:vcpu_usage'))}
            q={getQuery('virtual_machine:vcpu_usage')}
            startTime={startTime}
            endTime={endTime}
          />
        </MetricRow>
        <MetricRow>
          <OxqlMetric
            title="CPU Utilization: Running"
            query={getOxqlQuery(getQuery('virtual_machine:vcpu_usage', 'run'))}
            startTime={startTime}
            endTime={endTime}
          />
          <OxqlMetric
            title="CPU Utilization: Idling"
            query={getOxqlQuery(getQuery('virtual_machine:vcpu_usage', 'idle'))}
            startTime={startTime}
            endTime={endTime}
          />
        </MetricRow>

        <MetricRow>
          <OxqlMetric
            title="CPU Utilization: Waiting"
            query={getOxqlQuery(getQuery('virtual_machine:vcpu_usage', 'waiting'))}
            startTime={startTime}
            endTime={endTime}
          />
          <OxqlMetric
            title="CPU Utilization: Emulation"
            query={getOxqlQuery(getQuery('virtual_machine:vcpu_usage', 'emulation'))}
            startTime={startTime}
            endTime={endTime}
          />
        </MetricRow>
      </MetricCollection>
    </>
  )
}
