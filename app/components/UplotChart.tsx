/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { AlignedData, Options } from 'uplot'
import UplotReact from 'uplot-react'

import type { ChartDatum } from '@oxide/api'

// uPlot draws to canvas, so it needs concrete CSS colors, not var(...) refs.
function readColors() {
  const styles = getComputedStyle(document.documentElement)
  const probe = (name: string) => styles.getPropertyValue(name).trim() || '#888'
  return {
    grid: probe('--stroke-secondary'),
    axis: probe('--content-quaternary'),
    stroke: probe('--content-accent-tertiary'),
  }
}

/**
 * Merge N ChartDatum[] into uPlot's columnar `AlignedData` shape:
 *   [timestampsInSeconds, ys1, ys2, ...]
 * Timestamps are converted from ms → s (uPlot's default time scale unit).
 */
function toAlignedData(series: readonly ChartDatum[][]): AlignedData {
  // Fast path: if all series share the same timestamp array (by reference or
  // by first/last timestamp + length), skip the merge.
  const first = series[0]
  const sameShape =
    first &&
    series.every(
      (s) =>
        s.length === first.length &&
        (s === first ||
          (s[0]?.timestamp === first[0]?.timestamp &&
            s[s.length - 1]?.timestamp === first[first.length - 1]?.timestamp))
    )

  if (sameShape) {
    const xs = new Float64Array(first.length)
    for (let i = 0; i < first.length; i++) xs[i] = first[i].timestamp / 1000
    const ys = series.map((s) => s.map((d) => d.value))
    return [xs, ...ys]
  }

  const timestampSet = new Set<number>()
  for (const s of series) for (const d of s) timestampSet.add(d.timestamp)
  const sortedTs = [...timestampSet].sort((a, b) => a - b)
  const xs = new Float64Array(sortedTs.length)
  for (let i = 0; i < sortedTs.length; i++) xs[i] = sortedTs[i] / 1000

  const ys = series.map((s) => {
    const map = new Map<number, number | null>()
    for (const d of s) map.set(d.timestamp, d.value)
    return sortedTs.map((t) => {
      const v = map.get(t)
      return v === undefined ? null : v
    })
  })

  return [xs, ...ys]
}

function buildOptions({
  width,
  height,
  seriesCount,
  title,
  yAxisTickFormatter,
  colors,
}: {
  width: number
  height: number
  seriesCount: number
  title: string
  yAxisTickFormatter?: (val: number) => string
  colors: ReturnType<typeof readColors>
}): Options {
  return {
    width,
    height,
    title: undefined,
    cursor: { drag: { x: false, y: false }, points: { size: 6 } },
    legend: { show: true, live: true },
    scales: { x: { time: true } },
    axes: [
      {
        stroke: colors.axis,
        grid: { show: false, stroke: colors.grid, width: 1 },
        ticks: { stroke: colors.grid, size: 6 },
        font: '11px "GT America Mono", monospace',
        gap: 8,
      },
      {
        side: 1,
        stroke: colors.axis,
        grid: { show: true, stroke: colors.grid, width: 1 },
        ticks: { stroke: colors.grid, size: 6 },
        font: '11px "GT America Mono", monospace',
        gap: 8,
        values: yAxisTickFormatter
          ? (_u, splits) => splits.map(yAxisTickFormatter)
          : undefined,
      },
    ],
    series: [
      {},
      ...Array.from({ length: seriesCount }, (_, i) => ({
        label: seriesCount === 1 ? title : `${title} #${i + 1}`,
        stroke: colors.stroke,
        width: 1.5,
        // Series often don't share timestamps, so aligned data is mostly nulls
        // per series. Connect across gaps so we see lines rather than dots.
        spanGaps: true,
        points: { show: false },
      })),
    ],
  }
}

type UplotChartProps = {
  data: readonly ChartDatum[][]
  title: string
  height?: number
  yAxisTickFormatter?: (val: number) => string
}

export function UplotChart({
  data,
  title,
  height = 300,
  yAxisTickFormatter,
}: UplotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (containerRef.current) setWidth(containerRef.current.clientWidth)
  }, [])

  const aligned = useMemo(() => toAlignedData(data), [data])

  const options = useMemo(() => {
    if (width === null) return null
    return buildOptions({
      width,
      height,
      seriesCount: data.length,
      title,
      yAxisTickFormatter,
      colors: readColors(),
    })
  }, [width, height, data.length, title, yAxisTickFormatter])

  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      {options && <UplotReact options={options} data={aligned} />}
    </div>
  )
}
