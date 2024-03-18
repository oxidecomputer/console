/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { round, splitDecimal } from './math'
import { GiB } from './units'

function roundTest() {
  expect(round(1, 2)).toEqual(1)
  expect(round(100, 2)).toEqual(100)
  expect(round(999, 2)).toEqual(999)
  expect(round(1000, 2)).toEqual(1000)
  expect(round(1000.1, 2)).toEqual(1000.1)
  expect(round(1438972340398.648, 2)).toEqual(1438972340398.65)
  expect(round(0.456, 2)).toEqual(0.46)
  expect(round(-0.456, 2)).toEqual(-0.46)
  expect(round(123.456, 0)).toEqual(123)
  expect(round(123.456, 1)).toEqual(123.5)
  expect(round(123.456, 2)).toEqual(123.46)
  expect(round(123.456, 3)).toEqual(123.456)
  expect(round(123.456, 4)).toEqual(123.456) // trailing zeros are culled
  expect(round(123.0001, 3)).toEqual(123) // period is culled if decimals are all zeros
  expect(round(1.9, 0)).toEqual(2)
  expect(round(1.9, 1)).toEqual(1.9)
  expect(round(4.997, 2)).toEqual(5)
  expect(round(5 / 2, 2)).toEqual(2.5) // math expressions are resolved
  expect(round(1879048192 / GiB, 2)).toEqual(1.75) // constants can be evaluated
}

it('round', roundTest)

describe('with default locale', () => {
  it.each([
    [0.23, ['0', '.23']],
    [0.236, ['0', '.24']],
    [-0.236, ['-0', '.24']],
    [1.23, ['1', '.23']],
    [1, ['1', '']], // whole number decimal should be an empty string

    // values just below whole numbers
    [5 - Number.EPSILON, ['5', '']],
    [4.997, ['5', '']],
    [-4.997, ['-5', '']],
    [0.997, ['1', '']],

    // values just above whole numbers
    [49.00000001, ['49', '']],
    [5 + Number.EPSILON, ['5', '']],

    [1.252525, ['1', '.25']],
    [1.259, ['1', '.26']], // should correctly round the decimal
    [-50.2, ['-50', '.2']], // should correctly not round down to -51
    [1000.5, ['1,000', '.5']], // test localeString grouping
  ])('splitDecimal %d -> %s', (input, output) => {
    expect(splitDecimal(input)).toEqual(output)
  })
})

describe('with de-DE locale', () => {
  const originalLanguage = global.navigator.language

  beforeAll(() => {
    Object.defineProperty(global.navigator, 'language', {
      value: 'de-DE',
      writable: true,
    })
  })

  it.each([
    [0.23, ['0', ',23']],
    [0.236, ['0', ',24']],
    [-0.236, ['-0', ',24']],
    [1.23, ['1', ',23']],
    [1, ['1', '']], // whole number decimal should be an empty string

    // values just below whole numbers
    [5 - Number.EPSILON, ['5', '']],
    [4.997, ['5', '']],
    [-4.997, ['-5', '']],
    [0.997, ['1', '']],

    // values just above whole numbers
    [49.00000001, ['49', '']],
    [5 + Number.EPSILON, ['5', '']],

    [1.252525, ['1', ',25']],
    [1.259, ['1', ',26']], // should correctly round the decimal
    [-50.2, ['-50', ',2']], // should correctly not round down to -51
    [1000.5, ['1.000', ',5']], // test localeString grouping
  ])('splitDecimal %d -> %s', (input, output) => {
    expect(splitDecimal(input)).toEqual(output)
  })

  // rounding must work the same irrespective of locale
  it('round', roundTest)

  afterAll(() => {
    Object.defineProperty(global.navigator, 'language', {
      value: originalLanguage,
      writable: true,
    })
  })
})
