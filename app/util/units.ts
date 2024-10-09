/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'

import { round } from './math'

// We only need to support up to TiB for now, but we can add more if needed
export type BinaryUnit = 'B' | 'KiB' | 'MiB' | 'GiB' | 'TiB' // | 'PiB' | 'EiB' | 'ZiB' | 'YiB'

export const KiB = 1024
export const MiB = 1024 * KiB
export const GiB = 1024 * MiB
export const TiB = 1024 * GiB

export const bytesToKiB = (b: number, digits = 2) => round(b / KiB, digits)
export const bytesToMiB = (b: number, digits = 2) => round(b / MiB, digits)
export const bytesToGiB = (b: number, digits = 2) => round(b / GiB, digits)
export const bytesToTiB = (b: number, digits = 2) => round(b / TiB, digits)

type BytesToReadableNumber = { number: number; unit: BinaryUnit }
/** Takes a raw byte count and determines the appropriate unit to use in formatting it */
export const bytesToReadableNumber = (b: number, digits = 2): BytesToReadableNumber => {
  if (b < 1024) {
    return { number: round(b, digits), unit: 'B' }
  }
  // 1024^2 = 1,048,576
  if (b < 1048576) {
    return { number: bytesToKiB(b, digits), unit: 'KiB' }
  }
  // 1024^3 = 1,073,741,824
  if (b < 1073741824) {
    return { number: bytesToMiB(b, digits), unit: 'MiB' }
  }
  // 1024^4 = 1,099,511,627,776
  if (b < 1099511627776) {
    return { number: bytesToGiB(b, digits), unit: 'GiB' }
  }
  return { number: bytesToTiB(b, digits), unit: 'TiB' }
}

// Used when we have multiple related numbers that might normally round to different units.
// Once the proper "unified" unit base is established, all numbers can be converted to a specific unit.
export const useConvertBytesToSpecificUnit = (
  bytes: number,
  unit: BinaryUnit,
  digits = 2
): number =>
  useMemo(
    () =>
      ({
        B: round(bytes, digits),
        KiB: bytesToKiB(bytes, digits),
        MiB: bytesToMiB(bytes, digits),
        GiB: bytesToGiB(bytes, digits),
        TiB: bytesToTiB(bytes, digits),
      })[unit],
    [bytes, digits, unit]
  )

export const useGetUnit = (n1: number, n2: number): BinaryUnit =>
  useMemo(() => bytesToReadableNumber(Math.max(n1, n2)).unit, [n1, n2])
