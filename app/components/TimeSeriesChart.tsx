import cn from 'classnames'
import { format } from 'date-fns'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipProps } from 'recharts/types/component/Tooltip'

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
  const idxs = new Array(n)
    .fill(0)
    .map((_, i) => Math.floor((maxIdx * i) / (n - 1) + startOffset))
  return idxs.map((i) => data[i].timestamp)
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

// TODO: change these to theme colors so they work in light mode
const GRID_GRAY = 'var(--stroke-secondary)'
const GREEN_600 = 'var(--base-green-600)'
const GREEN_800 = 'var(--base-green-800)'

// TODO: figure out how to do this with TW classes instead. As far as I can tell
// ticks only take direct styling
const textMonoMd = {
  fontSize: '0.6875rem',
  fontFamily: '"GT America Mono", monospace',
  fill: 'var(--content-quaternary)',
}

function renderTooltip(props: TooltipProps<number, string>) {
  const { payload } = props
  if (!payload || payload.length < 1) return null
  // TODO: there has to be a better way to get these values
  const {
    name,
    payload: { timestamp, value },
  } = payload[0]
  if (!timestamp || !value) return null
  return (
    <div className="rounded border outline-0 text-sans-md text-tertiary bg-raise border-secondary">
      <div className="border-b py-2 px-3 border-secondary">{longDateTime(timestamp)}</div>
      <div className="py-2 px-3">
        <div className="text-secondary">{name}</div>
        <div>{value}</div>
        {/* TODO: unit on value if relevant */}
      </div>
    </div>
  )
}

type Datum = {
  // we're doing the x axis as timestamp ms instead of Date primarily to make
  // type=number work
  timestamp: number
  value: number
}

type Props = {
  className?: string
  data: Datum[]
  title: string
  width: number
  height: number
  interpolation?: 'linear' | 'stepAfter'
  customXTicks?: boolean
  startTime: Date
  endTime: Date
}

// Limitations
//   - Only one dataset — can't do overlapping area chart yet

export function TimeSeriesAreaChart({
  className,
  data,
  title,
  width,
  height,
  interpolation = 'linear',
  customXTicks,
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart
        width={width}
        height={height}
        data={data}
        margin={{ top: 0, right: 20, bottom: 5, left: 0 }}
        className={className}
      >
        <CartesianGrid stroke={GRID_GRAY} vertical={false} />
        <XAxis
          axisLine={{ stroke: 'var(--stroke-secondary)' }}
          tickLine={{ stroke: 'var(--stroke-secondary)' }}
          // TODO: show full given date range in the chart even if the data doesn't fill the range
          domain={['auto', 'auto']}
          dataKey="timestamp"
          name="Time"
          ticks={customXTicks ? getTicks(data, 5) : undefined}
          // TODO: decide timestamp format based on time range of chart
          tickFormatter={shortDateTime}
          tick={textMonoMd}
          tickMargin={8}
        />
        <YAxis
          axisLine={{ stroke: 'var(--stroke-secondary)' }}
          tickLine={{ stroke: 'var(--stroke-secondary)' }}
          orientation="right"
          tick={textMonoMd}
          tickMargin={8}
        />
        {/* TODO: stop tooltip being focused by default on pageload if nothing else has been clicked */}
        <Tooltip
          isAnimationActive={false}
          content={renderTooltip}
          cursor={{ stroke: 'var(--base-green-400)', strokeDasharray: '3,3' }}
          wrapperStyle={{ outline: 'none' }}
        />
        <Area
          dataKey="value"
          name={title}
          type={interpolation}
          stroke={GREEN_600}
          strokeWidth={1}
          // cheating to make this a line chart
          fillOpacity={0}
          isAnimationActive={false}
          activeDot={{ fill: GREEN_800, r: 3, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function TimeSeriesLineChart({
  className,
  data,
  title,
  width,
  height,
  interpolation = 'linear',
  customXTicks,
  startTime,
  endTime,
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        width={width}
        height={height}
        data={data}
        margin={{ top: 0, right: 0, bottom: 5, left: 0 }}
        className={cn(className, 'rounded-lg border border-default')}
      >
        <CartesianGrid stroke={GRID_GRAY} vertical={false} />
        <XAxis
          axisLine={{ stroke: 'var(--stroke-secondary)' }}
          tickLine={{ stroke: 'var(--stroke-secondary)' }}
          // TODO: show full given date range in the chart even if the data doesn't fill the range
          domain={['auto', 'auto']}
          dataKey="timestamp"
          interval="preserveStart"
          scale="time"
          // TODO: use Date directly as x-axis values
          type="number"
          name="Time"
          ticks={customXTicks ? getTicks(data, 5) : undefined}
          // TODO: decide timestamp format based on time range of chart
          tickFormatter={isSameDay(startTime, endTime) ? shortTime : shortDateTime}
          tick={textMonoMd}
          tickMargin={8}
        />
        <YAxis
          axisLine={{ stroke: 'var(--stroke-secondary)' }}
          tickLine={{ stroke: 'var(--stroke-secondary)' }}
          orientation="right"
          tick={textMonoMd}
          tickSize={6}
          tickMargin={8}
          padding={{ top: 32 }}
        />
        {/* TODO: stop tooltip being focused by default on pageload if nothing else has been clicked */}
        <Tooltip
          isAnimationActive={false}
          content={renderTooltip}
          cursor={{ stroke: 'var(--base-green-400)', strokeDasharray: '3,3' }}
          wrapperStyle={{ outline: 'none' }}
        />
        <Line
          dataKey="value"
          name={title}
          type={interpolation}
          stroke={GREEN_600}
          // cheating to make this a line chart
          isAnimationActive={false}
          dot={false}
          activeDot={{ fill: GREEN_800, r: 3, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
