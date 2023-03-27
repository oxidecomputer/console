import React, { Suspense } from 'react'

import type { SystemMetricName } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Spinner } from '@oxide/ui'

const TimeSeriesChart = React.lazy(() => import('./TimeSeriesChart'))

type SystemMetricProps = {
  title: string
  startTime: Date
  endTime: Date
  metricName: SystemMetricName
  /** Resource to filter data by. Can be fleet, silo, project. */
  filterId: string
  valueTransform?: (n: number) => number
}

export function SystemMetric({
  title,
  startTime,
  endTime,
  metricName,
  filterId,
  valueTransform = (x) => x,
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

  // TODO: indicate time zone somewhere. doesn't have to be in the detail view
  // in the tooltip. could be just once on the end of the x-axis like GCP

  return (
    <div>
      <h2 className="flex items-center text-mono-md text-secondary">
        {title} {isLoading && <Spinner className="ml-2" />}
      </h2>
      {/* TODO: proper skeleton for empty chart */}
      <Suspense fallback={<div className="mt-4 h-[300px]" />}>
        <TimeSeriesChart
          className="mt-4"
          data={data}
          title={title}
          width={480}
          height={240}
          interpolation="stepAfter"
          startTime={startTime}
          endTime={endTime}
        />
      </Suspense>
    </div>
  )
}
