import { format } from 'date-fns'
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

// Recharts's built-in ticks behavior is useless and probably broken
/**
 * Split the data into n evenly spaced ticks, with one at the left end and one a
 * little bit in from the right end, and the rest evenly spaced in between.
 */
function getTicks(data: { timestamp: number }[], n: number): number[] {
  if (data.length === 0) return []
  if (n < 2) throw Error('n must be at least 2 because of the start and end ticks')
  // bring the last tick in a bit from the end
  const maxIdx = data.length > 10 ? Math.floor((data.length - 1) * 0.9) : data.length - 1
  // if there are 4 ticks, their positions are 0/3, 1/3, 2/3, 3/3 (as fractions of maxIdx)
  const idxs = new Array(n).fill(0).map((_, i) => Math.floor((maxIdx * i) / (n - 1)))
  return idxs.map((i) => data[i].timestamp)
}

const shortDateTime = (ts: number) => format(new Date(ts), 'M/d HH:mm')
const longDateTime = (ts: number) => format(new Date(ts), 'MMM d, yyyy HH:mm:ss zz')

// TODO: change these to theme colors so they work in light mode
const LIGHT_GRAY = 'var(--base-grey-600)'
const GRID_GRAY = 'var(--base-grey-1000)'
const GREEN = 'var(--chart-stroke-line)'

// TODO: figure out how to do this with TW classes instead. As far as I can tell
// ticks only take direct styling
const textMonoMd = {
  fontSize: '0.75rem',
  fontFamily: '"GT America Mono", monospace',
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
    <div className="border text-sans-sm text-secondary bg-raise border-secondary">
      <div className="border-b py-2 px-3 border-secondary">{longDateTime(timestamp)}</div>
      <div className="py-2 px-3">
        <div className="text-default">{name}</div>
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
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        width={width}
        height={height}
        data={data}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        className={className}
      >
        <CartesianGrid stroke={GRID_GRAY} vertical={false} />
        <Area
          dataKey="value"
          name={title}
          type={interpolation}
          stroke={GREEN}
          strokeWidth={1}
          // cheating to make this a line chart
          fillOpacity={0}
          isAnimationActive={false}
          activeDot={{ fill: LIGHT_GRAY, r: 2, strokeWidth: 0 }}
        />
        <XAxis
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
          tickFormatter={shortDateTime}
          tick={textMonoMd}
          tickMargin={4}
          padding={{ right: 20 }}
        />
        <YAxis orientation="right" tick={textMonoMd} tickSize={0} tickMargin={8} />
        {/* TODO: stop tooltip being focused by default on pageload if nothing else has been clicked */}
        <Tooltip
          isAnimationActive={false}
          content={renderTooltip}
          cursor={{ stroke: LIGHT_GRAY, strokeDasharray: '3,3' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
