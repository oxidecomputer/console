/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

let ctx: CanvasRenderingContext2D | null = null

function getContext(): CanvasRenderingContext2D {
  if (!ctx) {
    const canvas = document.createElement('canvas')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- offscreen canvas always has 2d context
    ctx = canvas.getContext('2d')!
  }
  return ctx
}

const cache = new Map<string, number>()

/**
 * Measure the rendered pixel width of `text` using Canvas `measureText`.
 * Accounts for font shaping, kerning, and letter-spacing. Reuses a single
 * offscreen canvas context and caches results.
 */
export function textWidth(text: string, font: string, letterSpacing = '0px'): number {
  const key = font + '\0' + letterSpacing + '\0' + text
  const cached = cache.get(key)
  if (cached != null) return cached

  const context = getContext()
  context.font = font
  context.letterSpacing = letterSpacing
  const width = context.measureText(text).width
  cache.set(key, width)
  return width
}
