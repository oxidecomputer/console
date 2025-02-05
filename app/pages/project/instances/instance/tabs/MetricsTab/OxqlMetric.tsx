/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/*
 * OxQL Metrics Schema:
 * https://github.com/oxidecomputer/omicron/tree/main/oximeter/oximeter/schema
 */

import React, { Suspense, useMemo } from 'react'

import { getChartData, useApiQuery, type ChartDatum } from '@oxide/api'

import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { getDurationMinutes } from '~/util/date'

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

export type OxqlDiskMetricName =
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

export type OxqlVmMetricName = 'virtual_machine:vcpu_usage'

export type OxqlNetworkMetricName =
  | 'instance_network_interface:bytes_received'
  | 'instance_network_interface:bytes_sent'
  | 'instance_network_interface:errors_received'
  | 'instance_network_interface:errors_sent'
  | 'instance_network_interface:packets_dropped'
  | 'instance_network_interface:packets_received'
  | 'instance_network_interface:packets_sent'

export type OxqlMetricName = OxqlDiskMetricName | OxqlVmMetricName | OxqlNetworkMetricName

export type OxqlVcpuState = 'run' | 'idle' | 'waiting' | 'emulation'

/** determine the mean window for the given time range */
const getMeanWindow = (start: Date, end: Date) => {
  const duration = getDurationMinutes({ start, end })
  // the number of points in the chart
  const points = 100
  return `${Math.round(duration / points)}m`
}

type getOxqlQueryParams = {
  metricName: OxqlMetricName
  startTime: Date
  endTime: Date
  instanceId?: string
  // for cpu metrics
  vcpuId?: string
  // for disk metrics
  diskId?: string
  attachedInstanceId?: string
  // for network metrics
  interfaceId?: string
  state?: OxqlVcpuState
  group?: boolean
}

export const getOxqlQuery = ({
  metricName,
  startTime,
  endTime,
  instanceId,
  diskId,
  attachedInstanceId,
  interfaceId,
  vcpuId,
  state,
  group,
}: getOxqlQueryParams) => {
  const start = oxqlTimestamp(startTime)
  const end = oxqlTimestamp(endTime)
  const filters = [`timestamp >= @${start}`, `timestamp < @${end}`]
  if (diskId) {
    filters.push(`disk_id == "${diskId}"`)
  }
  if (vcpuId) {
    filters.push(`vcpu_id == ${vcpuId}`)
  }
  if (instanceId) {
    filters.push(`instance_id == "${instanceId}"`)
  }
  if (interfaceId) {
    filters.push(`interface_id == "${interfaceId}"`)
  }
  if (attachedInstanceId) {
    filters.push(`attached_instance_id == "${attachedInstanceId}"`)
  }
  if (state) {
    filters.push(`state == "${state}"`)
  }
  const meanWindow = getMeanWindow(startTime, endTime)
  const groupByString =
    group && attachedInstanceId
      ? ' | group_by [attached_instance_id], sum'
      : group && instanceId
        ? ' | group_by [instance_id], sum'
        : ''
  const query = `get ${metricName} | filter ${filters.join(' && ')} | align mean_within(${meanWindow})${groupByString}`
  // console.log(query)
  return query
}

export function OxqlMetric({
  title,
  description,
  query,
  startTime,
  endTime,
}: {
  title: string
  description?: string
  query: string
  startTime: Date
  endTime: Date
}) {
  const { data: metrics } = useApiQuery('systemTimeseriesQuery', { body: { query } })
  const chartData: ChartDatum[] = useMemo(() => getChartData(metrics), [metrics])

  const unit = title.includes('Bytes')
    ? 'Bytes'
    : title.includes('Utilization')
      ? '%'
      : 'Count'

  const isBytesChart = unit === 'Bytes'
  const isPercentChart = unit === '%'

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
      label = `(${unit.toUpperCase()})`
      unitForSet = isPercentChart ? '%' : ''
    }
  }

  // We need to determine the divisor for the data set.
  // - If the unit is Bytes, we divide by 1024 ** cycleCount
  // - If the unit is %, we divide by the number of nanoseconds in a minute
  // - If the unit is Count, we just return the raw value
  const divisor = isBytesChart ? base ** cycleCount : isPercentChart ? 600000000 : 1

  const data = useMemo(
    () =>
      (chartData || []).map(({ timestamp, value }) => ({
        timestamp,
        // The value passed in is what will render in the tooltip
        value: value / divisor,
      })),
    [divisor, chartData]
  )

  // Create a label for the y-axis ticks. "Count" charts will be
  // abbreviated and will have a suffix (e.g. "k") appended. Because
  // "Bytes" charts will have already been divided by the divisor
  // before the yAxis is created, we can use their given value.
  const yAxisTickFormatter = (val: number) => {
    if (isBytesChart) {
      return val.toLocaleString()
    }
    if (isPercentChart) {
      return `${val}%`
    }
    const tickValue = val / divisor
    const countUnits = ['', 'k', 'M', 'B', 'T']
    const unitForTick = countUnits[cycleCount]
    return `${tickValue}${unitForTick}`
  }

  const menuActions = useMemo(
    () => [
      {
        label: 'Copy query',
        onActivate() {
          window.navigator.clipboard.writeText(query)
        },
      },
    ],
    [query]
  )

  return (
    <div className="flex w-full grow flex-col rounded-lg border border-default">
      <div className="flex items-baseline justify-between border-b px-6 py-5 border-secondary">
        <div>
          <h2 className="flex items-center">
            {title} <div className="text-sans-semi-lg text-raise">{label}</div>
          </h2>
          <div className="mt-0.5 text-sans-md text-secondary">{description}</div>
        </div>
        {/* TODO: show formatted string to user so they can see it before copying */}
        <MoreActionsMenu label="Query actions" actions={menuActions} isSmall />
      </div>
      <div className="px-6 py-5">
        <Suspense fallback={<div className="h-[300px]" />}>
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
            hasBorder={false}
          />
        </Suspense>
      </div>
    </div>
  )
}

export const MetricHeader = ({ children }: { children: React.ReactNode }) => {
  // If header has only one child, align it to the end of the container
  const value = React.Children.toArray(children).length === 1 ? 'end' : 'between'
  return (
    <div className={`flex flex-col gap-2 @[48rem]:flex-row justify-${value} mt-8`}>
      {children}
    </div>
  )
}
export const MetricCollection = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-4 flex flex-col gap-4">{children}</div>
)
export const MetricRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex w-full flex-col gap-4 @[48rem]:flex-row">{children}</div>
)
