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

export type FormattedBytes = {
  /** Numeric portion of the formatted byte count, e.g. `1.5`. */
  value: string
  /** Binary unit label, e.g. `KiB`. */
  unit: string
  /** Full display string combining `value` and `unit`, e.g. `1.5 KiB`. */
  label: string
}

type FormatBytesOptions = {
  /** Pad scaled units to two decimal places, e.g. `1.00 KiB`. Bytes are never padded. */
  pad?: boolean
}

/**
 * Format a byte count for display, e.g. `1.5 KiB`. Always uses base 2 (binary
 * units like KiB, MiB). Bytes are never padded because fractional bytes don't
 * make sense, even when `pad` is true.
 */
export function formatBytes(
  bytes: number,
  { pad = false }: FormatBytesOptions = {}
): FormattedBytes {
  const { value, unit } = filesize(bytes, { base: 2, output: 'object' })
  const formattedValue = pad && unit !== 'B' ? Number(value).toFixed(2) : String(value)

  return {
    value: formattedValue,
    unit,
    label: `${formattedValue} ${unit}`,
  }
}
