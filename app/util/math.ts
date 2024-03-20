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

/** Boolean represents whether the number was abbreviated */
export function displayBigNum(num: bigint | number): [string, boolean] {
  const compact = Intl.NumberFormat(navigator.language, {
    notation: 'compact',
    maximumFractionDigits: 1,
  })

  const abbreviate = num > 1_000_000

  const result = abbreviate
    ? num < 1e15 // this the threshold where compact stops using nice letters. see tests
      ? compact.format(num)
      : toEngNotation(num)
    : num.toLocaleString()

  return [result, abbreviate]
}
