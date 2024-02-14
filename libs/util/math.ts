/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

export function splitDecimal(value: number): [string, string] {
  const [whole, decimal] = round(value, 2).toLocaleString().split('.')
  return [whole, decimal ? '.' + decimal : '']
}

export function round(num: number, digits: number) {
  return Number(num.toFixed(digits))
}
