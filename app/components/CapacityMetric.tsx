import { useMemo } from 'react'

import type { SystemMetricName } from '@oxide/api'
import { FLEET_ID, useApiQuery } from '@oxide/api'
import { splitDecimal } from '@oxide/util'

import RoundedSector from 'app/components/RoundedSector'

export const CapacityMetric = ({
  icon,
  title,
  // unit,
  metricName,
  valueTransform = (x) => x,
  capacity,
}: {
  icon: JSX.Element
  title: string
  // unit: string
  metricName: SystemMetricName
  valueTransform?: (n: number) => number
  capacity: number
}) => {
  const mountTime = useMemo(() => new Date(), [])

  // this is going to return at most one data point
  const { data } = useApiQuery(
    'systemMetric',
    {
      path: { metricName },
      query: {
        startTime: new Date(0), // beginning of time, aka 1970
        endTime: mountTime,
        id: FLEET_ID,
        limit: 1,
        order: 'descending',
      },
    },
    {
      refetchInterval: 5000,
      keepPreviousData: true,
    }
  )

  const metrics = useMemo(() => data?.items || [], [data])
  const datum = metrics && metrics.length > 0 ? metrics[metrics.length - 1].datum.datum : 0
  // it's always a number but let's rule out the other options without doing a cast
  const utilization = valueTransform(typeof datum === 'number' ? datum : 0)
  const utilizationPct = (utilization * 100) / capacity
  const [wholeNumber, decimal] = splitDecimal(utilizationPct)

  return (
    <div className="flex w-full min-w-min flex-1 flex-shrink-0 items-center rounded-lg border border-default">
      <div className="flex h-full flex-grow flex-col justify-between border-r border-r-secondary">
        <div className="p-3 text-mono-sm text-secondary">
          {title}
          {/* <span className="ml-1 !normal-case text-mono-sm text-quaternary">({unit})</span> */}
        </div>

        <div className="flex items-center gap-2 pl-3 pb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg text-accent bg-accent-secondary-hover">
            {icon}
          </div>

          <div className="[font-size:36px] [line-height:1]">
            <span className="font-light">{wholeNumber.toLocaleString()}</span>
            <span className="ml-0.5 text-quaternary [font-size:18px]">
              {decimal || ''}%
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-center p-4">
          <RoundedSector
            angle={(utilizationPct / 100) * 365}
            size={64}
            thickness={6}
            cornerRadius={2}
          />
        </div>
      </div>
    </div>
  )
}
