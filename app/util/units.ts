/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { filesize } from 'filesize'

import { round } from './math'

export const KiB = 1024
export const MiB = 1024 * KiB
export const GiB = 1024 * MiB
export const TiB = 1024 * GiB

export const bytesToGiB = (b: number, digits = 2) => round(b / GiB, digits)
export const bytesToTiB = (b: number, digits = 2) => round(b / TiB, digits)

/**
 * Format a byte count for display, e.g. `1.50 KiB`. Always uses base 2 (binary
 * units like KiB, MiB). When `pad` is true, scaled units get trailing zeros
 * (e.g. `1.00 KiB`), but bytes never do — fractional bytes don't make sense.
 */
export function formatBytes(bytes: number, { pad = false }: { pad?: boolean } = {}) {
  // peek at the unit so we can suppress padding for raw bytes
  const { unit } = filesize(bytes, { base: 2, output: 'object' })
  return filesize(bytes, { base: 2, pad: pad && unit !== 'B' })
}
