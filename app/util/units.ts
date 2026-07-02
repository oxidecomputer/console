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

type BytesWithUnit = {
  bytes: number
  unit: BinaryUnit
} & { readonly brand: unique symbol }

function bytesFromNumber(bytes: number, unit?: BinaryUnit): BytesWithUnit {
  return {
    bytes,
    unit: unit || (filesize(bytes, { base: 2, output: 'object' }).unit as BinaryUnit),
  } as BytesWithUnit
}

/**
 * Pick the binary unit (base 2) filesize would use to display the largest of
 * `values`. Pass a group of related values (e.g. provisioned and quota) so they
 * can be rendered in one shared unit—otherwise picking per value can produce
 * nonsense comparisons like `67 TiB / 70000 GiB`. Use `minUnit` for contexts
 * where smaller units would not make sense.
 */
export function bytesFromNumbers(
  byteList: readonly number[],
  { minUnit = 'B' }: PickUnitOptions = {}
): BytesWithUnit[] {
  const max = Math.max(0, ...byteList)
  const preferredUnit = filesize(max, { base: 2, output: 'object' }).unit as BinaryUnit
  const unitIndex = BINARY_UNITS.indexOf(preferredUnit)
  const minUnitIndex = BINARY_UNITS.indexOf(minUnit)
  const unit = BINARY_UNITS[Math.max(unitIndex, minUnitIndex)] ?? minUnit
  return byteList.map((n) => bytesFromNumber(n, unit))
}

export function bytesInUnit(
  bytes: number,
  unit: BinaryUnit,
  { digits = 2 }: BytesInUnitOptions = {}
): number {
  return round(bytes / 1024 ** BINARY_UNITS.indexOf(unit), digits)
}

type FormatBytesOptions = {
  /** Pad scaled units to two decimal places, e.g. `1.00 KiB`. Bytes are never padded. */
  pad?: boolean
}

export type FormattedBytes = {
  value: string
  unit: string
}

export type FormattedNumberBytes = {
  value: number
  unit: string
}

/**
 * Prep a byte count for display, e.g. `{ value: "1.5", unit: "KiB" }`. Always
 * uses base 2 (binary units like KiB, MiB). Bytes are never padded because
 * fractional bytes don't make sense, even when `pad` is true.
 */
export function formatBytes(
  amount: number | BytesWithUnit,
  { pad = false }: FormatBytesOptions = {}
): FormattedBytes {
  const { bytes, unit } = typeof amount === 'number' ? bytesFromNumber(amount) : amount
  const { value, unit: outUnit } = filesize(bytes, {
    base: 2,
    output: 'object',
    pad: pad && unit !== 'B',
    exponent: unit ? BINARY_UNITS.indexOf(unit) : -1,
  })

  // filesize returns a number when not padded
  return { value: String(value), unit: outUnit }
}

/**
 * Prep a byte count for display, e.g. `{ value: 1.5, unit: "KiB" }`. Always
 * uses base 2 (binary units like KiB, MiB). This variant can promise to return
 * a number by forbidding padding.
 */
export function formatBytesAsNumber({ bytes, unit }: BytesWithUnit): FormattedNumberBytes {
  const { value, unit: outUnit } = filesize(bytes, {
    base: 2,
    output: 'object',
    pad: false,
    exponent: unit ? BINARY_UNITS.indexOf(unit) : -1,
  })

  // filesize types claim value is a string, but it's actually a number when unpadded
  return { value: Number(value), unit: outUnit }
}

/**
 * Make a simple string from a byte count, e.g. `1.5 KiB`.
 */
export function byteLabel(bytes: number, opts?: FormatBytesOptions) {
  const obj = formatBytes(bytesFromNumber(bytes), opts)
  return `${obj.value} ${obj.unit}`
}
