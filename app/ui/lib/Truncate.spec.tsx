/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Truncate } from './Truncate'

const measureText = vi.fn((text: string) => ({ width: text.length }))

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: () => ({ font: '', letterSpacing: '', measureText }),
})

afterEach(() => {
  vi.restoreAllMocks()
  measureText.mockClear()
})

describe('Truncate', () => {
  it('preserves complete Unicode characters when truncating in the middle', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(6)
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(16)
    const text = '😀'.repeat(8)

    render(<Truncate text={text} position="middle" />)

    const displayedText = screen
      .getByLabelText(text)
      .querySelector('.absolute')?.textContent
    expect(displayedText).toBeDefined()
    expect(hasUnpairedSurrogate(displayedText ?? '')).toBe(false)
  })

  it('truncates whenever the rendered text is wider than its container', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(9)
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(10)
    const text = 'abcdefghij'

    render(<Truncate text={text} position="middle" />)

    expect(screen.getByLabelText(text).querySelector('.absolute')).not.toBeNull()
  })
})

function hasUnpairedSurrogate(text: string) {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(i + 1)
      if (next < 0xdc00 || next > 0xdfff) return true
      i++
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true
    }
  }
  return false
}
