import React, { Suspense, useMemo } from 'react'

import type { SystemMetricName } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Badge, DirectionDownIcon, DirectionUpIcon, Spinner } from '@oxide/ui'

const TimeSeriesChart = React.lazy(() => import('./TimeSeriesChart'))

type SystemMetricProps = {
  title: string
  unit?: string
  startTime: Date
  endTime: Date
  metricName: SystemMetricName
  /** Resource to filter data by. Can be fleet, silo, project. */
  filterId: string
  valueTransform?: (n: number) => number
  capacity: number
}

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
  const { data: metrics, isLoading } = useApiQuery(
    'systemMetric',
    { path: { metricName }, query: { id: filterId, startTime, endTime } },
    {
      // TODO: this is actually kind of useless unless the time interval slides forward as time passes
      refetchInterval: 5000,
      // avoid graphs flashing blank while loading when you change the time
      keepPreviousData: true,
    }
  )

  const data = (metrics?.items || []).map(({ datum, timestamp }) => ({
    timestamp: timestamp.getTime(),
    // all of these metrics are cumulative ints
    value: valueTransform(datum.datum as number),
  }))

  // add fake points for the beginning and end of the time range (lol)
  if (data.length > 0) {
    const firstPoint = data[0]
    const lastPoint = data[data.length - 1]

    if (startTime.getTime() < firstPoint.timestamp) {
      data.unshift({ timestamp: startTime.getTime(), value: firstPoint.value })
    }

    if (endTime.getTime() > lastPoint.timestamp) {
      data.push({ timestamp: endTime.getTime(), value: lastPoint.value })
    }
  }

  // const capacity =

  // Calculate the difference between the start
  // and end values
  const statistic = useMemo(() => {
    const startItem = data[0]
    const endItem = data[data.length - 1]

    if (!data || !startItem || !endItem) {
      return null
    }

    const max = data.reduce((prev, current) =>
      prev.value > current.value ? prev : current
    )

    return {
      startVal: startItem.value,
      endVal: endItem.value,
      delta: endItem.value - startItem.value,
      maxVal: max.value,
    }
  }, [data])

  // TODO: indicate time zone somewhere. doesn't have to be in the detail view
  // in the tooltip. could be just once on the end of the x-axis like GCP

  return (
    <div>
      <h2 className="flex items-center gap-1.5 px-3 text-mono-sm text-secondary">
        {title} {unit && <span className="text-quaternary">({unit})</span>}{' '}
        {isLoading && <Spinner />}
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
          />
        </div>
        {statistic && (
          <div className="mt-3 flex min-w-min gap-3">
            <MetricStatistic
              label="In-use"
              value={(statistic.endVal / capacity) * 100}
              unit="percentage"
              delta={(statistic.delta / capacity) * 100}
            />
            <MetricStatistic
              label="In-use"
              value={statistic.endVal}
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

  const [wholeNumber, decimal] = useMemo(() => {
    const wholeNumber = Math.floor(value)
    const decimal = value % 1 !== 0 ? value % 1 : null
    return [wholeNumber, decimal ? '.' + decimal.toFixed(2).toString().split('.')[1] : '']
  }, [value])

  return (
    <div className="flex h-10 w-full min-w-min flex-1 flex-shrink-0 items-center rounded-lg border border-default">
      <div className="flex h-full items-center border-r px-3 text-mono-sm text-quaternary border-r-secondary">
        {label}
      </div>
      <div className="flex flex-grow items-center justify-between px-3">
        <div className="font-light [font-size:18px]">
          <span>{wholeNumber.toLocaleString()}</span>
          {decimal && (
            <span className="ml-0.5 text-quaternary [font-size:14px]">{decimal}</span>
          )}
          {unit !== 'count' && (
            <span className="ml-1 inline-block text-quaternary [font-size:14px]">
              {isPercentage ? '%' : unit}
            </span>
          )}
        </div>
        {delta !== undefined && (
          <Badge
            className="my-2 children:flex children:items-center"
            color={delta > 0 ? 'default' : 'purple'}
          >
            <div className="mr-1 inline-flex">
              {delta >= 0 ? <DirectionUpIcon /> : <DirectionDownIcon />}
            </div>
            {delta.toFixed(2)}%
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
