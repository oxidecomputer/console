/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import React, { Suspense, useMemo } from 'react'

import { getChartData, useApiQuery, type ChartDatum } from '@oxide/api'

import { Spinner } from '~/ui/lib/Spinner'

const TimeSeriesChart = React.lazy(() => import('~/components/TimeSeriesChart'))

/** convert to UTC and return the timezone-free format required by OxQL */
const oxqlTimestamp = (date: Date) => date.toISOString().replace('Z', '')

export function getCycleCount(num: number, base: number) {
  let cycleCount = 0
  let transformedValue = num
  while (transformedValue > base) {
    transformedValue = transformedValue / base
    cycleCount++
  }
  return cycleCount
}

type OxqlDiskMetricName =
  | 'virtual_disk:bytes_read'
  | 'virtual_disk:bytes_written'
  | 'virtual_disk:failed_flushes'
  | 'virtual_disk:failed_reads'
  | 'virtual_disk:failed_writes'
  | 'virtual_disk:flushes'
  | 'virtual_disk:io_latency'
  | 'virtual_disk:io_size'
  | 'virtual_disk:reads'
  | 'virtual_disk:writes'

type OxqlVmMetricName = 'virtual_machine:vcpu_usage'

type OxqlMetricName = OxqlDiskMetricName | OxqlVmMetricName

type getOxqlQueryParams = {
  metricName: OxqlMetricName
  startTime: Date
  endTime: Date
  // for disk metrics
  diskId?: string
  // for vm metrics
  vmId?: string
}

const getOxqlQuery = ({
  metricName,
  startTime,
  endTime,
  diskId,
  vmId,
}: getOxqlQueryParams) => {
  const start = oxqlTimestamp(startTime)
  const end = oxqlTimestamp(endTime)
  const filters = [`timestamp >= @${start}`, `timestamp < @${end}`]
  if (diskId) {
    filters.push(`disk_id == "${diskId}"`)
  }
  if (vmId) {
    filters.push(`vm_id == "${vmId}"`)
  }
  return `get ${metricName} | filter ${filters.join(' && ')} | align mean_within(30s)`
}

type OxqlBaseMetricParams = {
  title: string
  unit: 'Bytes' | 'Count'
  metricName: OxqlMetricName
  startTime: Date
  endTime: Date
}

type OxqlDiskMetricParams = OxqlBaseMetricParams & { diskId?: string; vmId?: never }
type OxqlVmMetricParams = OxqlBaseMetricParams & { diskId?: never; vmId?: string }
export function OxqlMetric({
  title,
  unit,
  metricName,
  startTime,
  endTime,
  diskId,
  vmId,
}: OxqlDiskMetricParams | OxqlVmMetricParams) {
  const query = getOxqlQuery({ metricName, startTime, endTime, diskId, vmId })
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
