/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo, type ReactNode, type RefObject } from 'react'
import type uPlot from 'uplot'
import UplotReact from 'uplot-react'

import { useElementSize } from '~/hooks/use-element-size'

// The intended left padding (px-5) is taken from the container and given to
// uPlot instead, so the plot sits flush left while x-tick labels can bleed into
// the gutter without clipping.
const CHART_LEFT_PAD = 20

export type UPlotOptions = Omit<uPlot.Options, 'width' | 'height' | 'padding'>

type Props = {
  title: string
  height: number
  chartOptions: UPlotOptions
  data: uPlot.AlignedData
  uRef: RefObject<uPlot | null>
  children?: ReactNode
  legend?: ReactNode
}

export function FramedChart({
  title,
  height,
  chartOptions,
  data,
  uRef,
  children,
  legend,
}: Props) {
  const [size, sizeRef] = useElementSize()

  // Width/height changes cause a cheaper "update" path for uplot, instead of
  // "create", so it gets its own layer of memoization
  const options = useMemo(
    () =>
      ({
        ...chartOptions,
        padding: [null, null, null, CHART_LEFT_PAD],
        width: size?.width ?? 0,
        height,
      }) satisfies uPlot.Options,
    [chartOptions, size?.width, height]
  )

  return (
    <figure
      aria-label={title}
      className="m-0 pt-8 pb-5 pl-0"
      style={{ paddingRight: CHART_LEFT_PAD }}
    >
      {/* The actual chart is absolutely positioned so its fixed pixel width
          doesn't influence layout and block future resizing. That in turn makes
          its container need an explicit height */}
      <div ref={sizeRef} className="relative" style={{ height }}>
        {size && (
          <UplotReact
            className="absolute top-0 left-0"
            options={options}
            data={data}
            onCreate={(u) => (uRef.current = u)}
          />
        )}
        {children}
      </div>
      {legend}
    </figure>
  )
}
