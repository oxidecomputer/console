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

import { OxqlMetric } from './OxqlMetric'

// We could figure out how to prefetch the metrics data, but it would be
// annoying because it relies on the default date range, plus there are 5 calls.
// Considering the data is going to be swapped out as soon as they change the
// date range, I'm inclined to punt.

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
    initialPreset: 'lastDay',
  })

  // The fallback here is kind of silly — it is only invoked when there are no
  // disks, in which case we show the fallback UI and diskName is never used. We
  // only need to do it this way because hooks cannot be called conditionally.
  const [cpuId, setCpuId] = useState<string>('all')
  // Revisit this for selecting a CPU
  // const [diskId, setDiskId] = useState<string>(disks[0]?.id || '')

  // an array, of label and values, with the first one being 'all' and value is undefined, then the rest of the cpus
  // up to ncpus, with each label being a string of the number, and the value being the number; start with 0, then go up to one less than the total number of cpus
  const cpuItems = [
    { label: 'All', value: 'all' },
    ...Array.from({ length: ncpus }, (_, i) => ({
      label: i.toString(),
      value: i.toString(),
    })),
  ]

  const vcpuId = cpuId === 'all' ? undefined : cpuId

  return (
    <>
      <div className="mb-4 flex justify-between">
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
      </div>
      <div className="mt-8 space-y-12">
        <div className="flex w-full space-x-4">
          <OxqlMetric
            startTime={startTime}
            endTime={endTime}
            title="CPU Utilization"
            unit="%"
            metricName="virtual_machine:vcpu_usage"
            instanceId={instanceData.id}
            vcpuId={vcpuId}
            join
          />
        </div>
        <div className="flex w-full space-x-4">
          <OxqlMetric
            startTime={startTime}
            endTime={endTime}
            title="CPU Utilization: Running"
            unit="%"
            metricName="virtual_machine:vcpu_usage"
            state="run"
            instanceId={instanceData.id}
            vcpuId={vcpuId}
            join
          />
          <OxqlMetric
            startTime={startTime}
            endTime={endTime}
            title="CPU Utilization: Idling"
            unit="%"
            metricName="virtual_machine:vcpu_usage"
            state="idle"
            instanceId={instanceData.id}
            vcpuId={vcpuId}
            join
          />
        </div>

        <div className="flex w-full space-x-4">
          <OxqlMetric
            startTime={startTime}
            endTime={endTime}
            title="CPU Utilization: Waiting"
            unit="%"
            metricName="virtual_machine:vcpu_usage"
            state="waiting"
            instanceId={instanceData.id}
            vcpuId={vcpuId}
            join
          />
          <OxqlMetric
            startTime={startTime}
            endTime={endTime}
            title="CPU Utilization: Emulation"
            unit="%"
            metricName="virtual_machine:vcpu_usage"
            state="emulation"
            instanceId={instanceData.id}
            vcpuId={vcpuId}
            join
          />
        </div>
      </div>
    </>
  )
}
