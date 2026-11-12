/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as R from 'remeda'
import { match } from 'ts-pattern'

export type ColorScale = 'linear' | 'logarithmic' | 'ranked'

const scaleLinear =
  (maxCount: number) =>
  (count: number): number =>
    count / maxCount
const scaleLog = (maxCount: number) =>
  maxCount <= 1
    ? // if the max is 1, a logarithmic scaling function is undefined. but
      // since 1 is then the only valid value, in a charting context it makes
      // sense to treat that as a scale of 100%
      R.constant(1)
    : (count: number): number => Math.log(count) / Math.log(maxCount)
const scaleRank = (ranks: Map<number, number>) =>
  ranks.size <= 1
    ? R.constant(1)
    : (count: number): number => (ranks.get(count) ?? 0) / (ranks.size - 1)

export type SampleCountMetadata = {
  minSampleCount: number
  maxSampleCount: number
  ranks: Map<number, number>
}

export const getSampleCountMetadata = (counts: number[]): SampleCountMetadata => {
  const allCounts = R.sort(
    R.unique(counts).filter((x) => x !== 0),
    (a, b) => a - b
  )

  return {
    minSampleCount: R.first(allCounts) ?? 0,
    maxSampleCount: R.last(allCounts) ?? 0,
    ranks: new Map(allCounts.map((n, i) => [n, i])),
  }
}

/**
 * Maps a sample count to a position for a color ramp, from 0 to 1.
 * Expects that the count given to the final scaling function is a nonzero
 * natural number.
 */
export const getScalingFunction = (
  metadata: SampleCountMetadata,
  colorScale: ColorScale
): ((n: number) => number) =>
  match(colorScale)
    .with('linear', () => scaleLinear(metadata.maxSampleCount))
    .with('logarithmic', () => scaleLog(metadata.maxSampleCount))
    .with('ranked', () => scaleRank(metadata.ranks))
    .exhaustive()
