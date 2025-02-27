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

import { useMetricsContext } from '../common'

export const handle = { crumb: 'CPU' }

export default function CpuMetricsTab() {
  const { project, instance } = useInstanceSelector()
  const { data: instanceData } = usePrefetchedApiQuery('instanceView', {
    path: { instance },
    query: { project },
  })
  const { startTime, endTime, dateTimeRangePicker } = useMetricsContext()

  type CpuChartType = OxqlVcpuState | 'all'

  const stateItems: { label: string; value: CpuChartType }[] = [
    { label: 'State: Running', value: 'run' },
    { label: 'State: Emulating', value: 'emulation' },
    { label: 'State: Idling', value: 'idle' },
    { label: 'State: Waiting', value: 'waiting' },
    { label: 'All states', value: 'all' },
  ]
  const [selectedState, setSelectedState] = useState(stateItems[0].value)

  const CpuStateMetric = ({ state }: { state: CpuChartType }) => (
    <OxqlMetric
      title={`CPU Utilization: ${stateItems.find((i) => i.value === state)?.label.replace('State: ', '')}`}
      eqFilters={{ instance_id: instanceData.id, state }}
      metricName={'virtual_machine:vcpu_usage' as const}
      startTime={startTime}
      endTime={endTime}
      groupBy={{ cols: ['vcpu_id'], op: 'sum' } as const}
    />
  )

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
              <CpuStateMetric state="run" />
              <CpuStateMetric state="emulation" />
            </MetricRow>

            <MetricRow>
              <CpuStateMetric state="idle" />
              <CpuStateMetric state="waiting" />
            </MetricRow>
          </>
        ) : (
          <MetricRow>
            <CpuStateMetric state={selectedState} />
          </MetricRow>
        )}
      </MetricCollection>
    </>
  )
}
