/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { differenceInSeconds } from 'date-fns'
import * as R from 'remeda'

import type { ChartDatum, OxqlQueryResult, Timeseries } from '~/api'

/*
 * OxQL Metrics Schema:
 * https://github.com/oxidecomputer/omicron/tree/main/oximeter/oximeter/schema
 */

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

export type OxqlQuery = {
  metricName: OxqlMetricName
  startTime: Date
  endTime: Date
  groupBy?: GroupBy
  eqFilters?: Partial<Record<FilterKey, string>>
}

// the interval (in seconds) at which oximeter polls for new data; a constant in Propolis
// in time, we'll need to make this dynamic
// https://github.com/oxidecomputer/propolis/blob/42b87359/bin/propolis-server/src/lib/stats/mod.rs#L54-L57
export const VCPU_KSTAT_INTERVAL_SEC = 5

// Returns 0 if there are no data points
export const getLargestValue = (data: ChartDatum[]) =>
  data.length ? Math.max(0, ...data.map((d) => d.value).filter((x) => x !== null)) : 0

export const getMaxExponent = (largestValue: number, base: number) =>
  Math.max(Math.floor(Math.log(largestValue) / Math.log(base)), 0)

/** convert to UTC and return the timezone-free format required by OxQL, without milliseconds */
export const oxqlTimestamp = (date: Date) => date.toISOString().replace(/\.\d+Z$/, '.000')

/** determine the mean window, in seconds, for the given time range;
 * datapoints = the number of datapoints we want to see in the chart
 *   (default is 60, to show 1 point per minute on a 1-hour chart)
 * */
export const getMeanWithinSeconds = (start: Date, end: Date, datapoints = 60) => {
  const duration = differenceInSeconds(end, start)
  // 5 second minimum, to handle oximeter logging interval for CPU data
  return Math.max(VCPU_KSTAT_INTERVAL_SEC, Math.round(duration / datapoints))
}

export const getTimePropsForOxqlQuery = (
  startTime: Date,
  endTime: Date,
  datapoints = 60
) => {
  const meanWithinSeconds = getMeanWithinSeconds(startTime, endTime, datapoints)
  // we adjust the start time back by 2x the mean window so that we can
  // 1) drop the first datapoint (the cumulative sum of all previous datapoints)
  // 2) ensure that the first datapoint we display on the chart matches the actual start time
  const secondsToAdjust = meanWithinSeconds * 2
  const adjustedStart = new Date(startTime.getTime() - secondsToAdjust * 1000)
  return { meanWithinSeconds, adjustedStart }
}

export const sumValues = (timeseries: Timeseries[], arrLen: number): (number | null)[] =>
  Array.from({ length: arrLen }).map((_, i) =>
    R.pipe(
      timeseries,
      // get point at that index for each timeseries
      R.map((ts) => ts.points.values.at(0)?.values.values?.[i]),
      // filter out nulls (undefined shouldn't happen)
      R.filter((p) => typeof p === 'number'),
      // null if no timeseries has a data point at that idx, so empty parts of
      // the chart stay empty
      (points) => (points.length > 0 ? R.sum(points) : null)
    )
  )

export const countValues = (timeseries: Timeseries[], arrLen: number): number[] =>
  Array.from({ length: arrLen }).map((_, i) =>
    R.pipe(
      timeseries,
      // get point at that index for each timeseries
      R.map((ts) => ts.points.values.at(0)?.values.values?.[i]),
      // filter out nulls (undefined shouldn't happen)
      R.filter((p) => typeof p === 'number'),
      // count non-null elements per series
      (points) => points.length
    )
  )

// Take the OxQL Query Result and return the data in a format that the chart can use
// We'll do this by creating two arrays: one for the timestamps and one for the values
// We'll then combine these into an array of objects, each with a timestamp and a value
// Note that this data will need to be processed further, based on the kind of chart we're creating
export const composeOxqlData = (data: OxqlQueryResult | undefined) => {
  let timeseriesCount = 0
  if (!data) return { chartData: [], valueCounts: [] }
  const timeseriesData = data.tables[0].timeseries
  timeseriesCount = timeseriesData.length
  if (!timeseriesCount) return { chartData: [], valueCounts: [] }
  // Extract timestamps. Series may have different timestamps, e.g. when new
  // resources are created within the query interval
  const timestamps = R.pipe(
    timeseriesData,
    R.map((series) => series.points.timestamps.map((t) => new Date(t).getTime())),
    R.flat(),
    R.unique(),
    R.sort((a, b) => a - b)
  )
  const summedValues = sumValues(timeseriesData, timestamps.length)
  const valueCounts = countValues(timeseriesData, timestamps.length)
  const chartData = timestamps
    .map((timestamp, idx) => ({ timestamp, value: summedValues[idx] }))
    // Drop the first datapoint, which — for delta metric types — is the cumulative sum of all previous
    // datapoints (like CPU utilization). We've accounted for this by adjusting the start time earlier;
    // We could use a more elegant approach to this down the road
    .slice(1)

  return { chartData, valueCounts }
}

// What each function will return
type OxqlMetricChartProps = {
  data: ChartDatum[]
  label: string
  unitForSet: string
  yAxisTickFormatter: (n: number) => string
}

// OxQL Metric Charts are currently one of three kinds: Bytes, Count, or Utilization
// Each of these will require different processing to get the data into the right format
// The helper functions below will take the data from the OxQL Query Result and return
// the data in the appropriate format for the chart

export const getBytesChartProps = (chartData: ChartDatum[]): OxqlMetricChartProps => {
  // Bytes charts use 1024 as the base
  const base = 1024
  const byteUnits = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB']
  const largestValue = getLargestValue(chartData)
  const maxExponent = getMaxExponent(largestValue, base)
  const bytesChartDivisor = base ** maxExponent
  const data = chartData.map((d) => ({
    ...d,
    value: d.value !== null ? d.value / bytesChartDivisor : null,
  }))
  const unitForSet = byteUnits[maxExponent]
  return {
    data,
    label: `(${unitForSet})`,
    unitForSet,
    yAxisTickFormatter: (n: number) => n.toLocaleString(),
  }
}

export const yAxisLabelForCountChart = (val: number, maxExponent: number) => {
  const tickValue = val / 1_000 ** maxExponent
  const formattedTickValue = tickValue.toLocaleString(undefined, {
    maximumSignificantDigits: 3,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
  return `${formattedTickValue}${['', 'k', 'M', 'B', 'T'][maxExponent]}`
}

/**
 * The primary job of the Count chart components helper is to format the Y-axis ticks,
 * which requires knowing the largest value in the dataset, to get a consistent scale.
 * The data isn't modified for Count charts; the label and unitForSet are basic as well.
 */
export const getCountChartProps = (chartData: ChartDatum[]): OxqlMetricChartProps => {
  const largestValue = getLargestValue(chartData)
  const maxExponent = getMaxExponent(largestValue, 1_000)
  const yAxisTickFormatter = (val: number) => yAxisLabelForCountChart(val, maxExponent)
  return { data: chartData, label: '(Count)', unitForSet: '', yAxisTickFormatter }
}

export const getUtilizationChartProps = (
  chartData: ChartDatum[],
  valueCounts: number[]
): OxqlMetricChartProps => {
  // The divisor is the oximeter logging interval for CPU data (5 seconds) * 1,000,000,000 (nanoseconds)
  const baseDivisor = VCPU_KSTAT_INTERVAL_SEC * 1000 * 1000 * 1000
  const hasData = R.sum(valueCounts) > 0
  const data =
    // dividing by 0 would blow it up, so on the off chance that all series are empty, data should be an empty array
    hasData
      ? chartData.map(({ timestamp, value }, idx) => ({
          timestamp,
          value: value !== null ? (value * 100) / baseDivisor / valueCounts[idx] : null,
        }))
      : []
  return { data, label: '(%)', unitForSet: '%', yAxisTickFormatter: (n: number) => `${n}%` }
}
