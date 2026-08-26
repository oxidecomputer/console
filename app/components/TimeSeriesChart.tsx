/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { useMemo, useState, type ReactNode } from 'react'
import * as R from 'remeda'
import { match } from 'ts-pattern'
import uPlot from 'uplot'

import type { ChartDatum } from '@oxide/api'
import { Error12Icon } from '@oxide/design-system/icons/react'

import { ChartTooltip, type LeftRight, type TopBottom } from '~/components/ChartTooltip'
import { FramedChart, type UPlotOptions } from '~/components/FramedChart'
import {
  type ChartTheme,
  seriesColor,
  timeFormatterForRange,
  useChartTheme,
  useLiveAxisFormatter,
  xTimeAxis,
  yValueAxis,
} from '~/util/charts'
import { classed } from '~/util/classed'

const CHART_HEIGHT = 300

type TimeSeriesChartProps = {
  timestamps: number[] | undefined
  data: (number | null)[][] | undefined
  title: string
  interpolation?: 'linear' | 'stepAfter'
  startTime: Date
  endTime: Date
  unit?: string
  yAxisTickFormatter?: (val: number) => string
  hasError?: boolean
  loading: boolean
  seriesLabels?: readonly string[]
}

// this top margin is also in the chart, probably want a way of unifying the sizing between the two
export const SkeletonMetric = ({
  children,
  shimmer = false,
  className,
}: {
  children: ReactNode
  shimmer?: boolean
  className?: string
}) => (
  <div className="relative flex w-full items-center" style={{ height: CHART_HEIGHT }}>
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

/**
 * Split a single `ChartDatum[]` into the parallel `timestamps`/`data` arrays the chart consumes.
 * Returns `undefined` props when there's no data so the chart goes into the loading/empty state.
 */
export function toChartSeries(data: ChartDatum[] | undefined): {
  timestamps: number[] | undefined
  values: (number | null)[][] | undefined
} {
  if (!data) return { timestamps: undefined, values: undefined }
  return {
    timestamps: data.map((d) => d.timestamp),
    values: [data.map((d) => d.value)],
  }
}

export function TimeSeriesChart({
  timestamps,
  data,
  title,
  interpolation = 'linear',
  startTime,
  endTime,
  unit,
  yAxisTickFormatter = defaultYAxisTickFormatter,
  hasError = false,
  loading,
  seriesLabels,
}: TimeSeriesChartProps) {
  const theme = useChartTheme()

  const formatTime = timeFormatterForRange(startTime, endTime)

  const dataLength = data?.length ?? 0

  const [tooltip, setTooltip] = useState<{
    // the x position
    hoveredDataIndex: number
    // which series is hovered
    hoveredSeriesIndex: number
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

          // We hunt down the series whose Y is closest to the cursor position at the given X index.
          // Reminder that the first series is the X values, so we start at series index 1 here.
          const nearestSeriesIndex = R.firstBy(
            R.range(1, self.series.length).filter((s) => self.data[s][idx] != null),
            // non-null: the filter above dropped series that are null at this idx
            (s) => Math.abs(self.valToPos(self.data[s][idx]!, 'y') - top)
          )
          if (nearestSeriesIndex === undefined) {
            setTooltip(null)
            return
          }

          const x = self.data[0][idx]

          const plotRect = self.over.getBoundingClientRect()
          const chartRect = self.root.getBoundingClientRect()

          // cursor picks the y position, data picks the x position
          const left = self.valToPos(x, 'x')

          setTooltip({
            hoveredDataIndex: idx,
            hoveredSeriesIndex: nearestSeriesIndex - 1,
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

  const { uRef, formatterRef } = useLiveAxisFormatter(yAxisTickFormatter)

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
          ...R.times(dataLength, (i) => ({
            show: true,
            stroke: seriesColor(i, theme),
            fill: dataLength === 1 ? theme.fill : undefined,
            points: { show: false },
            paths: match(interpolation)
              .with('linear', () => uPlot.paths.linear?.())
              .with('stepAfter', () => uPlot.paths.stepped?.({ align: 1 }))
              .exhaustive(),
          })),
        ],
        axes: [
          xTimeAxis({ theme, formatTime }),
          yValueAxis({
            theme,
            grid: { show: true, stroke: theme.axisLine, width: 1 },
            values: (_u, yValues) =>
              yValues.map((v) => (v === 0 ? '' : formatterRef.current(v))),
          }),
        ],
        focus: { alpha: 0.5 },
        cursor: {
          // setting this property causes non-focused series to dim on hover.
          // 1e9 just means "any proximity will do"
          focus: { prox: 1e9 },
          x: false,
          y: false,
          // TODO: i like the drag and we should put it back in
          drag: { x: false },
          points: {
            size: 6,
            // TODO: with multiline, pinning the focused point color doesn't make much sense anymore
            fill: theme.hoverPoint,
          },
        },
        legend: { show: false },
        plugins: [tooltipPlugin],
      }) satisfies UPlotOptions,
    [dataLength, formatTime, tooltipPlugin, interpolation, theme, formatterRef]
  )

  const aligned = useMemo<uPlot.AlignedData>(() => {
    const points = data ?? []
    const times = timestamps ?? []

    return [times.map((t) => t / 1000), ...points]
  }, [data, timestamps])

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

  if (!data || data.length === 0 || !timestamps || timestamps.length === 0) {
    return (
      <SkeletonMetric>
        <MetricsEmpty />
      </SkeletonMetric>
    )
  }

  // in case the data changed out from under us, let's at least check that we can find something
  // to render
  const hoveredValue =
    tooltip &&
    tooltip.hoveredSeriesIndex < data.length &&
    tooltip.hoveredDataIndex < timestamps.length
      ? data[tooltip.hoveredSeriesIndex][tooltip.hoveredDataIndex]
      : null

  const hovered =
    tooltip && hoveredValue != null
      ? { timestamp: timestamps[tooltip.hoveredDataIndex], value: hoveredValue }
      : undefined

  return (
    <FramedChart
      title={title}
      height={CHART_HEIGHT}
      chartOptions={chartOptions}
      data={aligned}
      uRef={uRef}
      legend={
        seriesLabels && (
          <ChartLegend
            title={title}
            count={data.length}
            seriesLabels={seriesLabels}
            theme={theme}
          />
        )
      }
    >
      {tooltip && hovered && (
        <ChartTooltip
          timestamp={hovered.timestamp}
          left={tooltip.left}
          top={tooltip.top}
          offset={[tooltip.leftRight, tooltip.topBottom]}
        >
          <div className="text-secondary">
            {seriesLabels
              ? seriesLabel(title, tooltip.hoveredSeriesIndex, seriesLabels)
              : title}
          </div>
          <div className="text-raise">
            {hovered.value.toLocaleString()}
            {unit && <span className="text-secondary ml-1">{unit}</span>}
          </div>
        </ChartTooltip>
      )}
    </FramedChart>
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

export const MetricsEmpty = () => (
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

// We generally expect a list of labels to be the same length as the data list (or not provided), so
// the fallback here is just for bad behavior.
function seriesLabel(title: string, i: number, labels: readonly string[]): string {
  return labels[i] ?? `${title} #${i + 1}`
}

function ChartLegend({
  title,
  count,
  seriesLabels,
  theme,
}: {
  title: string
  count: number
  seriesLabels: readonly string[]
  theme: ChartTheme
}) {
  return (
    <ul className="mt-2 flex max-h-24 flex-wrap gap-x-4 gap-y-1.5 overflow-y-auto pl-5">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="text-mono-xs text-secondary flex items-center gap-2">
          <span
            className="h-0.5 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: seriesColor(i, theme) }}
          />
          {seriesLabel(title, i, seriesLabels)}
        </li>
      ))}
    </ul>
  )
}
