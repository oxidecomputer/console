/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { splitOnceBy } from './array'

/**
 * Get the two parts of a number (before decimal and after-and-including
 * decimal) as strings. Round to 2 decimal points if necessary.
 *
 * If there is no decimal, we will only have whole parts (which can include
 * minus sign, group separators [comma in en-US], and of course actual number
 * groups). Those will get joined and the decimal part will be the empty string.
 */
export function splitDecimal(value: number | bigint): [string, string] {
  if (typeof value === 'bigint') return [value.toLocaleString(), '']

  const nf = Intl.NumberFormat(navigator.language, { maximumFractionDigits: 2 })
  const parts = nf.formatToParts(value)

  const [wholeParts, decimalParts] = splitOnceBy(parts, (p) => p.type === 'decimal')

  return [
    wholeParts.map((p) => p.value).join(''),
    decimalParts.map((p) => p.value).join(''),
  ]
}

/**
 * Get slightly clever to handle both number and bigint and make sure the result
 * is a number.
 */
export function percentage<T extends number | bigint>(top: T, bottom: T): number {
  if (typeof top === 'number') return (top * 100) / bottom

  // With bigints, dividing the operands and multiplying by 100 will only give
  // a bigint, and we want some decimal precision, so we do the division with
  // an extra 100x in there, then convert to number, then divide by 100. Note
  // that this assumes the argument to Number is small enough to convert to
  // Number. This should almost certainly true -- it would be bizarre for top to
  // be like 10^20 bigger than bottom. In any case, the nice thing is it seems
  // JS runtimes will not overflow when Number is given a huge arg, they just
  // convert to a huge number with reduced precision.
  return Number(((top as bigint) * 10_000n) / (bottom as bigint)) / 100
}

export function round(num: number, digits: number) {
  // unlike with splitDecimal, we hard-code en-US to ensure that Number() will
  // be able to parse the result
  const nf = Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    // very important, otherwise turning back into number will fail on n >= 1000
    // due to commas
    useGrouping: false,
  })
  return Number(nf.format(num))
}

// a separate function because I wanted to test it with a bunch of locales
// to make sure the toLowerCase thing is ok
export const toEngNotation = (num: number | bigint, locale = navigator.language) =>
  Intl.NumberFormat(locale, { notation: 'engineering', maximumFractionDigits: 1 })
    .format(num)
    .toLowerCase()

/**
 * Abbreviates big numbers, first in compact mode like 10.2M, then in eng
 * notation above 10^15. Used internally by BigNum, which you should generally
 * use instead for display as it includes a tooltip with the full value.
 *
 * Boolean represents whether the number was abbreviated.
 */
export function displayBigNum(num: bigint | number): [string, boolean] {
  const compact = Intl.NumberFormat(navigator.language, {
    notation: 'compact',
    maximumFractionDigits: 1,
  })

  const abbreviated = num >= 1_000_000

  const result = abbreviated
    ? num < 1e15 // this the threshold where compact stops using nice letters. see tests
      ? compact.format(num)
      : toEngNotation(num)
    : num.toLocaleString()

  return [result, abbreviated]
}
