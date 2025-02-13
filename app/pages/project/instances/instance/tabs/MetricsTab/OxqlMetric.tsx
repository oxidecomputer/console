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

import { useApiQuery, type ChartDatum, type OxqlQueryResult } from '@oxide/api'

import { CopyCode } from '~/components/CopyCode'
import { classed } from '~/util/classed'
import { getDurationMinutes } from '~/util/date'

// An OxQL Query Result can have multiple tables, but in the web console we only ever call
// aligned timeseries queries, which always have exactly one table.
export const getChartData = (data: OxqlQueryResult | undefined): ChartDatum[] => {
  if (!data) return []
  const ts = Object.values(data.tables[0].timeseries)
  return ts
    .flatMap((t) => {
      const { timestamps, values } = t.points
      const v = values[0].values.values as number[]
      return timestamps.map((timestamp, idx) => ({
        timestamp: new Date(timestamp).getTime(),
        value: v[idx],
      }))
    })
    .slice(1) // first datapoint can be a sum of all datapoints preceding it, so we remove before displaying
}

const TimeSeriesChart = React.lazy(() => import('~/components/TimeSeriesChart'))

/** convert to UTC and return the timezone-free format required by OxQL */
export const oxqlTimestamp = (date: Date) => date.toISOString().replace('Z', '')

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

/** determine the mean window for the given time range;
 * returns a string representing N seconds, e.g. '60s'
 * points = the number of datapoints we want to see in the chart
 *   (default is 60, to show 1 point per minute on a 1-hour chart)
 * We could dynamically adjust this based on the duration of the range,
 * like … for 1 week, show 1 datapoint per hour, for 1 day, show 1 datapoint per minute, etc.
 * */
export const getMeanWindow = (start: Date, end: Date, datapoints = 60) => {
  const durationMinutes = getDurationMinutes({ start, end })
  const durationSeconds = durationMinutes * 60
  return `${Math.round(durationSeconds / datapoints)}s`
}

type FilterKey =
  | 'instance_id'
  // for cpu metrics
  | 'vcpu_id'
  | 'state'
  // for disk metrics
  | 'disk_id'
  | 'attached_instance_id'
  // for network metrics
  | 'interface_id'

type GroupByCol = 'instance_id' | 'attached_instance_id'

type GroupBy = {
  cols: NonEmptyArray<GroupByCol>
  op: 'sum'
}

type OxqlQuery = {
  metricName: OxqlMetricName
  startTime: Date
  endTime: Date
  groupBy?: GroupBy
  eqFilters?: Partial<Record<FilterKey, string>>
}

export const getOxqlQuery = ({
  metricName,
  startTime,
  endTime,
  groupBy,
  eqFilters = {},
}: OxqlQuery) => {
  const meanWindow = getMeanWindow(startTime, endTime)
  // we adjust the start time back by 2x the mean window so that we can
  // 1) drop the first datapoint (the cumulative sum of all previous datapoints)
  // 2) ensure that the first datapoint we display on the chart matches the actual start time
  const secondsToAdjust = parseInt(meanWindow, 10) * 2
  const adjustedStart = new Date(startTime.getTime() - secondsToAdjust * 1000)
  const filters = [
    `timestamp >= @${oxqlTimestamp(adjustedStart)}`,
    `timestamp < @${oxqlTimestamp(endTime)}`,
    ...Object.entries(eqFilters)
      // filter out key present but with falsy value. note that this will also
      // filter out empty string, meaning we can't filter by value = ""
      .filter(([_, v]) => !!v)
      .map(([k, v]) => `${k} == "${v}"`),
  ]

  const groupByString = groupBy
    ? ` | group_by [${groupBy.cols.join(', ')}], ${groupBy.op}`
    : ''

  const query = `get ${metricName} | filter ${filters.join(' && ')} | align mean_within(${meanWindow})${groupByString}`
  // console.log(query)
  return query
}

export type ChartUnitType = 'Bytes' | '%' | 'Count'
export const getUnit = (title: string): ChartUnitType => {
  if (title.includes('Bytes')) return 'Bytes'
  if (title.includes('Utilization')) return '%'
  return 'Count'
}

// Returns 0 if there are no data points
export const getLargestValue = (data: ChartDatum[]) =>
  data.length ? Math.max(0, ...data.map((d) => d.value)) : 0

// not sure this is the best name
export const getOrderOfMagnitude = (largestValue: number, base: number) =>
  Math.max(Math.floor(Math.log(largestValue) / Math.log(base)), 0)

// These need better names
// What each function will receive
type OxqlMetricChartComponentsProps = { chartData: ChartDatum[] }

// What each function will return
type OxqlMetricChartProps = {
  data: ChartDatum[]
  label: string
  unitForSet: string
  yAxisTickFormatter: (n: number) => string
}

export const getBytesChartProps = ({
  chartData,
}: OxqlMetricChartComponentsProps): OxqlMetricChartProps => {
  // Bytes charts use 1024 as the base
  const base = 1024
  const byteUnits = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB']
  const largestValue = getLargestValue(chartData)
  const orderOfMagnitude = getOrderOfMagnitude(largestValue, base)
  const bytesChartDivisor = base ** orderOfMagnitude
  const data = chartData.map((d) => ({
    ...d,
    value: d.value / bytesChartDivisor,
  }))
  const unitForSet = byteUnits[orderOfMagnitude]
  return {
    data,
    label: `(${unitForSet})`,
    unitForSet,
    yAxisTickFormatter: (n: number) => n.toLocaleString(),
  }
}

export const yAxisLabelForCountChart = (val: number, orderOfMagnitude: number) => {
  const tickValue = val / 1_000 ** orderOfMagnitude
  const formattedTickValue = tickValue.toLocaleString(undefined, {
    maximumSignificantDigits: 3,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
  return `${formattedTickValue}${['', 'k', 'M', 'B', 'T'][orderOfMagnitude]}`
}

/**
 * The primary job of the Count chart components helper is to format the Y-axis ticks,
 * which requires knowing the largest value in the dataset, to get a consistent scale.
 * The data isn't modified for Count charts; the label and unitForSet are basic as well.
 */
export const getCountChartProps = ({
  chartData,
}: OxqlMetricChartComponentsProps): OxqlMetricChartProps => {
  const largestValue = getLargestValue(chartData)
  const orderOfMagnitude = getOrderOfMagnitude(largestValue, 1_000)
  const yAxisTickFormatter = (val: number) => yAxisLabelForCountChart(val, orderOfMagnitude)
  return { data: chartData, label: '(Count)', unitForSet: '', yAxisTickFormatter }
}

export const getPercentDivisor = (startTime: Date, endTime: Date) => {
  const meanWindowSeconds = parseInt(getMeanWindow(startTime, endTime), 10)
  // console.log('meanWindowSeconds', meanWindowSeconds)
  // We actually need to know the number of nanoseconds
  return meanWindowSeconds * 1_000_000_000
}

/**
 * The Percent chart components helper modifies the data, as the values are some percentage
 * of a whole. For now, all Percent charts are based on CPU utilization time. Because queries
 * can be dynamic in terms of the `mean_within` window, we use that value to determine the
 * divisor for the data.
 */
export const getPercentChartProps = ({
  chartData,
  startTime,
  endTime,
}: OxqlMetricChartComponentsProps & {
  startTime: Date
  endTime: Date
}): OxqlMetricChartProps => {
  const data = chartData.map(({ timestamp, value }) => ({
    timestamp,
    value: value / getPercentDivisor(startTime, endTime),
  }))
  return { data, label: '(%)', unitForSet: '%', yAxisTickFormatter: (n: number) => `${n}%` }
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
  const { data: metrics } = useApiQuery(
    'systemTimeseriesQuery',
    { body: { query } },
    // avoid graphs flashing blank while loading when you change the time
    { placeholderData: (x) => x }
  )
  const chartData: ChartDatum[] = useMemo(() => getChartData(metrics), [metrics])
  // console.log(title, query, chartData)
  const unit = getUnit(title)
  const { data, label, unitForSet, yAxisTickFormatter } = useMemo(() => {
    if (unit === 'Bytes') {
      return getBytesChartProps({ chartData })
    }
    if (unit === 'Count') {
      return getCountChartProps({ chartData })
    }
    return getPercentChartProps({ chartData, startTime, endTime })
  }, [unit, chartData, startTime, endTime])

  return (
    <div className="flex w-full grow flex-col rounded-lg border border-default">
      <div className="flex items-center justify-between border-b px-6 py-5 border-secondary">
        <div>
          <h2 className="flex items-baseline gap-1.5">
            <div className="text-sans-semi-lg">{title}</div>
            <div className="text-sans-md text-secondary">{label}</div>
          </h2>
          <div className="mt-0.5 text-sans-md text-secondary">{description}</div>
        </div>
        <CopyCode
          code={query}
          modalButtonText="OxQL"
          copyButtonText="Copy query"
          modalTitle="OxQL query"
        >
          {query.split(' | ').join('\n  | ').split(' && ').join('\n      && ')}
        </CopyCode>
      </div>
      <div className="px-6 py-5">
        <Suspense fallback={<div className="h-[300px]" />}>
          <TimeSeriesChart
            className="mt-3"
            title={title}
            startTime={startTime}
            endTime={endTime}
            unit={unitForSet}
            data={data}
            yAxisTickFormatter={yAxisTickFormatter}
            width={480}
            height={240}
            hasBorder={false}
          />
        </Suspense>
      </div>
    </div>
  )
}

export const MetricHeader = ({ children }: { children: React.ReactNode }) => {
  // If header has only one child, align it to the end of the container
  const justify = React.Children.count(children) === 1 ? 'justify-end' : 'justify-between'
  return (
    <div className={`flex flex-col gap-2 ${justify} mt-8 @[48rem]:flex-row`}>
      {children}
    </div>
  )
}
export const MetricCollection = classed.div`mt-4 flex flex-col gap-4`

export const MetricRow = classed.div`flex w-full flex-col gap-4 @[48rem]:flex-row`
