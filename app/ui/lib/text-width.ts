/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { monoWidth, sansDefaultWidth, sansWidths } from './font-widths.gen'

/**
 * Estimate the rendered width of `text` in our sans or mono font, returned
 * as a unitless number proportional to actual pixel width. Multiply by
 * font-size (in px) for an approximate pixel value.
 *
 * Uses pre-generated per-character advance-width ratios from the actual font
 * files — no Canvas or DOM measurement needed.
 */
export function textWidth(text: string, font: 'sans' | 'mono' = 'sans'): number {
  if (font === 'mono') return text.length * monoWidth
  let width = 0
  for (const char of text) {
    width += sansWidths[char] ?? sansDefaultWidth
  }
  return width
}
