/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo, useState } from 'react'

import { usePrefetchedApiQuery } from '@oxide/api'

import {
  MetricCollection,
  MetricHeader,
  MetricRow,
  OxqlMetric,
} from '~/components/oxql-metrics/OxqlMetric'
import { useInstanceSelector } from '~/hooks/use-params'
import { Listbox } from '~/ui/lib/Listbox'

import { useMetricsContext } from '../MetricsTab'

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

  const stateItems = [
    { label: 'State: Running', value: 'run' },
    { label: 'State: Emulating', value: 'emulation' },
    { label: 'State: Idling', value: 'idle' },
    { label: 'State: Waiting', value: 'waiting' },
    { label: 'All states', value: 'all' },
  ]

  const [selectedState, setSelectedState] = useState(stateItems[0].value)

  const title = `CPU Utilization: ${stateItems
    .find((i) => i.value === selectedState)
    ?.label.replace('State: ', '')
    .replace('All states', 'Total')}`
  const state = selectedState === 'all' ? undefined : selectedState
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
        <MetricRow>
          <OxqlMetric
            title={title}
            eqFilters={useMemo(() => ({ ...filterBase, state }), [filterBase, state])}
            {...queryBase}
          />
        </MetricRow>
        {selectedState === 'all' && (
          <>
            <MetricRow>
              <OxqlMetric
                title="CPU Utilization: Running"
                eqFilters={{ ...filterBase, state: 'run' }}
                {...queryBase}
              />
              <OxqlMetric
                title="CPU Utilization: Emulation"
                eqFilters={{ ...filterBase, state: 'emulation' }}
                {...queryBase}
              />
            </MetricRow>

            <MetricRow>
              <OxqlMetric
                title="CPU Utilization: Idling"
                eqFilters={{ ...filterBase, state: 'idle' }}
                {...queryBase}
              />
              <OxqlMetric
                title="CPU Utilization: Waiting"
                eqFilters={{ ...filterBase, state: 'waiting' }}
                {...queryBase}
              />
            </MetricRow>
          </>
        )}
      </MetricCollection>
    </>
  )
}
