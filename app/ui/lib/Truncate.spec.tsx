/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { describe, expect, it } from 'vitest'

import { middleTruncateToFit } from './Truncate'

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
const graphemeWidth = (text: string) => Array.from(segmenter.segment(text)).length

describe('middleTruncateToFit', () => {
  it.each([
    ['emoji', '😀'.repeat(8), '😀😀😀…😀😀'],
    ['combining marks', 'é'.repeat(8), 'ééé…éé'],
  ])('preserves complete %s graphemes', (_name, text, expected) => {
    expect(middleTruncateToFit(text, 6, graphemeWidth)).toBe(expected)
  })

  it('keeps the largest middle-truncated value that fits', () => {
    expect(middleTruncateToFit('abcdefghij', 9, graphemeWidth)).toBe('abcd…ghij')
  })

  it('accounts for variable-width graphemes', () => {
    const variableWidth = (text: string) =>
      Array.from(segmenter.segment(text), ({ segment }) =>
        segment === 'W' ? 3 : 1
      ).reduce((sum, width) => sum + width, 0)

    expect(middleTruncateToFit('WWiiiiWW', 9, variableWidth)).toBe('W…W')
  })
})
