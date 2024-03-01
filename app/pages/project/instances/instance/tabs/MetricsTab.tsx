/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import React, { Suspense, useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiQuery,
  usePrefetchedApiQuery,
  type Cumulativeint64,
  type DiskMetricName,
} from '@oxide/api'
import { Listbox, Spinner, Storage24Icon, TableEmptyBox } from '@oxide/ui'

import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { getInstanceSelector, useInstanceSelector } from 'app/hooks'

const TimeSeriesChart = React.lazy(() => import('app/components/TimeSeriesChart'))

export function getCycleCount(num: number, base: number) {
  let cycleCount = 0
  let transformedValue = num
  while (transformedValue > base) {
    transformedValue = transformedValue / base
    cycleCount++
  }
  return cycleCount
}

type DiskMetricParams = {
  title: string
  unit: 'Bytes' | 'Count'
  startTime: Date
  endTime: Date
  metric: DiskMetricName
  diskSelector: {
    project: string
    disk: string
  }
}

function DiskMetric({
  title,
  unit,
  startTime,
  endTime,
  metric,
  diskSelector: { project, disk },
}: DiskMetricParams) {
  // TODO: we're only pulling the first page. Should we bump the cap to 10k?
  // Fetch multiple pages if 10k is not enough? That's a bit much.
  const { data: metrics, isLoading } = useApiQuery(
    'diskMetricsList',
    {
      path: { disk, metric },
      query: { project, startTime, endTime, limit: 3000 },
    },
    // avoid graphs flashing blank while loading when you change the time
    { placeholderData: (x) => x }
  )

  const isBytesChart = unit === 'Bytes'

  const largestValue = useMemo(() => {
    if (!metrics || metrics.items.length === 0) return 0
    return Math.max(...metrics.items.map((m) => (m.datum.datum as Cumulativeint64).value))
  }, [metrics])

  // We'll need to divide each number in the set by a consistent exponent
  // of 1024 (for Bytes) or 1000 (for Counts)
  const base = isBytesChart ? 1024 : 1000
  // Figure out what that exponent is:
  const cycleCount = getCycleCount(largestValue, base)

  // Now that we know how many cycles of "divide by 1024 || 1000" to run through
  // (via cycleCount), we can determine the proper unit for the set
  let unitForSet = ''
  let label = '(COUNT)'
  if (isBytesChart) {
    const byteUnits = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB']
    unitForSet = byteUnits[cycleCount]
    label = `(${unitForSet})`
  }

  const divisor = base ** cycleCount

  const data = useMemo(
    () =>
      (metrics?.items || []).map(({ datum, timestamp }) => ({
        timestamp: timestamp.getTime(),
        // All of these metrics are cumulative ints.
        // The value passed in is what will render in the tooltip.
        value: isBytesChart
          ? // We pass a pre-divided value to the chart if the unit is Bytes
            (datum.datum as Cumulativeint64).value / divisor
          : // If the unit is Count, we pass the raw value
            (datum.datum as Cumulativeint64).value,
      })),
    [metrics, isBytesChart, divisor]
  )

  // Create a label for the y-axis ticks. "Count" charts will be
  // abbreviated and will have a suffix (e.g. "k") appended. Because
  // "Bytes" charts will have already been divided by the divisor
  // before the yAxis is created, we can use their given value.
  const yAxisTickFormatter = (val: number) => {
    if (isBytesChart) {
      return val.toLocaleString()
    }
    const tickValue = (val / divisor).toFixed(2)
    const countUnits = ['', 'k', 'M', 'B', 'T']
    const unitForTick = countUnits[cycleCount]
    return `${tickValue}${unitForTick}`
  }

  return (
    <div className="flex w-1/2 flex-grow flex-col">
      <h2 className="ml-3 flex items-center text-mono-xs text-secondary ">
        {title} <div className="ml-1 normal-case text-quaternary">{label}</div>
        {isLoading && <Spinner className="ml-2" />}
      </h2>
      <Suspense fallback={<div className="mt-3 h-[300px]" />}>
        <TimeSeriesChart
          className="mt-3"
          data={data}
          title={title}
          unit={unitForSet}
          width={480}
          height={240}
          startTime={startTime}
          endTime={endTime}
          yAxisTickFormatter={yAxisTickFormatter}
        />
      </Suspense>
    </div>
  )
}

// We could figure out how to prefetch the metrics data, but it would be
// annoying because it relies on the default date range, plus there are 5 calls.
// Considering the data is going to be swapped out as soon as they change the
// date range, I'm inclined to punt.

MetricsTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, instance } = getInstanceSelector(params)
  await apiQueryClient.prefetchQuery('instanceDiskList', {
    path: { instance },
    query: { project },
  })
  return null
}

export function MetricsTab() {
  const { project, instance } = useInstanceSelector()
  const { data } = usePrefetchedApiQuery('instanceDiskList', {
    path: { instance },
    query: { project },
  })
  const disks = useMemo(() => data?.items || [], [data])

  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker({
    initialPreset: 'lastDay',
  })

  // The fallback here is kind of silly — it is only invoked when there are no
  // disks, in which case we show the fallback UI and diskName is never used. We
  // only need to do it this way because hooks cannot be called conditionally.
  const [diskName, setDiskName] = useState<string>(disks[0]?.name || '')
  const diskItems = disks.map(({ name }) => ({ label: name, value: name }))

  if (disks.length === 0) {
    return (
      <TableEmptyBox>
        <EmptyMessage
          icon={<Storage24Icon />}
          title="No metrics available"
          body="Metrics are only available if there are disks attached"
        />
      </TableEmptyBox>
    )
  }

  const commonProps = {
    startTime,
    endTime,
    diskSelector: { project, disk: diskName },
  }

  return (
    <>
      <div className="mb-4 flex justify-between">
        <Listbox
          className="w-64"
          aria-label="Choose disk"
          name="disk-name"
          selected={diskName}
          items={diskItems}
          onChange={(val) => {
            val && setDiskName(val)
          }}
        />
        {dateTimeRangePicker}
      </div>

      <div className="mt-8 space-y-12">
        {/* see the following link for the source of truth on what these mean
            https://github.com/oxidecomputer/crucible/blob/258f162b/upstairs/src/stats.rs#L9-L50 */}
        <div className="flex w-full space-x-4">
          <DiskMetric {...commonProps} title="Reads" unit="Count" metric="read" />
          <DiskMetric {...commonProps} title="Read" unit="Bytes" metric="read_bytes" />
        </div>

        <div className="flex w-full space-x-4">
          <DiskMetric {...commonProps} title="Writes" unit="Count" metric="write" />
          <DiskMetric {...commonProps} title="Write" unit="Bytes" metric="write_bytes" />
        </div>

        <div className="flex w-full space-x-4">
          <DiskMetric {...commonProps} title="Flushes" unit="Count" metric="flush" />
        </div>
      </div>
    </>
  )
}
