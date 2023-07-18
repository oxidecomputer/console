/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

export function splitDecimal(value: number) {
  const wholeNumber = Math.trunc(value)
  const decimal = value % 1 !== 0 ? round(value % 1, 2) : null
  return [
    wholeNumber.toLocaleString(),
    decimal ? '.' + decimal.toLocaleString().split('.')[1] : '',
  ]
}

export function round(num: number, digits: number) {
  const pow10 = Math.pow(10, digits)
  return Math.round((num + Number.EPSILON) * pow10) / pow10
}
