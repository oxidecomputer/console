/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { round } from './math'

// We only need to support up to TiB for now, but we can add more if needed
export type BinaryUnit = 'KiB' | 'MiB' | 'GiB' | 'TiB' // | 'PiB' | 'EiB' | 'ZiB' | 'YiB'

export const KiB = 1024
export const MiB = 1024 * KiB
export const GiB = 1024 * MiB
export const TiB = 1024 * GiB

export const bytesToKiB = (b: number, digits = 2) => round(b / KiB, digits)
export const bytesToMiB = (b: number, digits = 2) => round(b / MiB, digits)
export const bytesToGiB = (b: number, digits = 2) => round(b / GiB, digits)
export const bytesToTiB = (b: number, digits = 2) => round(b / TiB, digits)

type FormattedBytes = { number: number; unit: BinaryUnit }

const unitSize: Record<BinaryUnit, number> = { KiB, MiB, GiB, TiB }

export function getUnit(b: number): BinaryUnit {
  if (b < MiB) return 'KiB'
  if (b < GiB) return 'MiB'
  if (b < TiB) return 'GiB'
  return 'TiB'
}

/** Takes a raw byte count and determines the appropriate unit to use in formatting it */
export const formatBytes = (b: number, digits = 2): FormattedBytes => {
  const unit = getUnit(b)
  return { number: formatBytesAs(b, unit, digits), unit }
}

// Used when we have multiple related numbers that might normally round to different units.
// Once the proper "unified" unit base is established, all numbers can be converted to a specific unit.
export const formatBytesAs = (bytes: number, unit: BinaryUnit, digits = 2): number =>
  round(bytes / unitSize[unit], digits)
