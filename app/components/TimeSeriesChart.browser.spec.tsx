/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, type ComponentProps } from 'react'
import UplotReactComponent from 'uplot-react'
import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { TimeSeriesChart } from './TimeSeriesChart'

const redraw = vi.fn()

const dataPropsPassed: unknown[] = []

// mock a fixed container size so the chart mounts immediately and
// deterministically instead of waiting on real layout measurement
vi.mock('~/hooks/use-element-size', () => ({
  useElementSize: () => [{ width: 600, height: 300 }, () => {}],
}))

// a factory mock doesn't survive Vite's CJS optimization of uplot-react in
// browser mode (React receives the module object instead of the component),
// so spy on the real module and swap the implementation
vi.mock('uplot-react', { spy: true })

const MockUplotReact = (props: ComponentProps<typeof UplotReactComponent>) => {
  dataPropsPassed.push(props.data)
  useEffect(() => {
    props.onCreate?.({ redraw } as never)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
vi.mocked(UplotReactComponent).mockImplementation(MockUplotReact)

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
  const props = (formatter: (v: number) => string) => ({
    data: [{ timestamp: 0, value: 10 }],
    title: 'CPU',
    startTime: new Date(0),
    endTime: new Date(3_600_000),
    yAxisTickFormatter: formatter,
    loading: false,
  })

  const expectAllRedrawsSafe = () => {
    for (const [rebuildPaths, recalcAxes] of redraw.mock.calls) {
      expect(rebuildPaths).toBe(false) // the important part
      expect(recalcAxes).toBe(true)
    }
  }

  test('mounting never triggers an unsafe redraw', async () => {
    await render(<TimeSeriesChart {...props((v) => `${v}%`)} />)
    expectAllRedrawsSafe()
  })

  test('a new formatter triggers a safe redraw', async () => {
    const { rerender } = await render(<TimeSeriesChart {...props((v) => `${v}%`)} />)
    redraw.mockClear()
    await rerender(<TimeSeriesChart {...props((v) => `${v} pct`)} />)
    expect(redraw).toHaveBeenCalled()
    expectAllRedrawsSafe()
  })

  // uplot-react will do a deep comparison if the data reference changes to avoid rebuilding the
  // chart, but it would be even better to skip that comparison by maintaining a reference
  test('an unchanged data prop sends a stable reference down to uplot-react', async () => {
    const data = [
      { timestamp: 0, value: 10 },
      { timestamp: 1000, value: 20 },
    ]

    dataPropsPassed.length = 0
    const { rerender } = await render(
      <TimeSeriesChart {...props((v) => `${v}%`)} data={data} />
    )
    await rerender(<TimeSeriesChart {...props((v) => `${v} pct`)} data={data} />)

    expect(dataPropsPassed.length).toBeGreaterThan(1) // it re-rendered
    expect(new Set(dataPropsPassed).size).toBe(1) // but every render passed the identical reference

    await rerender(<TimeSeriesChart {...props((v) => `${v}%`)} data={[...data]} />)
    expect(new Set(dataPropsPassed).size).toBe(2) // unless the reference changes
  })
})
