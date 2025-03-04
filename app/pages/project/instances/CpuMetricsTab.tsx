/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useState } from 'react'

import { usePrefetchedApiQuery } from '@oxide/api'

import {
  MetricCollection,
  MetricHeader,
  MetricRow,
  OxqlMetric,
} from '~/components/oxql-metrics/OxqlMetric'
import type { OxqlVcpuState } from '~/components/oxql-metrics/util'
import { useInstanceSelector } from '~/hooks/use-params'
import { Listbox } from '~/ui/lib/Listbox'

import { useMetricsContext } from './common'

export default function CpuMetricsTab() {
  const { project, instance } = useInstanceSelector()
  const { data: instanceData } = usePrefetchedApiQuery('instanceView', {
    path: { instance },
    query: { project },
  })

  const { startTime, endTime, dateTimeRangePicker, intervalPicker } = useMetricsContext()

  type CpuChartType = OxqlVcpuState | 'all'

  const queryBase = {
    unit: '%' as const,
    metricName: 'virtual_machine:vcpu_usage' as const,
    startTime,
    endTime,
    groupBy: { cols: ['vcpu_id'], op: 'sum' } as const,
  }

  const stateItems: { label: string; value: CpuChartType }[] = [
    { label: 'State: Running', value: 'run' },
    { label: 'State: Emulating', value: 'emulation' },
    { label: 'State: Idling', value: 'idle' },
    { label: 'State: Waiting', value: 'waiting' },
    { label: 'All states', value: 'all' },
  ]

  const [selectedState, setSelectedState] = useState(stateItems[0].value)

  const title = `CPU Utilization: ${stateItems
    .find((i) => i.value === selectedState)
    ?.label.replace('State: ', '')}`
  return (
    <>
      <MetricHeader>
        <div className="flex gap-2">
          {intervalPicker}
          <Listbox
            className="w-52"
            aria-label="Choose state"
            name="disk-name"
            selected={selectedState}
            items={stateItems}
            onChange={(value) => setSelectedState(value)}
          />
        </div>
        {dateTimeRangePicker}
      </MetricHeader>
      <MetricCollection>
        {selectedState === 'all' ? (
          <>
            <MetricRow>
              <OxqlMetric
                title="CPU Utilization: Running"
                eqFilters={{ instance_id: instanceData.id, state: 'run' }}
                {...queryBase}
              />
              <OxqlMetric
                title="CPU Utilization: Emulation"
                eqFilters={{ instance_id: instanceData.id, state: 'emulation' }}
                {...queryBase}
              />
            </MetricRow>

            <MetricRow>
              <OxqlMetric
                title="CPU Utilization: Idling"
                eqFilters={{ instance_id: instanceData.id, state: 'idle' }}
                {...queryBase}
              />
              <OxqlMetric
                title="CPU Utilization: Waiting"
                eqFilters={{ instance_id: instanceData.id, state: 'waiting' }}
                {...queryBase}
              />
            </MetricRow>
          </>
        ) : (
          <MetricRow>
            <OxqlMetric
              title={title}
              eqFilters={{ instance_id: instanceData.id, state: selectedState }}
              {...queryBase}
            />
          </MetricRow>
        )}
      </MetricCollection>
    </>
  )
}
