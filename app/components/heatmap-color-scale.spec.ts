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

  it('handles no samples', () => {
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
  it('runs from 0 to 1', () => {
    const f = scale([10, 200], 'logarithmic')
    expect(f(0)).toBe(0)
    expect(f(200)).toBe(1)
  })

  it('spreads out low counts more than linear', () => {
    const counts = [1, 10, 100]
    const log = scale(counts, 'logarithmic')
    const linear = scale(counts, 'linear')
    expect(log(10) - log(1)).toBeGreaterThan(linear(10) - linear(1))
  })
})

describe('ranked', () => {
  it('spaces distinct counts evenly regardless of magnitude', () => {
    const f = scale([1, 2, 1000], 'ranked')
    expect(f(1)).toBe(0)
    expect(f(2)).toBe(0.5)
    expect(f(1000)).toBe(1)
  })

  it('gives equal counts the same position', () => {
    const f = scale([3, 3, 7, 7, 9], 'ranked')
    expect(f(3)).toBe(0)
    expect(f(7)).toBe(0.5)
  })

  it('puts a lone distinct count at the top', () => {
    expect(scale([4, 4, 0], 'ranked')(4)).toBe(1)
  })
})
