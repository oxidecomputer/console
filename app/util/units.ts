/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
// formatBytes wraps filesize so the rest of the app gets a consistent API
// eslint-disable-next-line no-restricted-imports
import { filesize } from 'filesize'

import { round } from './math'

export const KiB = 1024
export const MiB = 1024 * KiB
export const GiB = 1024 * MiB
export const TiB = 1024 * GiB

const BINARY_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'] as const
export type BinaryUnit = (typeof BINARY_UNITS)[number]
type BytesInUnitOptions = {
  digits?: number
}
type PickUnitOptions = {
  minUnit?: BinaryUnit
}

/**
 * Pick the binary unit (base 2) filesize would use to display the largest of
 * `values`. Pass a group of related values (e.g. provisioned and quota) so they
 * can be rendered in one shared unit—otherwise picking per value can produce
 * nonsense comparisons like `67 TiB / 70000 GiB`. Use `minUnit` for contexts
 * where smaller units would not make sense.
 */
export function pickUnit(
  values: readonly number[],
  { minUnit = 'B' }: PickUnitOptions = {}
): BinaryUnit {
  const max = Math.max(0, ...values)
  const unit = filesize(max, { base: 2, output: 'object' }).unit as BinaryUnit
  const unitIndex = BINARY_UNITS.indexOf(unit)
  const minUnitIndex = BINARY_UNITS.indexOf(minUnit)
  return BINARY_UNITS[Math.max(unitIndex, minUnitIndex)] ?? minUnit
}

export function bytesInUnit(
  bytes: number,
  unit: BinaryUnit,
  { digits = 2 }: BytesInUnitOptions = {}
): number {
  return round(bytes / 1024 ** BINARY_UNITS.indexOf(unit), digits)
}

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
