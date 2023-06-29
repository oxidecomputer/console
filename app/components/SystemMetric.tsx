import React, { Suspense, useMemo, useRef } from 'react'

import type { Measurement, SystemMetricName } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Badge, DirectionDownIcon, DirectionUpIcon, Spinner } from '@oxide/ui'
import { splitDecimal } from '@oxide/util'

import type { Datum } from './TimeSeriesChart'

const TimeSeriesChart = React.lazy(() => import('./TimeSeriesChart'))

/** fill in data points at start and end of range */
export function synthesizeData(
  dataInRange: Measurement[] | undefined,
  dataBeforeRange: Measurement[] | undefined,
  startTime: Date,
  endTime: Date,
  valueTransform: (n: number) => number
): Datum[] | undefined {
  // wait until both requests come back to do anything
  if (!dataInRange || !dataBeforeRange) return undefined

  const result = dataInRange.map(({ datum, timestamp }) => ({
    timestamp: timestamp.getTime(),
    // all of these metrics are cumulative ints
    value: valueTransform(datum.datum as number),
  }))

  // second condition should virtually always be true
  if (dataInRange.length === 0 || result[0].timestamp > startTime.getTime()) {
    const value =
      dataBeforeRange.length > 0
        ? valueTransform(dataBeforeRange.at(-1)!.datum.datum as number)
        : 0 // if there's no data before the time range, assume value is zero
    result.unshift({ timestamp: startTime.getTime(), value })
  }

  // add point for the end of the time range equal to the last value in the
  // range. no timestamp check necessary because endTime is exclusive
  result.push({
    timestamp: endTime.getTime(),
    value: result.at(-1)!.value,
  })

  return result
}

type SystemMetricProps = {
  title: string
  unit?: string
  startTime: Date
  endTime: Date
  metricName: SystemMetricName
  /** Resource to filter data by. Can be fleet, silo, project. */
  filterId: string
  /** Should be statically defined or memoized to avoid extra renders */
  valueTransform?: (n: number) => number
  /** hard-coded max y */
  capacity: number | undefined
  refetchInterval?: number | false
}

// TODO: pass in data so we can use different endpoints for system and silo metrics

export function SystemMetric({
  title,
  unit,
  startTime,
  endTime,
  metricName,
  filterId,
  valueTransform = (x) => x,
  capacity,
}: SystemMetricProps) {
  // TODO: we're only pulling the first page. Should we bump the cap to 10k?
  // Fetch multiple pages if 10k is not enough? That's a bit much.
  const inRange = useApiQuery(
    'systemMetric',
    { path: { metricName }, query: { silo: filterId, startTime, endTime } },
    // avoid graphs flashing blank while loading when you change the time
    { keepPreviousData: true }
  )

  // get last point before startTime to use as first point in graph
  const beforeStart = useApiQuery(
    'systemMetric',
    {
      path: { metricName },
      query: {
        silo: filterId,
        endTime: startTime,
        startTime: new Date(0),
        limit: 1,
        order: 'descending',
      },
    },
    // avoid graphs flashing blank while loading when you change the time
    { keepPreviousData: true }
  )

  const ref = useRef<Datum[] | undefined>(undefined)
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
        {firstPoint && lastPoint && capacity !== undefined && (
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
