/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import React, { Suspense, useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router'

import {
  apiQueryClient,
  getChartData,
  useApiQuery,
  usePrefetchedApiQuery,
  type ChartDatum,
} from '@oxide/api'
import { Storage24Icon } from '@oxide/design-system/icons/react'

import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Listbox } from '~/ui/lib/Listbox'
import { Spinner } from '~/ui/lib/Spinner'
import { TableEmptyBox } from '~/ui/lib/Table'

const TimeSeriesChart = React.lazy(() => import('~/components/TimeSeriesChart'))

export function getCycleCount(num: number, base: number) {
  let cycleCount = 0
  let transformedValue = num
  while (transformedValue > base) {
    transformedValue = transformedValue / base
    cycleCount++
  }
  return cycleCount
}

/** convert to UTC and return the timezone-free format required by OxQL */
const oxqlTimestamp = (date: Date) => date.toISOString().replace('Z', '')

type getOxqlQueryParams = {
  metric: string
  diskId: string
  startTime: Date
  endTime: Date
}

const getOxqlQuery = ({ metric, diskId, startTime, endTime }: getOxqlQueryParams) => {
  const start = oxqlTimestamp(startTime)
  const end = oxqlTimestamp(endTime)
  return `get virtual_disk:${metric} | filter timestamp >= @${start} && timestamp < @${end} && disk_id == "${diskId}" | align mean_within(30s)`
}

// Should probaby be generated in Api.ts
type OxqlDiskMetricName =
  | 'bytes_read'
  | 'bytes_written'
  | 'failed_flushes'
  | 'failed_reads'
  | 'failed_writes'
  | 'flushes'
  | 'io_latency'
  | 'io_size'
  | 'reads'
  | 'writes'

type OxqlDiskMetricParams = {
  title: string
  unit: 'Bytes' | 'Count'
  metric: OxqlDiskMetricName
  startTime: Date
  endTime: Date
  diskSelector: {
    project: string
    disk: string
    diskId: string
  }
}

function OxqlDiskMetric({
  title,
  unit,
  metric,
  startTime,
  endTime,
  diskSelector,
}: OxqlDiskMetricParams) {
  const { diskId } = diskSelector

  const query = getOxqlQuery({ metric, diskId, startTime, endTime })
  const { data: metrics } = useApiQuery('systemTimeseriesQuery', { body: { query } })
  const chartData: ChartDatum[] = useMemo(() => getChartData(metrics), [metrics])

  const isBytesChart = unit === 'Bytes'

  const largestValue = useMemo(() => {
    if (!chartData || chartData.length === 0) return 0
    return chartData.reduce((max, i) => Math.max(max, i.value), 0)
  }, [chartData])

  // We'll need to divide each number in the set by a consistent exponent
  // of 1024 (for Bytes) or 1000 (for Counts)
  const base = isBytesChart ? 1024 : 1000
  // Figure out what that exponent is
  const cycleCount = getCycleCount(largestValue, base)

  // Now that we know how many cycles of "divide by 1024 || 1000" to run through
  // (via cycleCount), we can determine the proper unit for the set
  let unitForSet = ''
  let label = ''
  if (chartData.length > 0) {
    if (isBytesChart) {
      const byteUnits = ['BYTES', 'KiB', 'MiB', 'GiB', 'TiB']
      unitForSet = byteUnits[cycleCount]
      label = `(${unitForSet})`
    } else {
      label = '(COUNT)'
    }
  }

  const divisor = base ** cycleCount

  const data = useMemo(
    () =>
      (chartData || []).map(({ timestamp, value }) => ({
        timestamp,
        // All of these metrics are cumulative ints.
        // The value passed in is what will render in the tooltip.
        value: isBytesChart
          ? // We pass a pre-divided value to the chart if the unit is Bytes
            value / divisor
          : // If the unit is Count, we pass the raw value
            value,
      })),
    [isBytesChart, divisor, chartData]
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
    <div className="flex w-1/2 grow flex-col">
      <h2 className="ml-3 flex items-center text-mono-xs text-default">
        {title} <div className="ml-1 normal-case text-tertiary">{label}</div>
        {!metrics && <Spinner className="ml-2" />}
      </h2>
      <Suspense fallback={<div className="mt-3 h-[300px]" />}>
        <TimeSeriesChart
          className="mt-3"
          data={data}
          title="Reads"
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

export async function loader({ params }: LoaderFunctionArgs) {
  const { project, instance } = getInstanceSelector(params)
  await apiQueryClient.prefetchQuery('instanceDiskList', {
    path: { instance },
    query: { project },
  })
  return null
}

Component.displayName = 'MetricsTab'
export function Component() {
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
  const [diskId, setDiskId] = useState<string>(disks[0]?.id || '')
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
    diskSelector: { project, disk: diskName, diskId },
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
            if (val) {
              setDiskName(val)
              setDiskId(disks.find((d) => d.name === val)?.id || '')
            }
          }}
        />
        {dateTimeRangePicker}
      </div>

      <div className="mt-8 space-y-12">
        {/* see the following link for the source of truth on what these mean
            https://github.com/oxidecomputer/crucible/blob/258f162b/upstairs/src/stats.rs#L9-L50 */}

        <div className="flex w-full space-x-4">
          <OxqlDiskMetric {...commonProps} title="Reads" unit="Count" metric="reads" />
          <OxqlDiskMetric {...commonProps} title="Read" unit="Bytes" metric="bytes_read" />
        </div>

        <div className="flex w-full space-x-4">
          <OxqlDiskMetric {...commonProps} title="Writes" unit="Count" metric="writes" />
          <OxqlDiskMetric
            {...commonProps}
            title="Write"
            unit="Bytes"
            metric="bytes_written"
          />
        </div>

        <div className="flex w-full space-x-4">
          <OxqlDiskMetric {...commonProps} title="Flushes" unit="Count" metric="flushes" />
        </div>
      </div>
    </>
  )
}
