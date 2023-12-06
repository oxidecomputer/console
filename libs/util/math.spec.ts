/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, it } from 'vitest'

import { GiB } from '.'
import { round, splitDecimal } from './math'

it('rounds properly', () => {
  expect(round(123.456, 0)).toEqual(123)
  expect(round(123.456, 1)).toEqual(123.5)
  expect(round(123.456, 2)).toEqual(123.46)
  expect(round(123.456, 3)).toEqual(123.456)
  expect(round(123.456, 4)).toEqual(123.456) // trailing zeros are culled
  expect(round(1.9, 0)).toEqual(2)
  expect(round(1.9, 1)).toEqual(1.9)
  expect(round(5 / 2, 2)).toEqual(2.5) // math expressions are resolved
  expect(round(1879048192 / GiB, 2)).toEqual(1.75) // constants can be evaluated
})

it.each([
  [1.23, ['1', '.23']],
  [1, ['1', '']], // whole number decimal should be an empty string
  [1.252525, ['1', '.25']],
  [1.259, ['1', '.26']], // should correctly round the decimal
  [-50.2, ['-50', '.2']], // should correctly not round down to -51
  [1000.5, ['1,000', '.5']], // testing localeString
  [49.00000001, ['49', '']],
])('splitDecimal', (input, output) => {
  expect(splitDecimal(input)).toEqual(output)
})
