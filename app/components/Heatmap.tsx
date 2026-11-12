/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo, useState } from 'react'
import * as R from 'remeda'
import { match } from 'ts-pattern'
import type uPlot from 'uplot'

import { ChartTooltip, type TopBottom, type LeftRight } from '~/components/ChartTooltip'
import { type UPlotOptions, FramedChart } from '~/components/FramedChart'
import {
  getSampleCountMetadata,
  getScalingFunction,
  type ColorScale,
} from '~/components/heatmap-color-scale'
import {
  timeFormatterForRange,
  useChartTheme,
  useLiveAxisFormatter,
  xTimeAxis,
  yValueAxis,
} from '~/util/charts'

export type HeatmapDistribution = { bins: number[]; counts: number[] }

const CHART_HEIGHT = 300

// TODO: If you don't like seams between adjacent cells, you can bleed over the
// edges a little to hide them. Too much and you can see cells not abide by
// their grid. I honestly like it at 0, but up to 0.5 can get a smoother look
// without screwing up the grid too much
const CELL_OVERFLOW = 0

type ColorRamp = {
  stops: string[]
}

// [CSS variable, fallback] pairs. Fallbacks cover the unlikely case the theme
// variables are missing.
const RAMP_STOPS = [
  ['--surface-accent', 'oklch(0.24 0.0722 183.7)'],
  ['--content-accent', 'oklch(0.77 0.1919 163.7)'],
] as const

const CSS_VAR_RAMP: ColorRamp = {
  stops: RAMP_STOPS.map(([name, fallback]) => `var(${name}, ${fallback})`),
}

// Interpolates the color between the two closest stops, for 0 <= t <= 1.
const rampColor = ({ stops }: ColorRamp, t: number): string => {
  const clamped = R.clamp(t, { min: 0, max: 1 })
  const lastIndex = stops.length - 1
  const progress = clamped * lastIndex
  const start = R.clamp(Math.floor(progress), { max: lastIndex - 1 })
  const localT = progress - start
  const from = stops[start]
  const to = stops[start + 1]
  return `color-mix(in oklch, ${from}, ${to} ${localT * 100}%)`
}

type Hover = {
  col: number
  row: number
  left: number
  top: number
  leftRight: LeftRight
  topBottom: TopBottom
  cell: { left: number; top: number; width: number; height: number }
}

type HeatmapProps = {
  title: string
  timestamps: number[]
  startTimes: number[]
  distributions: (HeatmapDistribution | null)[]
  yAxisTickFormatter?: (val: number) => string
  unit?: string
  /** Drawn rotated alongside the y-axis tick labels, e.g. a unit */
  yAxisLabel?: string
  colorScale?: ColorScale
}

const defaultYAxisTickFormatter = (val: number) => val.toLocaleString()

export function Heatmap({
  title,
  timestamps,
  startTimes,
  distributions,
  yAxisTickFormatter = defaultYAxisTickFormatter,
  unit,
  yAxisLabel,
  colorScale = 'ranked',
}: HeatmapProps) {
  const theme = useChartTheme()
  const [hover, setHover] = useState<Hover | null>(null)

  // All distributions in a timeseries share the same bucket definition, so we
  // take the bins from the first present sample as the y-axis.
  const bins = useMemo(
    () => distributions.find((d) => d !== null)?.bins ?? [],
    [distributions]
  )
  const binCount = bins.length
  const colCount = distributions.length

  const sampleCountMetadata = useMemo(
    () => getSampleCountMetadata(distributions.flatMap((d) => d?.counts ?? [])),
    [distributions]
  )

  // uPlot's time scale wants seconds; metrics timestamps are milliseconds
  const rightEdges = useMemo(() => timestamps.map((t) => t / 1000), [timestamps])
  const leftEdges = useMemo(() => startTimes.map((t) => t / 1000), [startTimes])

  // uPlot doesn't actually have heatmap support, but we can use its position
  // functions to make this (somewhat) easy
  const drawCells = useMemo(() => {
    const scaleCount = getScalingFunction(sampleCountMetadata, colorScale)

    return (u: uPlot) => {
      if (binCount === 0 || colCount === 0) return

      // since a canvas can't resolve CSS variables, we simulate it by reading
      // the ramp colors off the element furthest down the tree (the chart's
      // root element)
      const style = getComputedStyle(u.root)
      const colorRamp = {
        stops: RAMP_STOPS.map(
          ([name, fallback]) => style.getPropertyValue(name).trim() || fallback
        ),
      }

      const ctx = u.ctx
      ctx.save()
      ctx.beginPath()
      ctx.rect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height)
      ctx.clip()
      distributions.forEach((distribution, colIndex) => {
        if (!distribution) return

        const leftEdge = u.valToPos(leftEdges[colIndex], 'x', true)
        const rightEdge = u.valToPos(rightEdges[colIndex], 'x', true)
        distribution.counts.forEach((count, rowIndex) => {
          // leave empty cells blank instead of the "bottom" color
          if (count === 0) return

          const topEdge = u.valToPos(rowIndex + 1, 'y', true)
          const bottomEdge = u.valToPos(rowIndex, 'y', true)
          ctx.fillStyle = rampColor(colorRamp, scaleCount(count))
          ctx.fillRect(
            leftEdge - CELL_OVERFLOW,
            topEdge - CELL_OVERFLOW,
            rightEdge - leftEdge + CELL_OVERFLOW,
            bottomEdge - topEdge + CELL_OVERFLOW
          )
        })
      })
      ctx.restore()
    }
  }, [
    distributions,
    leftEdges,
    rightEdges,
    colCount,
    binCount,
    colorScale,
    sampleCountMetadata,
  ])

  const tooltipPlugin = useMemo<uPlot.Plugin>(
    () => ({
      hooks: {
        setCursor: (u) => {
          const { left, top } = u.cursor
          if (left == null || top == null || left < 0 || top < 0) {
            setHover(null)
            return
          }

          const xVal = u.posToVal(left, 'x')
          const col = R.findIndex(
            leftEdges,
            (leftEdge, i) => xVal >= leftEdge && xVal <= rightEdges[i]
          )
          if (col === -1) {
            setHover(null)
            return
          }

          const row = Math.min(binCount - 1, Math.max(0, Math.floor(u.posToVal(top, 'y'))))
          // cursor coords are relative to the plot area, so we add in the diff between the plot
          // and the whole container
          const plotRect = u.over.getBoundingClientRect()
          const chartRect = u.root.getBoundingClientRect()
          const containerLeft = plotRect.left - chartRect.left
          const containerTop = plotRect.top - chartRect.top

          const clampWidth = R.clamp({ min: 0, max: plotRect.width })
          const clampHeight = R.clamp({ min: 0, max: plotRect.height })
          const cellLeft = clampWidth(u.valToPos(leftEdges[col], 'x'))
          const cellRight = clampWidth(u.valToPos(rightEdges[col], 'x'))
          const cellTop = clampHeight(u.valToPos(row + 1, 'y'))
          const cellBottom = clampHeight(u.valToPos(row, 'y'))

          // anchor the tooltip at the timestamp (the cell's right edge / identity)
          const x = u.valToPos(rightEdges[col], 'x')
          setHover({
            col,
            row,
            left: containerLeft + x,
            top: containerTop + top,
            leftRight: x > plotRect.width / 2 ? 'left' : 'right',
            topBottom: top > plotRect.height / 2 ? 'top' : 'bottom',
            cell: {
              left: containerLeft + cellLeft,
              top: containerTop + cellTop,
              width: cellRight - cellLeft,
              height: cellBottom - cellTop,
            },
          })
        },
        init: (u) => {
          u.over.addEventListener('mouseleave', () => setHover(null))
        },
      },
    }),
    [binCount, rightEdges, leftEdges]
  )

  const startTime = timestamps.length ? new Date(Math.min(...timestamps)) : new Date()
  const endTime = timestamps.length ? new Date(Math.max(...timestamps)) : new Date()
  const formatTime = timeFormatterForRange(startTime, endTime)

  const { uRef, formatterRef } = useLiveAxisFormatter(yAxisTickFormatter)

  const chartOptions = useMemo(() => {
    const highestFilledBin = Math.max(
      -1,
      ...distributions
        .filter((d) => d !== null)
        .map(({ counts }) => R.findLastIndex(counts, (n) => n > 0))
    )

    const xRange: uPlot.Range.MinMax =
      colCount > 0 ? [leftEdges[0], rightEdges[colCount - 1]] : [0, 1]

    return {
      scales: {
        x: { range: xRange },
        y: {
          range: [
            0,
            highestFilledBin === -1 ? binCount : highestFilledBin + 1,
          ] as uPlot.Range.MinMax,
        },
      },
      // include an invisible series just to get uPlot drawing
      series: [{}, { show: false }],
      axes: [
        xTimeAxis({ theme, formatTime }),
        yValueAxis({
          theme,
          label: yAxisLabel,
          grid: { show: false },
          values: (_u, splits) =>
            splits.map((v) => {
              const i = R.clamp(Math.round(v), { min: 0, max: binCount - 1 })
              return formatterRef.current(bins[i])
            }),
        }),
      ],
      cursor: { x: false, y: false, drag: { x: false } },
      legend: { show: false },
      plugins: [{ hooks: { draw: [drawCells] } }, tooltipPlugin],
    } satisfies UPlotOptions
  }, [
    distributions,
    rightEdges,
    leftEdges,
    colCount,
    theme,
    formatTime,
    bins,
    binCount,
    drawCells,
    tooltipPlugin,
    formatterRef,
    yAxisLabel,
  ])

  const data = useMemo<uPlot.AlignedData>(
    () => [rightEdges, Array(colCount).fill(null)],
    [rightEdges, colCount]
  )

  if (binCount === 0 || colCount === 0) {
    return (
      <div
        className="text-secondary flex items-center justify-center"
        style={{ height: CHART_HEIGHT }}
      >
        No distribution data for this time period.
      </div>
    )
  }

  return (
    <FramedChart
      title={title}
      height={CHART_HEIGHT}
      chartOptions={chartOptions}
      data={data}
      uRef={uRef}
      legend={
        sampleCountMetadata.ranks.size > 0 && (
          <HeatmapLegend
            minSampleCount={match(colorScale)
              .with('ranked', () => sampleCountMetadata.minSampleCount)
              .with('linear', () => 0)
              .with('logarithmic', () => 1)
              .exhaustive()}
            maxSampleCount={sampleCountMetadata.maxSampleCount}
            axisText={theme.axisText}
          />
        )
      }
    >
      {hover && (
        <>
          <div
            className="pointer-events-none absolute"
            style={{
              ...hover.cell,
              boxShadow: 'inset 0 0 0 1.5px var(--content-default)',
            }}
          />
          <ChartTooltip
            left={hover.left}
            top={hover.top}
            offset={[hover.leftRight, hover.topBottom]}
            timestamp={timestamps[hover.col]}
            label={
              <>
                {formatterRef.current(bins[hover.row])}
                {bins[hover.row + 1] === undefined
                  ? `+`
                  : `\u2013${formatterRef.current(bins[hover.row + 1])}`}
                {unit && <span className="ml-1">{unit}</span>}
              </>
            }
          >
            {(distributions[hover.col]?.counts[hover.row] ?? 0).toLocaleString()} samples
          </ChartTooltip>
        </>
      )}
    </FramedChart>
  )
}

function HeatmapLegend({
  minSampleCount,
  maxSampleCount,
  axisText,
}: {
  minSampleCount: number
  maxSampleCount: number
  axisText: string
}) {
  return (
    <div className="mt-3 flex items-center gap-2 pl-5">
      {minSampleCount === maxSampleCount ? (
        <div
          className="h-3 w-3 rounded-sm"
          style={{
            backgroundColor: R.last(CSS_VAR_RAMP.stops),
          }}
        ></div>
      ) : (
        <>
          <span className="text-mono-xs" style={{ color: axisText }}>
            {minSampleCount.toLocaleString()}
          </span>
          <div
            className="h-3 w-32 rounded-sm"
            style={{
              backgroundImage: `linear-gradient(in oklch to right, ${CSS_VAR_RAMP.stops.join(', ')})`,
            }}
          ></div>
        </>
      )}
      <span className="text-mono-xs" style={{ color: axisText }}>
        {maxSampleCount.toLocaleString()}
      </span>
    </div>
  )
}

const SAMPLE_VALUES = [1, 5, 10, 50, 95, 100]
const SAMPLE_VALUES_METADATA = getSampleCountMetadata(SAMPLE_VALUES)
const LONGEST_SAMPLE_ITEM = SAMPLE_VALUES.map((n) => n.toLocaleString().length).reduce(
  (acc, length) => Math.max(acc, length),
  0
)

export function SampleColorStrip({ colorScale }: { colorScale: ColorScale }) {
  const scaleCount = getScalingFunction(SAMPLE_VALUES_METADATA, colorScale)

  return (
    <div className="flex items-end gap-px">
      {SAMPLE_VALUES.map((n) => (
        <div
          key={n}
          className="text-secondary text-mono-code flex flex-col items-center text-xs"
        >
          <div className="text-center" style={{ width: `${LONGEST_SAMPLE_ITEM + 0.5}ch` }}>
            {n.toLocaleString()}
          </div>
          <div
            className="h-3 w-full"
            style={{ backgroundColor: rampColor(CSS_VAR_RAMP, scaleCount(n)) }}
          />
        </div>
      ))}
    </div>
  )
}
