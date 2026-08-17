/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'

import { FileInput } from './FileInput'

function FileInputHarness() {
  const [changes, setChanges] = useState<string[]>([])
  return (
    <>
      <FileInput
        aria-label="Image file"
        accept=".png"
        onChange={(file) => setChanges((values) => [...values, file?.name ?? '(cleared)'])}
      />
      <output>Changes: {changes.join(', ') || '(none)'}</output>
    </>
  )
}

const image = new File(['hello'], 'stuff.png', { type: 'image/png' })

test('uploads a real file and displays its metadata', async () => {
  const screen = await render(<FileInputHarness />)
  const input = screen.getByLabelText('Image file')

  await userEvent.upload(input, image)

  await expect.element(screen.getByText('stuff.png', { exact: true })).toBeVisible()
  await expect.element(screen.getByText('(5 B)')).toBeVisible()
  await expect.element(screen.getByText('Changes: stuff.png')).toBeVisible()
})

test('clears the native input so the same file can be selected again', async () => {
  const screen = await render(<FileInputHarness />)
  const input = screen.getByLabelText('Image file')

  await userEvent.upload(input, image)
  await screen.getByRole('button', { name: 'Clear file' }).click()
  await expect.element(input).toHaveValue('')
  await userEvent.upload(input, image)

  await expect
    .element(screen.getByText('Changes: stuff.png, (cleared), stuff.png'))
    .toBeVisible()
})
