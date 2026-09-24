/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type uPlot from 'uplot'
import { describe, expect, test, vi, type MockInstance } from 'vitest'
import { render } from 'vitest-browser-react'

import { TimeSeriesChart } from './TimeSeriesChart'

const defaultData = [
  { timestamp: 0, value: 10 },
  { timestamp: 1000, value: 20 },
]

const props = (yAxisTickFormatter: (v: number) => string, data = defaultData) => ({
  data,
  title: 'CPU',
  startTime: new Date(0),
  endTime: new Date(3_600_000),
  yAxisTickFormatter,
  loading: false,
})

type Spies = {
  redraw: MockInstance<uPlot['redraw']>
  setData: MockInstance<uPlot['setData']>
}

/**
 * Render the chart and wait for the uPlot instance to be created. The chart
 * mounts a beat after render: it waits for a real container size measurement
 * to arrive through ResizeObserver.
 */
async function renderChart(formatter: (v: number) => string) {
  let spies: Spies | undefined
  const onCreate = (u: uPlot) => {
    spies = { redraw: vi.spyOn(u, 'redraw'), setData: vi.spyOn(u, 'setData') }
  }
  const { rerender } = await render(
    <TimeSeriesChart {...props(formatter)} onCreate={onCreate} />
  )
  await vi.waitFor(() => expect(spies).toBeDefined())
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { rerender, onCreate, ...spies! } // waitFor above guarantees spies is set
}

describe('safe redrawing', () => {
  /*
   * TimeSeriesChart uses uPlot's `redraw` method to repaint when `yAxisTickFormatter` changes. This
   * is perfectly fine as long as it's called "the right way". Calling redraw "the wrong way" can
   * cause uPlot to get stuck with bad settings; in this case, that would be an x range of `null` to
   * `null`. That leaves the series basically unplottable, and the visible effect is a blank chart.
   *
   * This is only visible in production builds because StrictMode incidentally forces a re-create
   * AFTER the issue, hiding it, but these tests are fine either way, because they simply prohibit
   * "wrong" calls to redraw.
   */
  const expectAllRedrawsSafe = (redraw: Spies['redraw']) => {
    for (const [rebuildPaths, recalcAxes] of redraw.mock.calls) {
      expect(rebuildPaths).toBe(false) // the important part
      expect(recalcAxes).toBe(true)
    }
  }

  test('mounting never triggers an unsafe redraw', async () => {
    const { redraw } = await renderChart((v) => `${v}%`)
    expectAllRedrawsSafe(redraw)
  })

  test('a new formatter triggers a safe redraw', async () => {
    const { rerender, onCreate, redraw } = await renderChart((v) => `${v}%`)
    redraw.mockClear()
    await rerender(<TimeSeriesChart {...props((v) => `${v} pct`)} onCreate={onCreate} />)
    expect(redraw).toHaveBeenCalled()
    expectAllRedrawsSafe(redraw)
  })
})

test('rerenders only call setData when the data actually changes', async () => {
  const { rerender, onCreate, setData } = await renderChart((v) => `${v}%`)
  setData.mockClear()

  // same data reference, new formatter: nothing for uPlot to update
  await rerender(<TimeSeriesChart {...props((v) => `${v} pct`)} onCreate={onCreate} />)
  // new reference with equal contents: uplot-react's deep compare skips the update
  await rerender(
    <TimeSeriesChart {...props((v) => `${v}%`, [...defaultData])} onCreate={onCreate} />
  )
  expect(setData).not.toHaveBeenCalled()

  const newData = [...defaultData, { timestamp: 2000, value: 30 }]
  await rerender(
    <TimeSeriesChart {...props((v) => `${v}%`, newData)} onCreate={onCreate} />
  )
  expect(setData).toHaveBeenCalledTimes(1)
})
