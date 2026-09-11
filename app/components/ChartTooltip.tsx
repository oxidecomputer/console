/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { format } from 'date-fns'
import type { ReactNode } from 'react'
import { match } from 'ts-pattern'

const longDateTime = (ts: number) => format(new Date(ts), 'MMM d, yyyy HH:mm:ss zz')

type ChartTooltipProps = {
  timestamp: number
  left: number
  top: number
  offset: [LeftRight, TopBottom]
  children: ReactNode
}

/** Offset the box into the quadrant away from the point so it never overflows an edge */
export type LeftRight = 'left' | 'right'
export type TopBottom = 'top' | 'bottom'

const TOOLTIP_GAP = 12
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

export function ChartTooltip({
  timestamp,
  left,
  top,
  offset,
  children,
}: ChartTooltipProps) {
  return (
    <div
      className="pointer-events-none absolute z-10 w-max"
      style={{
        left: left,
        top: top,
        transform: tooltipTransform(...offset),
      }}
    >
      <div
        role="tooltip"
        className="text-sans-md text-secondary bg-raise shadow-tooltip rounded-md outline-0"
      >
        <div className="border-secondary border-b px-3 py-2 pr-6">
          {longDateTime(timestamp)}
        </div>
        <div className="px-3 py-2">{children}</div>
      </div>
    </div>
  )
}
