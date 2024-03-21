/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { displayBigNum, percentage, round, splitDecimal, toEngNotation } from './math'
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

it.each([
  [2, 5, 40],
  [1, 2, 50],
  [3, 4, 75],
  [7, 10, 70],
  [1, 3, 33.33],
  [1, 7, 14.29],
  [5, 8, 62.5],
  [3, 9, 33.33],
  [45847389, 349848380, 13.1],
  [19403, 9, 215588.89],
  [1n, 2n, 50],
  [3n, 4n, 75],
  [7n, 10n, 70],
  // want to make sure we try it with IPv6 scale numbers
  [7n, 123849839483423987n, 0],
  [2n ** 80n, 2n ** 81n, 50],
  [2n ** 80n, (9n * 2n ** 81n) / 7n, 38.88],
  [39340938283493007n, 12387938n, 317574549400.33],
  // also negatives, why not
  [-1, 2, -50],
  [-3, 4, -75],
  [-7, 10, -70],
  [-1, 3, -33.33],
  [-1, 7, -14.29],
  [-5, 8, -62.5],
  [-3, 9, -33.33],
  [-1n, 2n, -50],
  [-3n, 4n, -75],
  [-7n, 10n, -70],
])('percentage %d / %d -> %d', (top, bottom, perc) => {
  expect(percentage(top, bottom)).toBeCloseTo(perc, 2)
})

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

    // bigints
    [0n, ['0', '']],
    [1n, ['1', '']],
    [49502834980392389834234891248n, ['49,502,834,980,392,389,834,234,891,248', '']],
  ])('splitDecimal %d -> %s', (input, output) => {
    expect(splitDecimal(input)).toEqual(output)
  })

  it.each([
    [0n, ['0', false]],
    [1n, ['1', false]],
    [155n, ['155', false]],
    [999999n, ['999,999', false]],
    [9999999n, ['10M', true]],
    [492038458320n, ['492B', true]],
    [894283412938921, ['894.3T', true]],
    [1293859032098219, ['1.3e15', true]],
    [23094304823948203952304920342n, ['23.1e27', true]],
  ])('displayBigNum %d -> %s', (input, output) => {
    expect(displayBigNum(input)).toEqual(output)
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

  it.each([
    [0n, ['0', false]],
    [1n, ['1', false]],
    [155n, ['155', false]],
    [999999n, ['999,999', false]],
    [9999999n, ['10 Mio.', true]], // note non-breaking space
    [492038458320n, ['492 Mrd.', true]], // note non-breaking space
    [894283412938921, ['894,3 Bio.', true]],
    [1293859032098219, ['1,3e15', true]],
    [23094304823948203952304920342n, ['23,1e27', true]],
  ])('displayBigNum %d -> %s', (input, output) => {
    expect(displayBigNum(input)).toEqual(output)
  })

  afterAll(() => {
    Object.defineProperty(global.navigator, 'language', {
      value: originalLanguage,
      writable: true,
    })
  })
})

// the point of these tests is to make sure the toLowerCase shenanigan in
// toEngNotation doesn't go horribly wrong due some obscure locale's concept of
// engineering notation

const n = 23094304823948203952304920342n

it.each([
  ['en-US'],
  ['zh-CN'],
  ['es-419'],
  ['en-GB'],
  ['ja-JP'],
  ['en-CA'],
  ['en-IN'],
  ['ko-KR'],
])('toEngNotation dots %s', (locale) => {
  expect(toEngNotation(n, locale)).toEqual('23.1e27')
})

it.each([
  ['es-ES'],
  ['ru-RU'],
  ['de-DE'],
  ['fr-FR'],
  ['pt-BR'],
  ['fr-CA'],
  ['it-IT'],
  ['pl-PL'],
  ['nl-NL'],
  ['tr-TR'],
  ['pt-PT'],
  // ['ar-SA'], // saudi arabia, arabic script
])('toEngNotation commas %s', (locale) => {
  expect(toEngNotation(n, locale)).toEqual('23,1e27')
})
