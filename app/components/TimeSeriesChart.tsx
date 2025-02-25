/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { format } from 'date-fns'
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipProps } from 'recharts/types/component/Tooltip'

import type { ChartDatum } from '@oxide/api'

// Recharts's built-in ticks behavior is useless and probably broken
/**
 * Split the data into n evenly spaced ticks, with one at the left end and one a
 * little bit in from the right end, and the rest evenly spaced in between.
 */
function getTicks(data: { timestamp: number }[], n: number): number[] {
  if (data.length === 0) return []
  if (n < 2) throw Error('n must be at least 2 because of the start and end ticks')
  // bring the last tick in a bit from the end
  const maxIdx = data.length > 10 ? Math.floor((data.length - 1) * 0.8) : data.length - 1
  const startOffset = Math.floor((data.length - maxIdx) * 0.6)
  // if there are 4 ticks, their positions are 0/3, 1/3, 2/3, 3/3 (as fractions of maxIdx)
  const idxs = Array.from({ length: n }).map((_, i) =>
    Math.floor((maxIdx * i) / (n - 1) + startOffset)
  )
  return idxs.map((i) => data[i].timestamp)
}

function getVerticalTicks(n: number, max: number): number[] {
  return Array.from({ length: n }).map((_, i) => Math.floor(((i + 1) / n) * max))
}

/**
 * Check if the start and end time are on the same day
 * If they are we can omit the day/month in the date time format
 */
function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

const shortDateTime = (ts: number) => format(new Date(ts), 'M/d HH:mm')
const shortTime = (ts: number) => format(new Date(ts), 'HH:mm')
const longDateTime = (ts: number) => format(new Date(ts), 'MMM d, yyyy HH:mm:ss zz')

const GRID_GRAY = 'var(--stroke-secondary)'
const CURSOR_GRAY = 'rgba(var(--base-neutral-500-rgb), 1)'
const GREEN_400 = 'var(--theme-accent-400)'
const GREEN_600 = 'var(--theme-accent-600)'
const GREEN_800 = 'var(--theme-accent-800)'

// TODO: figure out how to do this with TW classes instead. As far as I can tell
// ticks only take direct styling
const textMonoMd = {
  fontSize: '0.6875rem',
  fontFamily: '"GT America Mono", monospace',
  fill: 'var(--content-quaternary)',
}

function renderTooltip(props: TooltipProps<number, string>, unit?: string) {
  const { payload } = props
  if (!payload || payload.length < 1) return null
  // TODO: there has to be a better way to get these values
  const {
    name,
    payload: { timestamp, value },
  } = payload[0]
  if (!timestamp || typeof value !== 'number') return null
  return (
    <div className="rounded border outline-0 text-sans-md text-secondary bg-raise border-secondary elevation-2">
      <div className="border-b px-3 py-2 pr-6 border-secondary">
        {longDateTime(timestamp)}
      </div>
      <div className="px-3 py-2">
        <div className="text-secondary">{name}</div>
        <div className="text-raise">
          {value.toLocaleString()}
          {unit && <span className="ml-1 text-secondary">{unit}</span>}
        </div>
        {/* TODO: unit on value if relevant */}
      </div>
    </div>
  )
}

type TimeSeriesChartProps = {
  className?: string
  data: ChartDatum[] | undefined
  title: string
  width: number
  height: number
  interpolation?: 'linear' | 'stepAfter'
  startTime: Date
  endTime: Date
  unit?: string
  yAxisTickFormatter?: (val: number) => string
}

const TICK_COUNT = 6

/** Round `value` up to nearest number divisible by `divisor` */
function roundUpToDivBy(value: number, divisor: number) {
  return Math.ceil(value / divisor) * divisor
}

// default export is most convenient for dynamic import
// eslint-disable-next-line import/no-default-export
export default function TimeSeriesChart({
  className,
  data: rawData,
  title,
  width,
  height,
  interpolation = 'linear',
  startTime,
  endTime,
  unit,
  yAxisTickFormatter = (val) => val.toLocaleString(),
}: TimeSeriesChartProps) {
  // We use the largest data point +20% for the graph scale. !rawData doesn't
  // mean it's empty (it will never be empty because we fill in artificial 0s at
  // beginning and end), it means the metrics requests haven't come back yet
  const maxY = useMemo(() => {
    if (!rawData) return null
    const dataMax = Math.max(...rawData.map((datum) => datum.value))
    return roundUpToDivBy(dataMax * 1.2, TICK_COUNT) // avoid uneven ticks
  }, [rawData])

  // If max value is set we normalize the graph so that
  // is the maximum, we also use our own function as recharts
  // doesn't fill the whole domain (just up to the data max)
  const yTicks = maxY
    ? { domain: [0, maxY], ticks: getVerticalTicks(TICK_COUNT, maxY) }
    : undefined

  // falling back here instead of in the parent lets us avoid causing a
  // re-render on every render of the parent when the data is undefined
  const data = useMemo(() => rawData || [], [rawData])

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer className={cn(className, 'rounded-lg border border-default')}>
        <AreaChart
          width={width}
          height={height}
          data={data}
          margin={{ top: 0, right: 8, bottom: 16, left: 0 }}
        >
          <CartesianGrid stroke={GRID_GRAY} vertical={false} />
          <XAxis
            axisLine={{ stroke: GRID_GRAY }}
            tickLine={{ stroke: GRID_GRAY }}
            // TODO: show full given date range in the chart even if the data doesn't fill the range
            domain={['auto', 'auto']}
            dataKey="timestamp"
            interval="preserveStart"
            scale="time"
            // TODO: use Date directly as x-axis values
            type="number"
            name="Time"
            ticks={getTicks(data, 5)}
            tickFormatter={isSameDay(startTime, endTime) ? shortTime : shortDateTime}
            tick={textMonoMd}
            tickMargin={8}
          />
          <YAxis
            axisLine={{ stroke: GRID_GRAY }}
            tickLine={{ stroke: GRID_GRAY }}
            orientation="right"
            tick={textMonoMd}
            tickMargin={8}
            tickFormatter={yAxisTickFormatter}
            padding={{ top: 32 }}
            {...yTicks}
          />
          {/* TODO: stop tooltip being focused by default on pageload if nothing else has been clicked */}
          <Tooltip
            isAnimationActive={false}
            content={(props: TooltipProps<number, string>) => renderTooltip(props, unit)}
            cursor={{ stroke: CURSOR_GRAY, strokeDasharray: '3,3' }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Area
            dataKey="value"
            name={title}
            type={interpolation}
            stroke={GREEN_600}
            fill={GREEN_400}
            isAnimationActive={false}
            dot={false}
            activeDot={{ fill: GREEN_800, r: 3, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
