/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo, useState } from 'react'
import * as R from 'remeda'
import type uPlot from 'uplot'

import { ChartTooltip, type TopBottom, type LeftRight } from '~/components/ChartTooltip'
import { type UPlotOptions, FramedChart } from '~/components/FramedChart'
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

// Interpolates the color between the two closest stops, for 0 <= t <= 1.
const rampColor = ({ stops }: ColorRamp, t: number): string => {
  const clamped = R.clamp(t, { min: 0, max: 1 })
  const lastIndex = stops.length - 1
  const progress = clamped * lastIndex
  const start = R.clamp(Math.floor(progress), { max: lastIndex - 1 })
  const lerp = progress - start
  const from = stops[start]
  const to = stops[start + 1]
  return `color-mix(in oklch, ${from} ${(1 - lerp) * 100}%, ${to})`
}

const getColorRamp = (): ColorRamp => {
  const style = getComputedStyle(document.body)
  const v = (name: string) => style.getPropertyValue(name).trim()
  const stops = [
    // TODO: looks nice in dark and decent in light. maybe we want a different
    // palette but it's a fine start
    v('--surface-raise'),
    v('--content-accent'),
  ].filter((x) => x !== '')
  return {
    stops:
      stops.length >= 2
        ? stops
        : // for the unlikely case the theme colors don't parse into oklch
          ['oklch(0.195, 0.009, 260)', 'oklch(0.77, 0.1919, 163.7)'],
  }
}

// count -> ramp position. Doing a square root or a log makes for some different
// smoothing. Nothing is truly intuitive, but linearly showing the fraction is
// most easily compared to the legend at the bottom
const rampT = (count: number, maxCount: number) => {
  const fraction = count / maxCount
  // TODO: pick!
  return fraction
  // return Math.log10(lerp(1, 10, fraction))
  // return Math.sqrt(fraction)
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
}

const defaultYAxisTickFormatter = (val: number) => val.toLocaleString()

export function Heatmap({
  title,
  timestamps,
  startTimes,
  distributions,
  yAxisTickFormatter = defaultYAxisTickFormatter,
  unit,
}: HeatmapProps) {
  const theme = useChartTheme()
  const colorRamp = useMemo(getColorRamp, [theme])
  const [hover, setHover] = useState<Hover | null>(null)

  // All distributions in a timeseries share the same bucket definition, so we
  // take the bins from the first present sample as the y-axis.
  const bins = useMemo(
    () => distributions.find((d) => d !== null)?.bins ?? [],
    [distributions]
  )
  const binCount = bins.length
  const colCount = distributions.length

  const maxSampleCount = useMemo(
    () => distributions.reduce((max, d) => (d ? Math.max(max, ...d.counts) : max), 0),
    [distributions]
  )

  // uPlot's time scale wants seconds; metrics timestamps are milliseconds
  const rightEdges = useMemo(() => timestamps.map((t) => t / 1000), [timestamps])
  const leftEdges = useMemo(() => startTimes.map((t) => t / 1000), [startTimes])

  // uPlot doesn't actually have heatmap support, but we can use its position
  // functions to make this (somewhat) easy
  const drawCells = useMemo(
    () => (u: uPlot) => {
      if (binCount === 0 || colCount === 0) return
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
          ctx.fillStyle = rampColor(colorRamp, rampT(count, maxSampleCount))
          ctx.fillRect(
            leftEdge - CELL_OVERFLOW,
            topEdge - CELL_OVERFLOW,
            rightEdge - leftEdge + CELL_OVERFLOW,
            bottomEdge - topEdge + CELL_OVERFLOW
          )
        })
      })
      ctx.restore()
    },
    [distributions, leftEdges, rightEdges, colCount, binCount, maxSampleCount, colorRamp]
  )

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
        <HeatmapLegend
          ramp={colorRamp}
          maxSampleCount={maxSampleCount}
          axisText={theme.axisText}
        />
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
          >
            <div className="text-secondary">
              {formatterRef.current(bins[hover.row])}
              {bins[hover.row + 1] === undefined
                ? `+`
                : `\u2013${formatterRef.current(bins[hover.row + 1])}`}
              {unit && <span className="text-secondary ml-1">{unit}</span>}
            </div>
            <div className="text-raise">
              {(distributions[hover.col]?.counts[hover.row] ?? 0).toLocaleString()} samples
            </div>
          </ChartTooltip>
        </>
      )}
    </FramedChart>
  )
}

function HeatmapLegend({
  ramp,
  maxSampleCount,
  axisText,
}: {
  ramp: ColorRamp
  maxSampleCount: number
  axisText: string
}) {
  const backgroundImage = `linear-gradient(in oklch to right, ${ramp.stops.join(', ')})`
  return (
    <div className="mt-3 flex items-center gap-2 pl-5">
      <span className="text-mono-xs" style={{ color: axisText }}>
        0
      </span>
      <div className="h-3 w-32 rounded-sm" style={{ backgroundImage }}></div>
      <span className="text-mono-xs" style={{ color: axisText }}>
        {maxSampleCount.toLocaleString()}
      </span>
    </div>
  )
}
