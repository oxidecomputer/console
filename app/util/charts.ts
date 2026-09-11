/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import * as R from 'remeda'
import type uPlot from 'uplot'

import { subscribeToTheme } from '~/stores/theme'

/**
 * Shared plumbing for our uPlot-based charts (`TimeSeriesChart`, `Heatmap`).
 */

/**
 * Check if the start and end time are on the same day. If they are we can omit
 * the day/month in the date time format.
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
/** Pick the x-axis time formatter based on whether the window spans a day. */
export const timeFormatterForRange = (startTime: Date, endTime: Date) =>
  isSameDay(startTime, endTime) ? shortTime : shortDateTime

export const remToPx = (rem: number) =>
  rem * parseFloat(getComputedStyle(document.documentElement).fontSize)

// We measure axis label widths on a detached canvas instead of uPlot's to avoid
// overwriting its own font setting. Created lazily so importing this module
// doesn't require a DOM.
let measureCtx: CanvasRenderingContext2D | null = null
export const measureTextWidth = (text: string, font: string) => {
  measureCtx ??= document.createElement('canvas').getContext('2d')
  // getContext('2d') is only null if '2d' is unsupported, which, hey, you're not getting a graph
  if (!measureCtx) return 0
  measureCtx.font = font
  return measureCtx.measureText(text).width
}

export const AXIS_FONT_REM_XS = 0.6875
export const AXIS_TICK_LENGTH = 6
export const AXIS_TICK_GAP = 8

export type ChartTheme = {
  fontFamily: string
  stroke: string
  hoverPoint: string
  fill: string
  axisLine: string
  axisText: string
  lineColors: string[]
}

// Append an alpha channel to a resolved color, e.g. `oklch(l c h)` -> `oklch(l c h / 0.6)`. Assumes
// our colors are set in oklch!
export const withAlpha = (color: string, alpha: number) =>
  color.replace(/\)\s*$/, ` / ${alpha})`)

// uPlot draws to a canvas, so it can't consume CSS custom properties directly. We subscribe to the
// theme instead.
export function getChartTheme(): ChartTheme {
  const style = getComputedStyle(document.body)
  const v = (name: string) => style.getPropertyValue(name)
  return {
    fontFamily: v('--font-mono'),
    stroke: v('--stroke-accent-secondary'),
    hoverPoint: v('--content-accent'),
    fill: withAlpha(v('--surface-accent-secondary'), 0.6),
    axisLine: v('--stroke-secondary'),
    axisText: v('--content-quaternary'),
    lineColors: [
      '--color-green-800',
      '--color-blue-800',
      '--color-purple-800',
      '--color-yellow-800',
      '--color-red-800',
    ].map(v),
  }
}

export const seriesColor = (i: number, theme: ChartTheme): string =>
  theme.lineColors[i] ||
  `oklch(0.77 0.175 ${((163.7 + (i - theme.lineColors.length) * 137.508) % 360).toFixed(1)})`

export function useChartTheme(): ChartTheme {
  const [colors, setColors] = useState(getChartTheme)
  useEffect(() => subscribeToTheme(() => setColors(getChartTheme())), [])
  return colors
}

/** The monospace axis font at our standard axis size, plus its pixel size. */
export function chartAxisFont(theme: ChartTheme): { fontPx: number; axisFont: string } {
  const fontPx = remToPx(AXIS_FONT_REM_XS)
  return { fontPx, axisFont: `${fontPx}px ${theme.fontFamily}` }
}

/**
 * Keeps a chart's y-axis labels in sync with a `yAxisTickFormatter` whose
 * identity may change across renders. Returns two refs:
 *
 * - `formatterRef`: `.current` points to the yAxisTickFormatter so you can
 *   reference it without it being a memo dependency.
 * - `uRef`: assign in `<UplotReact onCreate>`. Needed to call for axis
 *   recalculation.
 */
export function useLiveAxisFormatter(yAxisTickFormatter: (val: number) => string) {
  const uRef = useRef<uPlot | null>(null)
  const formatterRef = useRef(yAxisTickFormatter)
  formatterRef.current = yAxisTickFormatter
  useEffect(() => {
    // Setting the `rebuildPaths` argument to true causes uPlot to reapply the
    // _current_ x bounds, which in the right conditions (e.g., initial render)
    // can leave the chart blank. We only need the axes recalculated anyways!
    //
    // See https://github.com/leeoniya/uPlot/issues/1099
    uRef.current?.redraw(
      false, // rebuildPaths
      true // recalcAxes
    )
  }, [yAxisTickFormatter])
  return { uRef, formatterRef }
}

/**
 * The bottom time axis, shared so every chart gets the same uPlot tick
 * calculation, formatting, and styling.
 */
export function xTimeAxis({
  theme,
  formatTime,
}: {
  theme: ChartTheme
  formatTime: (ts: number) => string
}): uPlot.Axis {
  const { fontPx, axisFont } = chartAxisFont(theme)
  return {
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
  }
}

/**
 * The right value axis, shared so every chart gets the same uPlot tick
 * calculation, formatting, and styling.
 */
export function yValueAxis({
  theme,
  grid,
  values,
}: {
  theme: ChartTheme
  grid: uPlot.Axis.Grid
  values: uPlot.Axis.Values
}): uPlot.Axis {
  const { axisFont } = chartAxisFont(theme)
  return {
    stroke: theme.axisText,
    font: axisFont,
    side: 1,
    border: { show: true, stroke: theme.axisLine, width: 1 },
    gap: AXIS_TICK_GAP,
    grid,
    size: (_self, values) => {
      const axisBase = AXIS_TICK_LENGTH + AXIS_TICK_GAP
      // given the monospace font, longest by char count is longest by rendered width
      const longestVal = R.firstBy(values ?? [], (s) => -s.length) || ''
      return axisBase + measureTextWidth(longestVal, axisFont)
    },
    ticks: {
      show: true,
      stroke: theme.axisLine,
      width: 1,
      size: AXIS_TICK_LENGTH,
      filter: (_u, yValues) => yValues.map((v) => (v === 0 ? null : v)),
    },
    values,
  }
}
