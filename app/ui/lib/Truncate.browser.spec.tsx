/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useRef, useState } from 'react'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { Truncate } from './Truncate'

const text = '6e762538-dd89-454e-b6e7-82a199b6e51a'

function OnePixelHarness() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | 'max-content'>('max-content')

  const narrowByOnePixel = () => {
    const target = wrapperRef.current?.querySelector<HTMLElement>('[aria-label]')
    if (target) setWidth(target.scrollWidth - 1)
  }

  return (
    <>
      <button type="button" onClick={narrowByOnePixel}>
        Narrow by one pixel
      </button>
      <button type="button" onClick={() => setWidth('max-content')}>
        Reset width
      </button>
      <div ref={wrapperRef} style={{ width }}>
        <Truncate text={text} position="middle" tooltipDelay={0} />
      </div>
    </>
  )
}

test('middle-truncates to the rendered width and shows the full text on hover', async () => {
  const screen = await render(
    <div style={{ width: 160 }}>
      <Truncate text={text} position="middle" hasCopyButton tooltipDelay={0} />
    </div>
  )
  const value = screen.getByLabelText(text)

  await expect.element(screen.getByText(/^6.+….+a$/)).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Click to copy' })).toBeVisible()

  await value.hover()
  await expect.element(screen.getByRole('tooltip')).toHaveTextContent(text)
})

test('end-truncates with CSS and shows the full text on hover', async () => {
  const screen = await render(
    <div style={{ width: 160 }}>
      <Truncate text={text} tooltipDelay={0} />
    </div>
  )
  const value = screen.getByLabelText(text)

  expect(value.element().scrollWidth).toBeGreaterThan(value.element().clientWidth)
  expect(getComputedStyle(value.element()).textOverflow).toBe('ellipsis')

  await value.hover()
  await expect.element(screen.getByRole('tooltip')).toHaveTextContent(text)
})

test.each(['middle', 'end'] as const)(
  'does not show a tooltip when %s-positioned text fits',
  async (position) => {
    const shortText = 'short text'
    const screen = await render(
      <div style={{ width: 160 }}>
        <Truncate text={shortText} position={position} tooltipDelay={0} />
      </div>
    )
    const value = screen.getByLabelText(shortText)

    await value.hover()
    await expect.element(screen.getByRole('tooltip')).not.toBeInTheDocument()
  }
)

test('recomputes when the container becomes one pixel too narrow and widens again', async () => {
  const screen = await render(<OnePixelHarness />)
  const value = screen.getByLabelText(text)

  await expect.element(screen.getByText(/…/)).not.toBeInTheDocument()

  await screen.getByRole('button', { name: 'Narrow by one pixel' }).click()
  await expect.element(screen.getByText(/…/)).toBeVisible()
  await value.hover()
  await expect.element(screen.getByRole('tooltip')).toHaveTextContent(text)

  await screen.getByRole('button', { name: 'Reset width' }).click()
  await expect.element(screen.getByText(/…/)).not.toBeInTheDocument()
  await value.hover()
  await expect.element(screen.getByRole('tooltip')).not.toBeInTheDocument()
})

test('does not split combining-character graphemes', async () => {
  const grapheme = 'é'
  const unicodeText = grapheme.repeat(40)
  const screen = await render(
    <div style={{ width: 160 }}>
      <Truncate text={unicodeText} position="middle" />
    </div>
  )

  await expect.element(screen.getByText(/^(?:é)+…(?:é)+$/)).toBeVisible()
})
