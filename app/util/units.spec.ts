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
  // bytes: never padded because fractional bytes don't make sense
  [0, '0', 'B', '0 B'],
  [5, '5', 'B', '5 B'],
  [500, '500', 'B', '500 B'],
  // fractional inputs are rounded to whole bytes
  [2.5, '3', 'B', '3 B'],
  [0.5, '1', 'B', '1 B'],
  // KiB and larger: always padded
  [1023.5, '1.00', 'KiB', '1.00 KiB'],
  [KiB, '1.00', 'KiB', '1.00 KiB'],
  [1500, '1.46', 'KiB', '1.46 KiB'],
  [MiB, '1.00', 'MiB', '1.00 MiB'],
  [GiB, '1.00', 'GiB', '1.00 GiB'],
])('formatBytes(%d)', (bytes, value, unit, label) => {
  expect(formatBytes(bytes)).toEqual({ value, unit, label })
})
