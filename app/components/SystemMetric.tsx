/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import React, { Suspense, useMemo, useRef } from 'react'

import type { ChartDatum, SystemMetricName } from '@oxide/api'
import { synthesizeData, useApiQuery } from '@oxide/api'
import { Badge, DirectionDownIcon, DirectionUpIcon, Spinner } from '@oxide/ui'
import { splitDecimal } from '@oxide/util'

const TimeSeriesChart = React.lazy(() => import('./TimeSeriesChart'))

// The difference between system metric and silo metric is
//   1. different endpoints
//   2. silo metric doesn't have capacity

type MetricProps = {
  title: string
  unit?: string
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
    { keepPreviousData: true }
  )

  // get last point before startTime to use as first point in graph
  const beforeStart = useApiQuery(
    'siloMetric',
    {
      path: { metricName },
      query: { project, endTime: startTime, ...staticParams },
    },
    { keepPreviousData: true }
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
    <div>
      <h2 className="flex items-center gap-1.5 px-3 text-mono-sm text-secondary">
        {title} {unit && <span className="text-quaternary">({unit})</span>}{' '}
        {(inRange.isLoading || beforeStart.isLoading) && <Spinner />}
      </h2>
      {/* TODO: proper skeleton for empty chart */}
      <Suspense fallback={<div />}>
        <div className="mt-3 h-[300px]">
          <TimeSeriesChart
            data={data}
            title={title}
            width={480}
            height={240}
            interpolation="stepAfter"
            startTime={startTime}
            endTime={endTime}
            unit={unit !== 'count' ? unit : undefined}
          />
        </div>
      </Suspense>
    </div>
  )
}

type SystemMetricProps = MetricProps & {
  /** undefined means show entire fleet */
  silo: string | undefined
  capacity: number
}

export function SystemMetric({
  title,
  unit,
  startTime,
  endTime,
  metricName,
  silo,
  valueTransform = (x) => x,
  capacity,
}: SystemMetricProps) {
  // TODO: we're only pulling the first page. Should we bump the cap to 10k?
  // Fetch multiple pages if 10k is not enough? That's a bit much.
  const inRange = useApiQuery(
    'systemMetric',
    {
      path: { metricName },
      query: { silo, startTime, endTime, limit: 3000 },
    },
    { keepPreviousData: true }
  )

  // get last point before startTime to use as first point in graph
  const beforeStart = useApiQuery(
    'systemMetric',
    {
      path: { metricName },
      query: { silo, endTime: startTime, ...staticParams },
    },
    { keepPreviousData: true }
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

  const firstPoint = data?.[0]
  const lastPoint = data?.[data.length - 1]

  // TODO: indicate time zone somewhere. doesn't have to be in the detail view
  // in the tooltip. could be just once on the end of the x-axis like GCP

  return (
    <div>
      <h2 className="flex items-center gap-1.5 px-3 text-mono-sm text-secondary">
        {title} {unit && <span className="text-quaternary">({unit})</span>}{' '}
        {(inRange.isLoading || beforeStart.isLoading) && <Spinner />}
      </h2>
      {/* TODO: proper skeleton for empty chart */}
      <Suspense fallback={<div />}>
        <div className="mt-3 h-[300px]">
          <TimeSeriesChart
            data={data}
            title={title}
            width={480}
            height={240}
            interpolation="stepAfter"
            startTime={startTime}
            endTime={endTime}
            maxValue={capacity}
            unit={unit !== 'count' ? unit : undefined}
          />
        </div>
        {firstPoint && lastPoint && (
          <div className="mt-3 flex min-w-min flex-col gap-3 lg+:flex-row">
            <MetricStatistic
              label="In-use"
              value={(lastPoint.value / capacity) * 100}
              unit="percentage"
              delta={((lastPoint.value - firstPoint.value) / capacity) * 100}
            />
            <MetricStatistic
              label="In-use"
              value={lastPoint.value}
              unit={unit}
              total={capacity}
            />
          </div>
        )}
      </Suspense>
    </div>
  )
}

const MetricStatistic = ({
  label,
  value,
  unit = '',
  delta,
  total,
}: {
  label: string
  value: number
  unit?: 'percentage' | string
  delta?: number
  total?: number
}) => {
  const isPercentage = unit === 'percentage'

  const [wholeNumber, decimal] = splitDecimal(value)

  // We're using the fixed delta when we check if a delta is
  // positive or negative, otherwise we'll see the colour and direction
  // arrow change whilst the number stays at 0.00%
  const fDelta = delta && parseFloat(delta.toFixed(2))

  return (
    <div className="flex h-10 w-full min-w-min flex-shrink-0 items-center rounded-lg border border-default lg+:flex-1">
      <div className="flex h-full items-center border-r px-3 text-mono-sm text-quaternary border-r-secondary">
        {label}
      </div>
      <div className="flex flex-grow items-center justify-between px-3">
        <div className="[font-size:18px]">
          <span className="font-light">{wholeNumber}</span>
          {decimal && (
            <span className="ml-0.5 text-quaternary [font-size:14px]">{decimal}</span>
          )}
          {unit !== 'count' && (
            <span className="ml-1 inline-block text-quaternary [font-size:14px]">
              {isPercentage ? '%' : unit}
            </span>
          )}
        </div>
        {fDelta !== undefined && (
          <Badge
            className="my-2 h-5 children:flex children:items-center"
            color={fDelta > 0 ? 'default' : 'purple'}
          >
            <div className="mr-1 inline-flex">
              {fDelta >= 0 ? <DirectionUpIcon /> : <DirectionDownIcon />}
            </div>
            {fDelta}%
          </Badge>
        )}
        {total && (
          <div className="text-mono-sm text-secondary">
            <span className="mx-1 inline-block text-quinary">/</span>
            {total.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}
