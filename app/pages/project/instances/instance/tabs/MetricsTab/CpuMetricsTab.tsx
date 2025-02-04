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
import React, { useState } from 'react'
import { type LoaderFunctionArgs } from 'react-router'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'

import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { Listbox } from '~/ui/lib/Listbox'

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
  const ncpus = instanceData?.ncpus || 1

  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker({
    initialPreset: 'lastHour',
  })

  const [cpuId, setCpuId] = useState<string>('all')

  const cpuItems = [
    { label: 'All', value: 'all' },
    ...Array.from({ length: ncpus }, (_, i) => ({
      label: i.toString(),
      value: i.toString(),
    })),
  ]

  const vcpuId = cpuId === 'all' ? undefined : cpuId

  const commonProps = {
    startTime,
    endTime,
    instanceId: instanceData.id,
    vcpuId,
    group: cpuId === 'all',
  }

  return (
    <>
      <MetricHeader>
        <Listbox
          className="w-64"
          aria-label="Choose vCPU to profile"
          name="vcpu-id"
          selected={cpuId}
          items={cpuItems}
          onChange={(val) => {
            setCpuId(val)
          }}
        />
        {dateTimeRangePicker}
      </MetricHeader>
      <MetricCollection>
        <MetricRow>
          <OxqlMetric
            {...commonProps}
            title="CPU Utilization"
            unit="%"
            metricName="virtual_machine:vcpu_usage"
          />
        </MetricRow>
        <MetricRow>
          <OxqlMetric
            {...commonProps}
            title="CPU Utilization: Running"
            unit="%"
            metricName="virtual_machine:vcpu_usage"
            state="run"
          />
          <OxqlMetric
            {...commonProps}
            title="CPU Utilization: Idling"
            unit="%"
            metricName="virtual_machine:vcpu_usage"
            state="idle"
          />
        </MetricRow>

        <MetricRow>
          <OxqlMetric
            {...commonProps}
            title="CPU Utilization: Waiting"
            unit="%"
            metricName="virtual_machine:vcpu_usage"
            state="waiting"
          />
          <OxqlMetric
            {...commonProps}
            title="CPU Utilization: Emulation"
            unit="%"
            metricName="virtual_machine:vcpu_usage"
            state="emulation"
          />
        </MetricRow>
      </MetricCollection>
    </>
  )
}
