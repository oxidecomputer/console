/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import md5 from 'md5'
import { useMemo } from 'react'

type Rectangle = { x: number; y: number; isOn: boolean }

const getPixels = (s: string) => {
  const hash = md5(s)
  const buffer: Rectangle[] = []

  for (let i = 0; i < 18; i++) {
    const isOn = hash.charCodeAt(i) % 2 === 0

    if (i < 3) {
      // Start with the two central columns
      buffer.push({ x: 2, y: i, isOn })
      buffer.push({ x: 3, y: i, isOn })
    } else if (i < 6) {
      // Move out to the columns one from the edge
      buffer.push({ x: 1, y: i - 3, isOn })
      buffer.push({ x: 4, y: i - 3, isOn })
    } else if (i < 9) {
      // Fill the outside columns
      buffer.push({ x: 0, y: i - 6, isOn })
      buffer.push({ x: 5, y: i - 6, isOn })
    }
  }

  return buffer
}

type IdenticonProps = {
  /** string used to generate the graphic */
  name: string
  className?: string
}

export function Identicon({ name, className }: IdenticonProps) {
  const pixels = useMemo(() => getPixels(name), [name])
  return (
    <div className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28">
        <g fill="currentColor">
          {pixels.map((pixel) => {
            if (!pixel.isOn) return null
            const x = pixel.x * 3 + 2 * pixel.x
            const y = pixel.y * 8 + 2 * pixel.y
            return <rect key={`${x}|${y}`} x={x} y={y} width="3" height="8" />
          })}
        </g>
      </svg>
    </div>
  )
}
