/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, it } from 'vitest'

import { formatBytes, GiB, KiB, MiB } from './units'

it.each([
  // bytes: never padded (fractional bytes don't make sense)
  [0, undefined, '0 B'],
  [0, { pad: true }, '0 B'],
  [5, undefined, '5 B'],
  [5, { pad: true }, '5 B'],
  [500, { pad: true }, '500 B'],
  // fractional inputs are rounded to whole bytes
  [2.5, { pad: true }, '3 B'],
  [0.5, { pad: true }, '1 B'],
  // KiB and larger: padded when requested
  [KiB, undefined, '1 KiB'],
  [KiB, { pad: true }, '1.00 KiB'],
  [1500, { pad: true }, '1.46 KiB'],
  [MiB, { pad: true }, '1.00 MiB'],
  [GiB, { pad: true }, '1.00 GiB'],
])('formatBytes(%d, %o) -> %s', (bytes, opts, expected) => {
  expect(formatBytes(bytes, opts)).toEqual(expected)
})
