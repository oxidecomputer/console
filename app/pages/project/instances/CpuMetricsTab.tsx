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

type CpuChartType = OxqlVcpuState | 'all'

const descriptions: Record<OxqlVcpuState, string | undefined> = {
  run: 'Executing guest instructions',
  idle: 'Not executing instructions',
  emulation: 'Handling guest operations in the host (like I/O)',
  waiting: 'Ready but waiting, usually due to contention',
}

export default function CpuMetricsTab() {
  const { project, instance } = useInstanceSelector()
  const { data: instanceData } = usePrefetchedApiQuery('instanceView', {
    path: { instance },
    query: { project },
  })

  const { startTime, endTime, dateTimeRangePicker } = useMetricsContext()

  const queryBase = {
    unit: '%' as const,
    metricName: 'virtual_machine:vcpu_usage' as const,
    startTime,
    endTime,
    groupBy: { cols: ['vcpu_id'], op: 'sum' } as const,
  }

  const stateItems: { label: string; value: CpuChartType }[] = [
    { label: 'State: Running', value: 'run' },
    { label: 'State: Emulation', value: 'emulation' },
    { label: 'State: Idle', value: 'idle' },
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
                description={descriptions.run}
                eqFilters={{ instance_id: instanceData.id, state: 'run' }}
                {...queryBase}
              />
              <OxqlMetric
                title="CPU Utilization: Emulation"
                description={descriptions.emulation}
                eqFilters={{ instance_id: instanceData.id, state: 'emulation' }}
                {...queryBase}
              />
            </MetricRow>

            <MetricRow>
              <OxqlMetric
                title="CPU Utilization: Idle"
                description={descriptions.idle}
                eqFilters={{ instance_id: instanceData.id, state: 'idle' }}
                {...queryBase}
              />
              <OxqlMetric
                title="CPU Utilization: Waiting"
                description={descriptions.waiting}
                eqFilters={{ instance_id: instanceData.id, state: 'waiting' }}
                {...queryBase}
              />
            </MetricRow>
          </>
        ) : (
          <MetricRow>
            <OxqlMetric
              title={title}
              description={descriptions[selectedState]}
              eqFilters={{ instance_id: instanceData.id, state: selectedState }}
              {...queryBase}
            />
          </MetricRow>
        )}
      </MetricCollection>
    </>
  )
}
