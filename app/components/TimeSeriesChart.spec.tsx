/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { render } from '@testing-library/react'
import { useEffect, type ComponentProps } from 'react'
import type UplotReactComponent from 'uplot-react'
import { describe, expect, test, vi } from 'vitest'

import { TimeSeriesChart } from './TimeSeriesChart'

const redraw = vi.fn()

vi.mock('uplot-react', () => {
  const MeplotReactComponent = (props: ComponentProps<typeof UplotReactComponent>) => {
    useEffect(() => {
      props.onCreate?.({ redraw } as never)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return null
  }
  return { default: MeplotReactComponent }
})

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
    data: [[10]],
    timestamps: [0],
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

  test('mounting never triggers an unsafe redraw', () => {
    render(<TimeSeriesChart {...props((v) => `${v}%`)} />)
    expectAllRedrawsSafe()
  })

  test('a new formatter triggers a safe redraw', () => {
    const { rerender } = render(<TimeSeriesChart {...props((v) => `${v}%`)} />)
    redraw.mockClear()
    rerender(<TimeSeriesChart {...props((v) => `${v} pct`)} />)
    expect(redraw).toHaveBeenCalled()
    expectAllRedrawsSafe()
  })
})
