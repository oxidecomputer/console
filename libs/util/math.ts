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
export function splitDecimal(value: number): [string, string] {
  const nf = Intl.NumberFormat(navigator.language, { maximumFractionDigits: 2 })
  const parts = nf.formatToParts(value)

  const [wholeParts, decimalParts] = splitOnceBy(parts, (p) => p.type === 'decimal')

  return [
    wholeParts.map((p) => p.value).join(''),
    decimalParts.map((p) => p.value).join(''),
  ]
}

export function round(num: number, digits: number) {
  const nf = Intl.NumberFormat(navigator.language, { maximumFractionDigits: digits })
  return Number(nf.format(num))
}
