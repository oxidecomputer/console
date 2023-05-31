import { subMonths } from 'date-fns'
import { useMemo } from 'react'

import type { SystemMetricName } from '@oxide/api'
import { useApiQuery } from '@oxide/api'

import { splitNumberDecimal } from './SystemMetric'

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
  // Currently there's no way of getting the current utilization, so grab the
  // last month of data and take the most recent entry
  const { startTime, endTime } = useMemo(() => {
    const endTime = new Date()
    return { startTime: subMonths(endTime, 1), endTime }
  }, [])

  // this is going to return at most one data point
  const { data } = useApiQuery(
    'systemMetric',
    { path: { metricName }, query: { startTime, endTime } },
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
  const [wholeNumber, decimal] = splitNumberDecimal(utilizationPct)

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
            {decimal && (
              <span className="ml-0.5 text-quaternary [font-size:18px]">{decimal}%</span>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-center p-4">
          <CapacityPieChart angle={(utilizationPct / 100) * 365} />
        </div>
      </div>
    </div>
  )
}

const CapacityPieChart = ({ angle }: { angle: number }) => {
  const size = 64
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} version="1.1">
      {/*
        Little hack to get round corners on the bar
        Is basically a blur and a threshold
         */}
      <filter id="round">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 19 -9"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
      <path
        d={getSectorPath({
          cx: size / 2,
          cy: size / 2,
          innerRadius: size / 2 - 6,
          outerRadius: size / 2,
          startAngle: 0,
          endAngle: 360,
        })}
        fill="#2D3335"
      />
      {/* Capacity sector */}
      <path
        d={getSectorPath({
          cx: size / 2,
          cy: size / 2,
          innerRadius: size / 2 - 6,
          outerRadius: size / 2,
          startAngle: 90,
          endAngle: 90 - angle,
        })}
        fill="var(--theme-accent-800)"
        filter="url(#round)"
      />
    </svg>
  )
}

export const mathSign = (value: number) => {
  if (value === 0) return 0
  if (value > 0) return 1
  return -1
}

export const RADIAN = Math.PI / 180

export const polarToCartesian = (
  cx: number,
  cy: number,
  radius: number,
  angle: number
) => ({
  x: cx + Math.cos(-RADIAN * angle) * radius,
  y: cy + Math.sin(-RADIAN * angle) * radius,
})

const getDeltaAngle = (startAngle: number, endAngle: number) => {
  const sign = mathSign(endAngle - startAngle)
  const deltaAngle = Math.min(Math.abs(endAngle - startAngle), 359.999)
  return sign * deltaAngle
}

// Borrowed from recharts
// generates a pie chart sector so that we don't need the full
// recharts element here and have more flexibility with the SVG
const getSectorPath = ({
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
}: {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
}) => {
  const angle = getDeltaAngle(startAngle, endAngle)

  // When the angle of sector equals to 360, star point and end point coincide
  const tempEndAngle = startAngle + angle
  const outerStartPoint = polarToCartesian(cx, cy, outerRadius, startAngle)
  const outerEndPoint = polarToCartesian(cx, cy, outerRadius, tempEndAngle)

  let path = `M ${outerStartPoint.x},${outerStartPoint.y}
    A ${outerRadius},${outerRadius},0,
    ${+(Math.abs(angle) > 180)},${+(startAngle > tempEndAngle)},
    ${outerEndPoint.x},${outerEndPoint.y}
  `
  const innerStartPoint = polarToCartesian(cx, cy, innerRadius, startAngle)
  const innerEndPoint = polarToCartesian(cx, cy, innerRadius, tempEndAngle)
  path += `L ${innerEndPoint.x},${innerEndPoint.y}
          A ${innerRadius},${innerRadius},0,
          ${+(Math.abs(angle) > 180)},${+(startAngle <= tempEndAngle)},
          ${innerStartPoint.x},${innerStartPoint.y} Z`

  return path
}
