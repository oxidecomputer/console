/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo, useRef } from 'react'

import {
  synthesizeData,
  useApiQuery,
  type ChartDatum,
  type SystemMetricName,
} from '@oxide/api'

import { ChartContainer, ChartHeader, TimeSeriesChart } from './TimeSeriesChart'

// The difference between system metric and silo metric is
//   1. different endpoints
//   2. silo metric doesn't have capacity

type MetricProps = {
  title: string
  unit: string
  startTime: Date
  endTime: Date
  metricName: SystemMetricName
  /** Should be statically defined or memoized to avoid extra renders */
  valueTransform?: (n: number) => number
}

type SiloMetricProps = MetricProps & {
  /** undefined means show entire silo */
  project: string | undefined
}

/** params for the before query */
const staticParams = {
  startTime: new Date(0),
  limit: 1,
  order: 'descending' as const,
}

export function SiloMetric({
  title,
  unit,
  startTime,
  endTime,
  metricName,
  project,
  valueTransform = (x) => x,
}: SiloMetricProps) {
  // TODO: we're only pulling the first page. Should we bump the cap to 10k?
  // Fetch multiple pages if 10k is not enough? That's a bit much.
  const inRange = useApiQuery(
    'siloMetric',
    {
      path: { metricName },
      query: { project, startTime, endTime, limit: 3000 },
    },
    { placeholderData: (x) => x }
  )

  // get last point before startTime to use as first point in graph
  const beforeStart = useApiQuery(
    'siloMetric',
    {
      path: { metricName },
      query: { project, endTime: startTime, ...staticParams },
    },
    { placeholderData: (x) => x }
  )

  const ref = useRef<ChartDatum[] | undefined>(undefined)
  const isFetching = inRange.isFetching || beforeStart.isFetching
  const data = useMemo(() => {
    // big old hack to avoid the graph flashing with weird data while either query is loading
    if (isFetching) return ref.current
    ref.current = synthesizeData(
      inRange.data?.items,
      beforeStart.data?.items,
      startTime,
      endTime,
      valueTransform
    )
    return ref.current
  }, [inRange.data, beforeStart.data, startTime, endTime, valueTransform, isFetching])

  // TODO: indicate time zone somewhere. doesn't have to be in the detail view
  // in the tooltip. could be just once on the end of the x-axis like GCP

  return (
    <ChartContainer>
      <ChartHeader title={title} label={`(${unit})`} />
      <TimeSeriesChart
        data={data}
        title={title}
        interpolation="stepAfter"
        startTime={startTime}
        endTime={endTime}
        unit={unit !== 'Count' ? unit : undefined}
        // note use of loading, not fetching, which is only true on first fetch.
        // otherwise we get loading states on refetches
        loading={inRange.isLoading || beforeStart.isLoading}
      />
    </ChartContainer>
  )
}

type SystemMetricProps = MetricProps & {
  /** undefined means show entire fleet */
  silo: string | undefined
}

export function SystemMetric({
  title,
  unit,
  startTime,
  endTime,
  metricName,
  silo,
  valueTransform = (x) => x,
}: SystemMetricProps) {
  // TODO: we're only pulling the first page. Should we bump the cap to 10k?
  // Fetch multiple pages if 10k is not enough? That's a bit much.
  const inRange = useApiQuery(
    'systemMetric',
    {
      path: { metricName },
      query: { silo, startTime, endTime, limit: 3000 },
    },
    { placeholderData: (x) => x }
  )

  // get last point before startTime to use as first point in graph
  const beforeStart = useApiQuery(
    'systemMetric',
    {
      path: { metricName },
      query: { silo, endTime: startTime, ...staticParams },
    },
    { placeholderData: (x) => x }
  )

  const ref = useRef<ChartDatum[] | undefined>(undefined)
  const isFetching = inRange.isFetching || beforeStart.isFetching
  const data = useMemo(() => {
    // big old hack to avoid the graph flashing with weird data while either query is loading
    if (isFetching) return ref.current
    ref.current = synthesizeData(
      inRange.data?.items,
      beforeStart.data?.items,
      startTime,
      endTime,
      valueTransform
    )
    return ref.current
  }, [inRange.data, beforeStart.data, startTime, endTime, valueTransform, isFetching])

  // TODO: indicate time zone somewhere. doesn't have to be in the detail view
  // in the tooltip. could be just once on the end of the x-axis like GCP

  return (
    <ChartContainer>
      <ChartHeader title={title} label={`(${unit})`} />
      <TimeSeriesChart
        data={data}
        title={title}
        interpolation="stepAfter"
        startTime={startTime}
        endTime={endTime}
        unit={unit !== 'Count' ? unit : undefined}
        // note use of loading, not fetching, which is only true on first fetch.
        // otherwise we get loading states on refetches
        loading={inRange.isLoading || beforeStart.isLoading}
      />
    </ChartContainer>
  )
}
