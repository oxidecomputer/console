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

import { Combobox, toComboboxItems, type ComboboxItem } from './Combobox'

const items = toComboboxItems([{ name: 'disk-3' }, { name: 'disk-4' }])

function ComboboxHarness({ comboboxItems = items }: { comboboxItems?: ComboboxItem[] }) {
  const [selectedItemValue, setSelectedItemValue] = useState('')

  return (
    <>
      <button type="button">Outside</button>
      <Combobox
        items={comboboxItems}
        label="Disk name"
        selectedItemValue={selectedItemValue}
        onChange={setSelectedItemValue}
      />
    </>
  )
}

test('preserves the committed selection while editing', async () => {
  const screen = await render(<ComboboxHarness />)
  const combobox = screen.getByRole('combobox', { name: 'Disk name' })

  await combobox.click()
  await screen.getByRole('option', { name: 'disk-3' }).click()
  await expect.element(combobox).toHaveValue('disk-3')

  await combobox.fill('disk-3zzz')
  await expect.element(combobox).toHaveValue('disk-3zzz')
  await expect.element(screen.getByRole('option', { name: 'No items match' })).toBeVisible()

  await screen.getByRole('button', { name: 'Outside' }).click()
  await expect.element(combobox).toHaveValue('disk-3')
})

test('commits a different selected option after editing', async () => {
  const screen = await render(<ComboboxHarness />)
  const combobox = screen.getByRole('combobox', { name: 'Disk name' })

  await combobox.click()
  await screen.getByRole('option', { name: 'disk-3' }).click()
  await combobox.fill('disk-4')
  await screen.getByRole('option', { name: 'disk-4' }).click()

  await expect.element(combobox).toHaveValue('disk-4')
})

test('virtualizes and filters options outside the initial window', async () => {
  const manyItems = toComboboxItems(
    Array.from({ length: 1_000 }, (_, index) => ({
      name: `disk-${String(index + 1).padStart(4, '0')}`,
    }))
  )
  const screen = await render(<ComboboxHarness comboboxItems={manyItems} />)
  const combobox = screen.getByRole('combobox', { name: 'Disk name' })

  await combobox.click()
  await expect.element(screen.getByRole('option', { name: 'disk-0001' })).toBeVisible()
  await expect
    .element(screen.getByRole('option', { name: 'disk-0988' }))
    .not.toBeInTheDocument()

  await userEvent.keyboard('{End}')
  await expect.element(screen.getByRole('option', { name: 'disk-0988' })).toBeVisible()

  await combobox.fill('disk-0988')
  await screen.getByRole('option', { name: 'disk-0988' }).click()
  await expect.element(combobox).toHaveValue('disk-0988')
})
