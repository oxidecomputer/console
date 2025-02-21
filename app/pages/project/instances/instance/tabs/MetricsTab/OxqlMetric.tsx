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

import React, { Fragment, Suspense, useEffect, useMemo, useState } from 'react'

import { useApiQuery, type ChartDatum, type OxqlQueryResult } from '@oxide/api'

import { CopyCodeModal } from '~/components/CopyCode'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { LearnMore } from '~/ui/lib/SettingsGroup'
import { intersperse } from '~/util/array'
import { classed } from '~/util/classed'
import { getDurationMinutes } from '~/util/date'
import { links } from '~/util/links'

import { useMetricsContext } from '../MetricsTab'

// the interval (in seconds) at which oximeter polls for new data; a constant in Propolis
// in time, we'll need to make this dynamic
const VCPU_KSTAT_INTERVAL = 5

type ChartData = {
  chartData: ChartDatum[]
  timeseriesCount: number
}

// Take the OxQL Query Result and return the data in a format that the chart can use
// We'll do this by creating two arrays: one for the timestamps and one for the values
// We'll then combine these into an array of objects, each with a timestamp and a value
export const getChartData = (data: OxqlQueryResult | undefined): ChartData => {
  if (!data) return { chartData: [], timeseriesCount: 0 }

  const timeseriesData = Object.values(data.tables[0].timeseries)
  const timeseriesCount = timeseriesData.length

  if (!timeseriesCount) return { chartData: [], timeseriesCount: 0 }

  // Extract timestamps (all series should have the same timestamps)
  const timestamps = timeseriesData[0].points.timestamps.map((t) => new Date(t).getTime())

  // Initialize an array to accumulate values; defaults to 0
  const valuesSum = new Float64Array(timestamps.length)

  // Sum up the values across all time series
  for (const ts of timeseriesData) {
    const values = ts.points.values[0]?.values?.values || []
    values.forEach((v, idx) => (valuesSum[idx] += Number(v) || 0))
  }

  const chartData = timestamps
    .map((timestamp, idx) => ({
      timestamp,
      value: valuesSum[idx],
    }))
    .slice(1)

  return { chartData, timeseriesCount }
}

const TimeSeriesChart = React.lazy(() => import('~/components/TimeSeriesChart'))

/** convert to UTC and return the timezone-free format required by OxQL, without milliseconds */
export const oxqlTimestamp = (date: Date) => date.toISOString().replace(/\.\d+Z$/, '.000')

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

/** determine the mean window, in seconds, for the given time range;
 * datapoints = the number of datapoints we want to see in the chart
 *   (default is 60, to show 1 point per minute on a 1-hour chart)
 * We could dynamically adjust this based on the duration of the range,
 * like … for 1 week, show 1 datapoint per hour, for 1 day, show 1 datapoint per minute, etc.
 * */
export const getMeanWithinSeconds = (start: Date, end: Date, datapoints = 60) => {
  const durationMinutes = getDurationMinutes({ start, end })
  // the 60 here is just the number of seconds in a minute; unrelated to the default 60 datapoints above
  const durationSeconds = durationMinutes * 60
  return Math.round(durationSeconds / datapoints)
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

type GroupByCol = 'instance_id' | 'attached_instance_id' | 'vcpu_id'

type GroupBy = {
  cols: NonEmptyArray<GroupByCol>
  op: 'sum' | 'mean'
}

const getTimePropsForOxqlQuery = (startTime: Date, endTime: Date, datapoints = 60) => {
  const meanWithinSeconds = getMeanWithinSeconds(startTime, endTime, datapoints)
  // we adjust the start time back by 2x the mean window so that we can
  // 1) drop the first datapoint (the cumulative sum of all previous datapoints)
  // 2) ensure that the first datapoint we display on the chart matches the actual start time
  const secondsToAdjust = meanWithinSeconds * 2
  const adjustedStart = new Date(startTime.getTime() - secondsToAdjust * 1000)
  return { meanWithinSeconds, adjustedStart }
}

export type OxqlQuery = {
  metricName: OxqlMetricName
  startTime: Date
  endTime: Date
  groupBy?: GroupBy
  eqFilters?: Partial<Record<FilterKey, string>>
}

export const toOxqlStr = ({
  metricName,
  startTime,
  endTime,
  groupBy,
  eqFilters = {},
}: OxqlQuery) => {
  const { meanWithinSeconds, adjustedStart } = getTimePropsForOxqlQuery(startTime, endTime)
  const filters = [
    `timestamp >= @${oxqlTimestamp(adjustedStart)}`,
    `timestamp < @${oxqlTimestamp(endTime)}`,
    ...Object.entries(eqFilters)
      // filter out key present but with falsy value. note that this will also
      // filter out empty string, meaning we can't filter by value = ""
      .filter(([_, v]) => !!v)
      .map(([k, v]) => `${k} == "${v}"`),
  ]

  const query = [
    `get ${metricName}`,
    `filter ${filters.join(' && ')}`,
    `align mean_within(${meanWithinSeconds}s)`,
  ]

  if (groupBy) query.push(`group_by [${groupBy.cols.join(', ')}], ${groupBy.op}`)
  return query.join(' | ')
}

const Keyword = classed.span`text-[#C6A5EA]` // purple
const NewlinePipe = () => <span className="text-[#A7E0C8]">{'\n  | '}</span> // light green
const StringLit = classed.span`text-[#68D9A7]` // green
const NumLit = classed.span`text-[#EDD5A6]` // light yellow

const FilterSep = () => '\n      && '

export function HighlightedOxqlQuery({
  metricName,
  startTime,
  endTime,
  groupBy,
  eqFilters = {},
}: OxqlQuery) {
  const { meanWithinSeconds, adjustedStart } = getTimePropsForOxqlQuery(startTime, endTime)
  const filters = [
    <Fragment key="start">
      timestamp &gt;= <NumLit>@{oxqlTimestamp(adjustedStart)}</NumLit>
    </Fragment>,
    <Fragment key="end">
      timestamp &lt; <NumLit>@{oxqlTimestamp(endTime)}</NumLit>
    </Fragment>,
    ...Object.entries(eqFilters)
      .filter(([_, v]) => !!v)
      .map(([k, v]) => (
        <Fragment key={`${k}-${v}`}>
          {k} == <StringLit>&quot;{v}&quot;</StringLit>
        </Fragment>
      )),
  ]

  return (
    <>
      <Keyword>get</Keyword> {metricName}
      <NewlinePipe />
      <Keyword>filter</Keyword> {intersperse(filters, <FilterSep />)}
      <NewlinePipe />
      <Keyword>align</Keyword> mean_within(<NumLit>{meanWithinSeconds}s</NumLit>)
      {groupBy && (
        <>
          <NewlinePipe />
          <Keyword>group_by</Keyword> [{groupBy.cols.join(', ')}], {groupBy.op}
        </>
      )}
    </>
  )
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

// What each function will return
type OxqlMetricChartProps = {
  data: ChartDatum[]
  label: string
  unitForSet: string
  yAxisTickFormatter: (n: number) => string
}

const getBytesChartProps = (chartData: ChartDatum[]): OxqlMetricChartProps => {
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
export const getCountChartProps = (chartData: ChartDatum[]): OxqlMetricChartProps => {
  const largestValue = getLargestValue(chartData)
  const orderOfMagnitude = getOrderOfMagnitude(largestValue, 1_000)
  const yAxisTickFormatter = (val: number) => yAxisLabelForCountChart(val, orderOfMagnitude)
  return { data: chartData, label: '(Count)', unitForSet: '', yAxisTickFormatter }
}

// To properly calculate the utilization percentage, we need to know the number of CPUs.
// We get that from the timeseriesCount value.
export const getUtilizationChartProps = (
  chartData: ChartDatum[],
  nCPUs: number
): OxqlMetricChartProps => {
  // The divisor is the VCPU_KSTAT_INTERVAL (5 seconds) * 1,000,000,000 (nanoseconds) * nCPUs
  const divisor = VCPU_KSTAT_INTERVAL * 1000 * 1000 * 1000 * nCPUs
  const data =
    // dividing by 0 would blow it up, so on the off chance that timeSeriesCount is 0, return an empty array
    divisor > 0
      ? chartData.map(({ timestamp, value }) => ({
          timestamp,
          value: (value * 100) / divisor,
        }))
      : []
  return { data, label: '(%)', unitForSet: '%', yAxisTickFormatter: (n: number) => `${n}%` }
}

type OxqlMetricProps = OxqlQuery & {
  title: string
  description?: string
}

export function OxqlMetric({ title, description, ...queryObj }: OxqlMetricProps) {
  const query = toOxqlStr(queryObj)
  const { data: metrics } = useApiQuery(
    'systemTimeseriesQuery',
    { body: { query } },
    // avoid graphs flashing blank while loading when you change the time
    { placeholderData: (x) => x }
  )
  // only start reloading data once an intial dataset has been loaded
  const { setIsIntervalPickerEnabled } = useMetricsContext()
  useEffect(() => {
    if (metrics) {
      // this is too slow right now; disabling until we can make it faster
      // setIsIntervalPickerEnabled(true)
    }
  }, [metrics, setIsIntervalPickerEnabled])

  const { startTime, endTime } = queryObj
  const { chartData, timeseriesCount } = useMemo(() => getChartData(metrics), [metrics])
  const unit = getUnit(title)
  const { data, label, unitForSet, yAxisTickFormatter } = useMemo(() => {
    if (unit === 'Bytes') return getBytesChartProps(chartData)
    if (unit === 'Count') return getCountChartProps(chartData)
    return getUtilizationChartProps(chartData, timeseriesCount)
  }, [unit, chartData, timeseriesCount])

  const [modalOpen, setModalOpen] = useState(false)

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
        <MoreActionsMenu
          label="Instance actions"
          actions={[
            {
              label: 'About this metric',
              onActivate: () => {
                // Turn into a real link when this is fixed
                // https://github.com/oxidecomputer/console/issues/1855
                const url = links.oxqlSchemaDocs(queryObj.metricName)
                window.open(url, '_blank', 'noopener,noreferrer')
              },
            },
            {
              label: 'View OxQL query',
              onActivate: () => setModalOpen(true),
            },
          ]}
          isSmall
        />
        <CopyCodeModal
          isOpen={modalOpen}
          onDismiss={() => setModalOpen(false)}
          code={query}
          copyButtonText="Copy query"
          modalTitle="OxQL query"
          footer={<LearnMore href={links.oxqlDocs} text="OxQL" />}
        >
          <HighlightedOxqlQuery {...queryObj} />
        </CopyCodeModal>
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
