/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it, test } from 'vitest'

import { genName, parsePortRange, synthesizeData } from './util'

describe('parsePortRange', () => {
  describe('parses', () => {
    it('single ports up to 5 digits', () => {
      expect(parsePortRange('0')).toEqual([0, 0])
      expect(parsePortRange('1')).toEqual([1, 1])
      expect(parsePortRange('123')).toEqual([123, 123])
      expect(parsePortRange('12356')).toEqual([12356, 12356])
    })

    it('ranges', () => {
      expect(parsePortRange('123-456')).toEqual([123, 456])
      expect(parsePortRange('1-45690')).toEqual([1, 45690])
      expect(parsePortRange('5-5')).toEqual([5, 5])
    })

    it('with surrounding whitespace', () => {
      expect(parsePortRange('123-456 ')).toEqual([123, 456])
      expect(parsePortRange('  1-45690')).toEqual([1, 45690])
      expect(parsePortRange('  5-5  \n')).toEqual([5, 5])
    })
  })

  describe('rejects', () => {
    it('nonsense', () => {
      expect(parsePortRange('12a5')).toEqual(null)
      expect(parsePortRange('lkajsdfha')).toEqual(null)
    })

    it('p2 < p1', () => {
      expect(parsePortRange('123-45')).toEqual(null)
    })

    it('too many digits', () => {
      expect(parsePortRange('239032')).toEqual(null)
    })
  })
})

test('genName', () => {
  expect(genName('a'.repeat(64), 'b'.repeat(64))).toMatch(/^a{27}-b{27}-[0-9a-f]{6}$/)
  expect(genName('a'.repeat(64), 'b'.repeat(64), 'c'.repeat(64))).toMatch(
    /^a{18}-b{18}-c{18}-[0-9a-f]{6}$/
  )

  // Test a bunch of lengths to make sure we don't overflow the max length
  for (let i = 2; i <= 128; i = 2 * i) {
    const singlePartName = genName('a'.repeat(i))
    expect(singlePartName.length).toBeLessThanOrEqual(63)
    expect(singlePartName).toMatch(/^a+-[0-9a-f]{6}$/)

    const doublePartName = genName('a'.repeat(i / 2), 'b'.repeat(i / 2))
    expect(doublePartName.length).toBeLessThanOrEqual(63)
    expect(doublePartName).toMatch(/^a+-b+-[0-9a-f]{6}$/)
  }
})

const pt = (timestamp: Date, value: number) => ({
  timestamp,
  datum: { datum: value, type: 'i64' as const },
})

describe('synthesizeData', () => {
  const start = new Date(2023, 3, 2)
  const mid1 = new Date(2023, 3, 3)
  const mid2 = new Date(2023, 3, 4)
  const end = new Date(2023, 3, 5)

  it('returns undefined when either input list is undefined', () => {
    expect(synthesizeData(undefined, undefined, start, end, (x) => x)).toEqual(undefined)
    expect(synthesizeData([], undefined, start, end, (x) => x)).toEqual(undefined)
    expect(synthesizeData(undefined, [], start, end, (x) => x)).toEqual(undefined)
  })

  it('adds 0s at start and end when there is no data', () => {
    expect(synthesizeData([], [], start, end, (x) => x)).toEqual([
      { timestamp: start.getTime(), value: 0 },
      { timestamp: end.getTime(), value: 0 },
    ])
  })

  it("adds start and end when there's data in range", () => {
    const result = synthesizeData(
      [pt(mid1, 4), pt(mid2, 5)],
      [pt(new Date(0), 3)],
      start,
      end,
      (x) => x
    )
    expect(result).toEqual([
      { timestamp: start.getTime(), value: 3 },
      { timestamp: mid1.getTime(), value: 4 },
      { timestamp: mid2.getTime(), value: 5 },
      { timestamp: end.getTime(), value: 5 },
    ])
  })

  it('valueTransform is applied to both data in range and synthetic start and end', () => {
    const result = synthesizeData(
      [pt(mid1, 4), pt(mid2, 5)],
      [pt(new Date(0), 3)],
      start,
      end,
      (x) => 2 * x
    )
    expect(result).toEqual([
      { timestamp: start.getTime(), value: 6 },
      { timestamp: mid1.getTime(), value: 8 },
      { timestamp: mid2.getTime(), value: 10 },
      { timestamp: end.getTime(), value: 10 },
    ])
  })

  it('does not add synthentic start when existing data point matches start time exactly', () => {
    const result = synthesizeData(
      [pt(start, 4), pt(mid1, 5)],
      [pt(new Date(0), 3)],
      start,
      end,
      (x) => x
    )
    expect(result).toEqual([
      { timestamp: start.getTime(), value: 4 },
      { timestamp: mid1.getTime(), value: 5 },
      { timestamp: end.getTime(), value: 5 },
    ])
  })
})
