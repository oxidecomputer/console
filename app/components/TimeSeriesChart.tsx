/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { format } from 'date-fns'
import { useMemo, type ReactNode } from 'react'
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
import { Error12Icon } from '@oxide/design-system/icons/react'

import { classed } from '~/util/classed'

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

// The length of a character in pixels at 11px with GT America Mono
// Used for dynamically sizing the yAxis. If this were to fallback
// the font would likely be thinner than the monospaced character
// and therefore not overflow
const TEXT_CHAR_WIDTH = 6.82

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
  interpolation?: 'linear' | 'stepAfter'
  startTime: Date
  endTime: Date
  unit?: string
  yAxisTickFormatter?: (val: number) => string
  hasError?: boolean
  loading: boolean
}

const TICK_COUNT = 6
const TICK_MARGIN = 8
const TICK_SIZE = 6

/** Round `value` up to nearest number divisible by `divisor` */
function roundUpToDivBy(value: number, divisor: number) {
  return Math.ceil(value / divisor) * divisor
}

// this top margin is also in the chart, probably want a way of unifying the sizing between the two
const SkeletonMetric = ({
  children,
  shimmer = false,
  className,
}: {
  children: ReactNode
  shimmer?: boolean
  className?: string
}) => (
  <div className="relative flex h-[300px] w-full items-center">
    <div
      className={cn(
        shimmer && 'motion-safe:animate-pulse',
        'absolute inset-0 bottom-7',
        className
      )}
    >
      <div className="flex h-full flex-col justify-between">
        {[...Array(4)].map((_e, i) => (
          <div key={i} className="h-px w-full bg-[--stroke-secondary]" />
        ))}
      </div>
      <div className="flex justify-between">
        {[...Array(8)].map((_e, i) => (
          <div key={i} className="h-1.5 w-px bg-[--stroke-secondary]" />
        ))}
      </div>
    </div>
    <div className="relative flex h-full w-full items-center justify-center pb-11">
      {children}
    </div>
  </div>
)

export function TimeSeriesChart({
  data: rawData,
  title,
  interpolation = 'linear',
  startTime,
  endTime,
  unit,
  yAxisTickFormatter = (val) => val.toLocaleString(),
  hasError = false,
  loading,
}: TimeSeriesChartProps) {
  // We use the largest data point +20% for the graph scale. !rawData doesn't
  // mean it's empty (it will never be empty because we fill in artificial 0s at
  // beginning and end), it means the metrics requests haven't come back yet
  const maxY = useMemo(() => {
    if (!rawData) return null
    const dataMax = Math.max(
      ...rawData.map((datum) => datum.value).filter((x) => x !== null)
    )
    return roundUpToDivBy(dataMax * 1.2, TICK_COUNT) // avoid uneven ticks
  }, [rawData])

  // If max value is set we normalize the graph so that
  // is the maximum, we also use our own function as recharts
  // doesn't fill the whole domain (just up to the data max)
  const yTicks = maxY
    ? { domain: [0, maxY], ticks: getVerticalTicks(TICK_COUNT, maxY) }
    : undefined

  // We get the longest label length and multiply that with our `TICK_CHAR_WIDTH`
  // and add the extra space for the tick stroke and spacing
  // It's possible to get clever and calculate the width using the canvas or font metrics
  // But our font is monospace so we can just use the length of the text * the baked width of the character
  const maxLabelLength = yTicks
    ? Math.max(...yTicks.ticks.map((tick) => yAxisTickFormatter(tick).length))
    : 0
  const maxLabelWidth = maxLabelLength * TEXT_CHAR_WIDTH + TICK_SIZE + TICK_MARGIN

  // falling back here instead of in the parent lets us avoid causing a
  // re-render on every render of the parent when the data is undefined
  const data = useMemo(() => rawData || [], [rawData])

  if (hasError) {
    return (
      <SkeletonMetric>
        <MetricsError />
      </SkeletonMetric>
    )
  }

  if (loading) {
    return (
      <SkeletonMetric shimmer>
        <MetricsLoadingIndicator />
      </SkeletonMetric>
    )
  }
  if (!data || data.length === 0) {
    return (
      <SkeletonMetric>
        <MetricsEmpty />
      </SkeletonMetric>
    )
  }

  // ResponsiveContainer has default height and width of 100%
  // https://recharts.org/en-US/api/ResponsiveContainer
  return (
    <div className="px-5 pb-5 pt-8">
      <ResponsiveContainer height={300}>
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
            tickMargin={TICK_MARGIN}
            tickSize={TICK_SIZE}
          />
          <YAxis
            axisLine={{ stroke: GRID_GRAY }}
            tickLine={{ stroke: GRID_GRAY }}
            orientation="right"
            tick={textMonoMd}
            tickSize={TICK_SIZE}
            tickMargin={TICK_MARGIN}
            tickFormatter={yAxisTickFormatter}
            padding={{ top: 32 }}
            width={maxLabelWidth}
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
            name={title} // Provides name for value in hover tooltip
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

const MetricsLoadingIndicator = () => (
  <div className="metrics-loading-indicator">
    <span></span>
    <span></span>
    <span></span>
  </div>
)

const MetricsMessage = ({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode
  title: React.ReactNode
  description: React.ReactNode
}) => (
  <>
    <div className="z-10 flex w-52 flex-col items-center justify-center gap-1">
      <div className="my-2 flex h-8 w-8 items-center justify-center">{icon}</div>
      <div className="text-semi-lg text-center text-raise">{title}</div>
      <div className="text-balance text-center text-sans-md text-secondary">
        {description}
      </div>
    </div>
    <div
      className="absolute inset-x-0 bottom-12 top-1 bg-accent-secondary"
      style={{
        background:
          'radial-gradient(197.76% 54.9% at 50% 50%, var(--surface-default) 0%, rgba(8, 15, 17, 0.00) 100%)',
      }}
    />
  </>
)

const MetricsError = () => (
  <MetricsMessage
    icon={
      <>
        <div className="absolute h-8 w-8 rounded-full opacity-20 bg-destructive motion-safe:animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <Error12Icon className="relative h-6 w-6 text-error-tertiary" />
      </>
    }
    title="Something went wrong"
    description="Please try again. If the problem persists, contact your administrator."
  />
)

const MetricsEmpty = () => (
  <MetricsMessage
    // icon={<Char className="h-6 w-6 text-secondary" />}
    title="No data"
    description="There is no data for this time period."
  />
)
export const ChartContainer = classed.div`flex w-full grow flex-col rounded-lg border border-default`

type ChartHeaderProps = {
  title: string
  label: string
  description?: string
  children?: ReactNode
}

export function ChartHeader({ title, label, description, children }: ChartHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-5 pb-4 pt-5 border-secondary">
      <div>
        <h2 className="flex items-baseline gap-1.5">
          <div className="text-sans-semi-lg">{title}</div>
          <div className="text-sans-md text-secondary">{label}</div>
        </h2>
        <div className="mt-0.5 text-sans-md text-secondary">{description}</div>
      </div>
      {children}
    </div>
  )
}
