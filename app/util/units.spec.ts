/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, it } from 'vitest'

import {
  bytesInUnit,
  formatBytes,
  GiB,
  KiB,
  MiB,
  bytesFromNumbers,
  TiB,
} from './units'

it.each([
  // bytes: never padded because fractional bytes don't make sense
  [0, undefined, '0', 'B'],
  [0, { pad: true }, '0', 'B'],
  [5, undefined, '5', 'B'],
  [5, { pad: true }, '5', 'B'],
  [500, { pad: true }, '500', 'B'],
  // fractional inputs are rounded to whole bytes
  [2.5, { pad: true }, '3', 'B'],
  [0.5, { pad: true }, '1', 'B'],
  // KiB and larger: scaled but not padded
  [1023.5, undefined, '1', 'KiB'],
  [KiB, undefined, '1', 'KiB'],
  [1500, undefined, '1.46', 'KiB'],
  [MiB, undefined, '1', 'MiB'],
  [GiB, undefined, '1', 'GiB'],
  // padding is opt-in for scaled units
  [KiB, { pad: true }, '1.00', 'KiB'],
  [1500, { pad: true }, '1.46', 'KiB'],
  [MiB, { pad: true }, '1.00', 'MiB'],
  [GiB, { pad: true }, '1.00', 'GiB'],
])('formatBytes(%d, %o)', (bytes, opts, value, unit) => {
  expect(formatBytes(bytes, opts)).toEqual({ value, unit })
})

it.each([
  [GiB, 'GiB', undefined, 1],
  [TiB, 'TiB', undefined, 1],
  [1500 * GiB, 'TiB', undefined, 1.46],
  [GiB, 'TiB', undefined, 0],
  [1536 * MiB, 'GiB', { digits: 1 }, 1.5],
] as const)('bytesInUnit(%d, %s, %o) === %d', (bytes, unit, opts, expected) => {
  expect(bytesInUnit(bytes, unit, opts)).toEqual(expected)
})

const pickCases = [
  [[0], undefined, [{ value: '0', unit: 'B' }]],
  [[0], { minUnit: 'GiB' }, [{ value: '0.00', unit: 'GiB' }]],
  [[KiB], undefined, [{ value: '1.00', unit: 'KiB' }]],
  [[KiB], { minUnit: 'GiB' }, [{ value: '0.00', unit: 'GiB' }]],
  [[GiB], undefined, [{ value: '1.00', unit: 'GiB' }]],
  [[TiB], { minUnit: 'GiB' }, [{ value: '1.00', unit: 'TiB' }]],
  // unit is picked from the largest value so a group renders consistently
  [
    [592 * GiB, 7792 * GiB],
    undefined,
    [
      { value: '0.58', unit: 'TiB' },
      { value: '7.61', unit: 'TiB' },
    ],
  ],
  [
    [68599 * GiB, 70000 * GiB],
    undefined,
    [
      { value: '66.99', unit: 'TiB' },
      { value: '68.36', unit: 'TiB' },
    ],
  ],
] as const

it.each(pickCases)('bytesFromNumbers(%o, %o) formats to %o', (values, opts, expected) => {
  const results = bytesFromNumbers(values, opts).map((b) => formatBytes(b, { pad: true }))
  expect(results).toEqual(expected)
})
