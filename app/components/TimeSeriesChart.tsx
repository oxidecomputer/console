/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { format } from 'date-fns'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as R from 'remeda'
import { match } from 'ts-pattern'
import uPlot from 'uplot'
import UplotReact from 'uplot-react'

import type { ChartDatum } from '@oxide/api'
import { Error12Icon } from '@oxide/design-system/icons/react'

import { useElementSize } from '~/hooks/use-element-size'
import { subscribeToTheme } from '~/stores/theme'
import { classed } from '~/util/classed'

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

const shortDateTime = (ts: number) => {
  const date = new Date(ts)
  return format(
    date,
    date.getHours() === 0 && date.getMinutes() === 0 ? 'M/d' : 'M/d HH:mm'
  )
}
const shortTime = (ts: number) => format(new Date(ts), 'HH:mm')
const longDateTime = (ts: number) => format(new Date(ts), 'MMM d, yyyy HH:mm:ss zz')

const remToPx = (rem: number) =>
  rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
// We measure axis label widths on a detached canvas instead of uPlot's to avoid overwriting its
// own font setting.
const measureCtx = document.createElement('canvas').getContext('2d')
const measureTextWidth = (text: string, font: string) => {
  // getContext('2d') is only null if '2d' is unsupported, which, hey, you're not getting a graph
  if (!measureCtx) return 0
  measureCtx.font = font
  return measureCtx.measureText(text).width
}

const AXIS_FONT_REM_XS = 0.6875
const AXIS_TICK_LENGTH = 6
const AXIS_TICK_GAP = 8
// Left padding (px-5) is taken from the container and given to uPlot instead, so the plot sits
// flush left while x-tick labels can bleed into the gutter without clipping.
const CHART_LEFT_PAD = 20
const TOOLTIP_GAP = 12

type ChartTheme = {
  fontFamily: string
  stroke: string
  fill: string
  axisLine: string
  axisText: string
}

// Append an alpha channel to a resolved color, e.g. `oklch(l c h)` -> `oklch(l c h / 0.6)`. Assumes
// our colors are set in oklch!
const withAlpha = (color: string, alpha: number) => color.replace(/\)\s*$/, ` / ${alpha})`)

// uPlot draws to a canvas, so it can't consume CSS custom properties directly. We subscribe to the
// theme instead.
function getChartTheme(): ChartTheme {
  const style = getComputedStyle(document.body)
  const v = (name: string) => style.getPropertyValue(name)
  return {
    fontFamily: v('--font-mono'),
    stroke: v('--content-accent-tertiary'),
    fill: withAlpha(v('--surface-accent-secondary'), 0.6),
    axisLine: v('--stroke-secondary'),
    axisText: v('--content-quaternary'),
  }
}

function useChartTheme(): ChartTheme {
  const [colors, setColors] = useState(getChartTheme)
  useEffect(() => subscribeToTheme(() => setColors(getChartTheme())), [])
  return colors
}

/** Offset the box into the quadrant away from the point so it never overflows an edge */
type LeftRight = 'left' | 'right'
type TopBottom = 'top' | 'bottom'
function tooltipTransform(leftRight: LeftRight, topBottom: TopBottom): string {
  const tx = match(leftRight)
    .with('left', () => `calc(-100% - ${TOOLTIP_GAP}px)`)
    .with('right', () => `${TOOLTIP_GAP}px`)
    .exhaustive()
  const ty = match(topBottom)
    .with('top', () => `calc(-100% - ${TOOLTIP_GAP}px)`)
    .with('bottom', () => `${TOOLTIP_GAP}px`)
    .exhaustive()
  return `translate(${tx}, ${ty})`
}

function ChartTooltip({
  timestamp,
  value,
  seriesName,
  unit,
}: {
  timestamp: number
  value: number
  seriesName: string
  unit?: string
}) {
  return (
    <div
      role="tooltip"
      className="text-sans-md text-secondary bg-raise shadow-tooltip rounded-md outline-0"
    >
      <div className="border-secondary border-b px-3 py-2 pr-6">
        {longDateTime(timestamp)}
      </div>
      <div className="px-3 py-2">
        <div className="text-secondary">{seriesName}</div>
        <div className="text-raise">
          {value.toLocaleString()}
          {unit && <span className="text-secondary ml-1">{unit}</span>}
        </div>
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
          <div key={i} className="h-px w-full bg-(--stroke-secondary)" />
        ))}
      </div>
      <div className="flex justify-between">
        {[...Array(8)].map((_e, i) => (
          <div key={i} className="h-1.5 w-px bg-(--stroke-secondary)" />
        ))}
      </div>
    </div>
    <div className="relative flex h-full w-full items-center justify-center pb-11">
      {children}
    </div>
  </div>
)

const defaultYAxisTickFormatter = (val: number) => val.toLocaleString()

export function TimeSeriesChart({
  data: rawData,
  title,
  interpolation = 'linear',
  startTime,
  endTime,
  unit,
  yAxisTickFormatter = defaultYAxisTickFormatter,
  hasError = false,
  loading,
}: TimeSeriesChartProps) {
  // falling back here instead of in the parent lets us avoid causing a
  // re-render on every render of the parent when the data is undefined
  const data = useMemo(() => rawData || [], [rawData])

  const theme = useChartTheme()
  const fontPx = remToPx(AXIS_FONT_REM_XS)
  const axisFont = `${fontPx}px ${theme.fontFamily}`

  const [size, sizeRef] = useElementSize()

  const formatTime = isSameDay(startTime, endTime) ? shortTime : shortDateTime

  const [tooltip, setTooltip] = useState<{
    hoveredDataIndex: number
    left: number
    top: number
    // which side of the point the box sits on
    leftRight: LeftRight
    topBottom: TopBottom
  } | null>(null)

  const tooltipPlugin = useMemo<uPlot.Plugin>(
    () => ({
      hooks: {
        setCursor: (self) => {
          const { idx, top } = self.cursor
          if (idx == null || top == null) {
            setTooltip(null)
            return
          }

          const x = self.data[0][idx]
          const y = self.data[1][idx]
          if (y == null) {
            setTooltip(null)
            return
          }

          const plotRect = self.over.getBoundingClientRect()
          const chartRect = self.root.getBoundingClientRect()

          // cursor picks the y position, data picks the x position
          const left = self.valToPos(x, 'x')

          setTooltip({
            hoveredDataIndex: idx,
            // cursor coords are relative to the plot area, so we add in the diff between the plot
            // and the whole container
            left: plotRect.left - chartRect.left + left,
            top: plotRect.top - chartRect.top + top,
            leftRight: left > plotRect.width / 2 ? 'left' : 'right',
            topBottom: top > plotRect.height / 2 ? 'top' : 'bottom',
          })
        },
        init: (self) => {
          self.over.addEventListener('mouseleave', () => setTooltip(null))
        },
      },
    }),
    []
  )

  const uRef = useRef<uPlot | null>(null)
  const yAxisTickFormatterRef = useRef<(val: number) => string>(yAxisTickFormatter)
  yAxisTickFormatterRef.current = yAxisTickFormatter
  useEffect(() => {
    uRef.current?.redraw()
  }, [yAxisTickFormatter])

  // uplot-react rebuilds the whole chart (they call this the "create" path) when any top-level
  // option (other than width or height) changes by reference.
  const chartOptions = useMemo(
    () =>
      ({
        scales: {
          x: {},
          y: {
            range: (_u, _min, max) => uPlot.rangeNum(0, max * 1.2, 0.1, true),
          },
        },
        series: [
          {},
          {
            show: true,
            stroke: theme.stroke,
            fill: theme.fill,
            points: { show: false },
            paths: match(interpolation)
              .with('linear', () => uPlot.paths.linear?.())
              .with('stepAfter', () => uPlot.paths.stepped?.({ align: 1 }))
              .exhaustive(),
          },
        ],
        axes: [
          {
            stroke: theme.axisText,
            font: axisFont,
            space: (_u, _axisIdx, _min, _max, plotDim) => plotDim / 5,
            values: (_u, times) => times.map((t) => formatTime(t * 1000)),
            border: { show: true, stroke: theme.axisLine, width: 1 },
            gap: AXIS_TICK_GAP,
            grid: { show: false },
            size: fontPx + AXIS_TICK_GAP + AXIS_TICK_LENGTH,
            ticks: {
              show: true,
              stroke: theme.axisLine,
              width: 1,
              size: AXIS_TICK_LENGTH,
            },
          },
          {
            stroke: theme.axisText,
            font: axisFont,
            side: 1,
            border: { show: true, stroke: theme.axisLine, width: 1 },
            gap: AXIS_TICK_GAP,
            ticks: {
              show: true,
              stroke: theme.axisLine,
              width: 1,
              size: AXIS_TICK_LENGTH,
              filter: (_u, yValues) => yValues.map((v) => (v === 0 ? null : v)),
            },
            values: (_u, yValues) =>
              yValues.map((v) => (v === 0 ? '' : yAxisTickFormatterRef.current(v))),
            grid: { show: true, stroke: theme.axisLine, width: 1 },
            size: (_self, values) => {
              const axisBase = AXIS_TICK_LENGTH + AXIS_TICK_GAP
              // given the monospace font, longest by char count is longest by rendered width
              const longestVal = R.firstBy(values ?? [], (s) => -s.length) || ''
              return axisBase + measureTextWidth(longestVal, axisFont)
            },
          },
        ],
        padding: [null, null, null, CHART_LEFT_PAD],
        cursor: {
          x: false,
          y: false,
          // TODO: i like the drag and we should put it back in
          drag: { x: false },
        },
        legend: { show: false },
        plugins: [tooltipPlugin],
      }) satisfies Omit<uPlot.Options, 'width' | 'height'>,
    [formatTime, tooltipPlugin, interpolation, theme, axisFont, fontPx]
  )

  // Width/height changes cause a cheaper "update" path for uplot, instead of "create", so it gets
  // its own layer of memo
  const options = useMemo(
    () =>
      ({
        ...chartOptions,
        width: size?.width ?? 0,
        height: 300,
      }) satisfies uPlot.Options,
    [chartOptions, size?.width]
  )

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

  const aligned: uPlot.AlignedData = [
    data.map(({ timestamp }) => timestamp / 1000),
    data.map(({ value }) => value),
  ]

  const hovered = tooltip ? data[tooltip.hoveredDataIndex] : undefined
  return (
    <figure aria-label={title} className="m-0 pt-8 pr-5 pb-5 pl-0">
      <div ref={sizeRef} className="relative">
        <UplotReact options={options} data={aligned} onCreate={(u) => (uRef.current = u)} />
        {tooltip && hovered && hovered.value !== null && (
          <div
            className="pointer-events-none absolute z-10 w-max"
            style={{
              left: tooltip.left,
              top: tooltip.top,
              transform: tooltipTransform(tooltip.leftRight, tooltip.topBottom),
            }}
          >
            <ChartTooltip
              timestamp={hovered.timestamp}
              value={hovered.value}
              seriesName={title}
              unit={unit}
            />
          </div>
        )}
      </div>
    </figure>
  )
}

const MetricsLoadingIndicator = () => (
  <div className="metrics-loading-indicator" aria-label="Chart loading">
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
      {icon}
      <div className="text-semi-lg text-raise text-center">{title}</div>
      <div className="text-sans-md text-secondary text-center text-balance">
        {description}
      </div>
    </div>
    <div
      className="bg-accent absolute inset-x-0 top-1 bottom-12"
      style={{
        background:
          'radial-gradient(200% 100% at 50% 100%, var(--surface-default) 0%, var(--surface-secondary) 100%)',
      }}
    />
  </>
)

const MetricsError = () => (
  <MetricsMessage
    icon={
      <div className="my-2 flex h-8 w-8 items-center justify-center">
        <div className="bg-destructive absolute h-8 w-8 rounded-full opacity-20 motion-safe:animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <Error12Icon className="text-error-tertiary relative h-6 w-6" />
      </div>
    }
    title="Something went wrong"
    description="Please try again. If the problem persists, contact your administrator."
  />
)

const MetricsEmpty = () => (
  <MetricsMessage
    // mt-3 is a shameful hack to get it vertically centered in the chart
    title={<div className="mt-3">No data</div>}
    description="There is no data for this time period."
  />
)
export const ChartContainer = classed.div`flex w-full grow flex-col rounded-lg border border-default bg-default`

type ChartHeaderProps = {
  title: string
  label: string
  description?: string
  children?: ReactNode
}

export function ChartHeader({ title, label, description, children }: ChartHeaderProps) {
  return (
    <div className="border-secondary flex items-center justify-between border-b px-5 pt-5 pb-4">
      <div>
        <h2 className="flex items-baseline gap-1.5">
          <div className="text-sans-semi-lg">{title}</div>
          <div className="text-sans-md text-secondary">{label}</div>
        </h2>
        <div className="text-sans-md text-secondary mt-0.5">{description}</div>
      </div>
      {children}
    </div>
  )
}
