/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo } from 'react'
import { type LoaderFunctionArgs } from 'react-router'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'

import {
  MetricCollection,
  MetricHeader,
  MetricRow,
  OxqlMetric,
} from '~/components/oxql-metrics/OxqlMetric'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'

import { useMetricsContext } from '../MetricsTab'

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

  const queryBase = {
    metricName: 'virtual_machine:vcpu_usage' as const,
    startTime,
    endTime,
    groupBy: { cols: ['vcpu_id'], op: 'sum' } as const,
  }

  // all this memoization is ridiculous, but we need the filters referentially
  // table or everything will re-render too much
  const filterBase = useMemo(() => ({ instance_id: instanceData.id }), [instanceData.id])

  return (
    <>
      <MetricHeader>
        {intervalPicker} {dateTimeRangePicker}
      </MetricHeader>
      <MetricCollection>
        <MetricRow>
          <OxqlMetric
            title="CPU Utilization"
            eqFilters={useMemo(() => ({ ...filterBase }), [filterBase])}
            {...queryBase}
          />
        </MetricRow>
        {/* <MetricRow>
          <OxqlMetric
            title="CPU Utilization: Running"
            eqFilters={useMemo(() => ({ ...filterBase, state: 'run' }), [filterBase])}
            {...queryBase}
          />
        </MetricRow>
        <MetricRow>
          <OxqlMetric
            title="CPU Utilization: Emulation"
            eqFilters={useMemo(() => ({ ...filterBase, state: 'emulation' }), [filterBase])}
            {...queryBase}
          />
        </MetricRow>

        <MetricRow>
          <OxqlMetric
            title="CPU Utilization: Idling"
            eqFilters={useMemo(() => ({ ...filterBase, state: 'idle' }), [filterBase])}
            {...queryBase}
          />
          <OxqlMetric
            title="CPU Utilization: Waiting"
            eqFilters={useMemo(() => ({ ...filterBase, state: 'waiting' }), [filterBase])}
            {...queryBase}
          />
        </MetricRow> */}
      </MetricCollection>
    </>
  )
}
