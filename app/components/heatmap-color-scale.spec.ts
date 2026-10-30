/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import {
  getSampleCountMetadata,
  getScalingFunction,
  type ColorScale,
} from './heatmap-color-scale'

const scale = (counts: number[], colorScale: ColorScale) =>
  getScalingFunction(getSampleCountMetadata(counts), colorScale)

describe('getSampleCountMetadata', () => {
  it('ignores zeros and duplicates', () => {
    const { minSampleCount, maxSampleCount, ranks } = getSampleCountMetadata([
      50, 0, 5, 50, 0, 100,
    ])
    expect(minSampleCount).toBe(5)
    expect(maxSampleCount).toBe(100)
    expect([...ranks]).toEqual([
      [5, 0],
      [50, 1],
      [100, 2],
    ])
  })

  it('handles lack of samples', () => {
    const { minSampleCount, maxSampleCount, ranks } = getSampleCountMetadata([0, 0])
    expect(minSampleCount).toBe(0)
    expect(maxSampleCount).toBe(0)
    expect(ranks.size).toBe(0)
  })
})

describe('linear', () => {
  it('is the fraction of the max', () => {
    const f = scale([10, 50, 200], 'linear')
    expect(f(10)).toBe(0.05)
    expect(f(50)).toBe(0.25)
    expect(f(200)).toBe(1)
  })
})

describe('logarithmic', () => {
  it("has 1 as 0 and the collection's greatest value as 1", () => {
    const f = scale([10, 200], 'logarithmic')
    expect(f(1)).toBe(0)
    expect(f(200)).toBe(1)
  })

  it('gives equal ratios equal steps', () => {
    const expectEqualSpacing = (values: number[]) => {
      const f = scale(values, 'logarithmic')
      values.forEach((value, i) => expect(f(value)).toBeCloseTo(i / (values.length - 1)))
    }

    expectEqualSpacing([1, 10, 100, 1000, 10000])
    expectEqualSpacing([1, 7, 49, 343])
  })

  it("makes an exception when the collection's greatest value is 1", () => {
    expect(scale([1, 0], 'logarithmic')(1)).toBe(1)
  })
})

describe('ranked', () => {
  it('spaces distinct counts evenly', () => {
    const f = scale([1, 2, 1000], 'ranked')
    expect(f(1)).toBe(0)
    expect(f(2)).toBe(0.5)
    expect(f(1000)).toBe(1)
  })

  it('ignores duplicates', () => {
    const f = scale([3, 3, 7, 9], 'ranked')
    expect(f(3)).toBe(0)
    expect(f(7)).toBe(0.5)
  })

  it('puts a single count at the top', () => {
    expect(scale([4, 4, 0], 'ranked')(4)).toBe(1)
  })
})
