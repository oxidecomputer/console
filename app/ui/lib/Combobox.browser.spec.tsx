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
import { commands, userEvent } from 'vitest/browser'

import { Combobox, toComboboxItems, type ComboboxItem } from './Combobox'

declare module 'vitest/browser' {
  interface BrowserCommands {
    pressComboboxKey: (label: string, key: string) => Promise<void>
  }
}

const items = toComboboxItems([{ name: 'disk-3' }, { name: 'disk-4' }])

function ComboboxHarness({
  comboboxItems = items,
  initialValue = '',
  allowArbitraryValues = false,
}: {
  comboboxItems?: ComboboxItem[]
  initialValue?: string
  allowArbitraryValues?: boolean
}) {
  const [selectedItemValue, setSelectedItemValue] = useState(initialValue)
  const [parentEscapes, setParentEscapes] = useState(0)

  return (
    // The parent key handler models the modal form's Escape listener.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <form
      aria-label="Parent form"
      onSubmit={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setParentEscapes((count) => count + 1)
      }}
    >
      <button type="button">Outside</button>
      <button type="button" onClick={() => setSelectedItemValue('')}>
        Clear externally
      </button>
      <Combobox
        items={comboboxItems}
        label="Disk name"
        selectedItemValue={selectedItemValue}
        onChange={setSelectedItemValue}
        onInputChange={allowArbitraryValues ? setSelectedItemValue : undefined}
        allowArbitraryValues={allowArbitraryValues}
      />
      <output>Selected: {selectedItemValue || '(empty)'}</output>
      <output>Parent escapes: {parentEscapes}</output>
    </form>
  )
}

test('preserves the committed selection while editing', async () => {
  const screen = await render(<ComboboxHarness initialValue="disk-3" />)
  const combobox = screen.getByRole('combobox', { name: 'Disk name' })

  await expect.element(combobox).toHaveValue('disk-3')

  await combobox.fill('disk-3zzz')
  await commands.pressComboboxKey('Disk name', 'ArrowDown')
  await expect.element(combobox).toHaveValue('disk-3zzz')
  await expect.element(screen.getByRole('option', { name: 'No items match' })).toBeVisible()

  await screen.getByRole('button', { name: 'Outside' }).click()
  await expect.element(combobox).toHaveValue('disk-3')
})

test('commits a different selected option after editing', async () => {
  const screen = await render(<ComboboxHarness initialValue="disk-3" />)
  const combobox = screen.getByRole('combobox', { name: 'Disk name' })

  await combobox.fill('disk-4')
  await commands.pressComboboxKey('Disk name', 'ArrowDown')
  await screen.getByRole('option', { name: 'disk-4' }).click()

  await expect.element(combobox).toHaveValue('disk-4')
})

test('clears the committed selection when the input is emptied', async () => {
  const screen = await render(<ComboboxHarness />)
  const combobox = screen.getByRole('combobox', { name: 'Disk name' })

  await combobox.fill('disk-3')
  await commands.pressComboboxKey('Disk name', 'ArrowDown')
  await screen.getByRole('option', { name: 'disk-3' }).click()
  await combobox.fill('')
  await commands.pressComboboxKey('Disk name', 'Escape')

  await expect.element(combobox).toHaveValue('')
  await expect.element(screen.getByText('Selected: (empty)')).toBeVisible()
})

test('keeps arbitrary values and resets the query when cleared externally', async () => {
  const screen = await render(<ComboboxHarness allowArbitraryValues />)
  const combobox = screen.getByRole('combobox', { name: 'Disk name' })

  await combobox.fill('d')
  await commands.pressComboboxKey('Disk name', 'ArrowDown')
  await expect.element(screen.getByRole('option', { name: 'Custom: d' })).toBeVisible()
  await screen.getByRole('button', { name: 'Outside' }).click()
  await expect.element(combobox).toHaveValue('d')
  await expect.element(screen.getByText('Selected: d')).toBeVisible()

  await screen.getByRole('button', { name: 'Clear externally' }).click()
  await expect.element(combobox).toHaveValue('')
  await combobox.click()
  await expect.element(combobox).toHaveAttribute('aria-expanded', 'true')
  await expect.element(screen.getByRole('option', { name: 'disk-3' })).toBeVisible()
  await expect
    .element(screen.getByRole('option', { name: 'Custom: d' }))
    .not.toBeInTheDocument()
})

test('Enter commits the highlighted option instead of the arbitrary query', async () => {
  const comboboxItems = toComboboxItems([{ name: 'mock-vpc' }])
  const screen = await render(
    <ComboboxHarness comboboxItems={comboboxItems} allowArbitraryValues />
  )
  const combobox = screen.getByRole('combobox', { name: 'Disk name' })

  await combobox.fill('mock')
  await commands.pressComboboxKey('Disk name', 'ArrowDown')
  const listedOption = screen.getByRole('option', { name: 'mock-vpc' })
  await expect.element(listedOption).toBeVisible()
  await expect.element(screen.getByRole('option', { name: 'Custom: mock' })).toBeVisible()
  await commands.pressComboboxKey('Disk name', 'ArrowUp')
  const listedOptionId = listedOption.element().id
  await expect.element(combobox).toHaveAttribute('aria-activedescendant', listedOptionId)
  await commands.pressComboboxKey('Disk name', 'Enter')

  await expect.element(combobox).toHaveValue('mock-vpc')
  await expect.element(screen.getByText('Selected: mock-vpc')).toBeVisible()
})

test('Escape closes the options before propagating to the parent', async () => {
  const screen = await render(<ComboboxHarness />)
  const combobox = screen.getByRole('combobox', { name: 'Disk name' })

  await combobox.fill('disk')
  await commands.pressComboboxKey('Disk name', 'ArrowDown')
  await expect.element(screen.getByRole('option', { name: 'disk-3' })).toBeVisible()
  await userEvent.keyboard('{Escape}')
  await expect.element(screen.getByRole('option')).not.toBeInTheDocument()
  await expect.element(screen.getByText('Parent escapes: 0')).toBeVisible()

  await userEvent.keyboard('{Escape}')
  await expect.element(screen.getByText('Parent escapes: 1')).toBeVisible()
})

test('virtualizes and filters options outside the initial window', async () => {
  const manyItems = toComboboxItems(
    Array.from({ length: 1_000 }, (_, index) => ({
      name: `disk-${String(index + 1).padStart(4, '0')}`,
    }))
  )
  const screen = await render(<ComboboxHarness comboboxItems={manyItems} />)
  const combobox = screen.getByRole('combobox', { name: 'Disk name' })

  await combobox.fill('disk-')
  await commands.pressComboboxKey('Disk name', 'ArrowDown')
  const firstOption = screen.getByRole('option', { name: 'disk-0001' })
  await expect.element(firstOption).toBeVisible()
  await expect.element(firstOption).toHaveAttribute('aria-setsize', '1000')
  await expect
    .element(screen.getByRole('option', { name: 'disk-0988' }))
    .not.toBeInTheDocument()

  await userEvent.keyboard('{End}')
  await expect.element(screen.getByRole('option', { name: 'disk-0988' })).toBeVisible()

  await combobox.fill('disk-0988')
  await screen.getByRole('option', { name: 'disk-0988' }).click()
  await expect.element(combobox).toHaveValue('disk-0988')
  await expect.element(screen.getByRole('option')).not.toBeInTheDocument()
})

test('filters rich labels by their selected label and displays metadata', async () => {
  const richItems: ComboboxItem[] = [
    {
      value: 'image-1',
      selectedLabel: 'ubuntu-22-04',
      label: (
        <div>
          <div>ubuntu-22-04</div>
          <div>Ubuntu / 22.04 / 4 GiB</div>
        </div>
      ),
    },
    {
      value: 'image-2',
      selectedLabel: 'ubuntu-20-04',
      label: (
        <div>
          <div>ubuntu-20-04</div>
          <div>Ubuntu / 20.04 / 2 GiB</div>
        </div>
      ),
    },
    {
      value: 'image-3',
      selectedLabel: 'arch-2022-06-01',
      label: <div>arch-2022-06-01</div>,
    },
  ]
  const screen = await render(<ComboboxHarness comboboxItems={richItems} />)
  const combobox = screen.getByRole('combobox', { name: 'Disk name' })

  await combobox.fill('ubuntu')
  await commands.pressComboboxKey('Disk name', 'ArrowDown')
  await expect.element(screen.getByText('Ubuntu / 22.04 / 4 GiB')).toBeVisible()
  await expect
    .element(screen.getByRole('option', { name: 'arch-2022-06-01' }))
    .not.toBeInTheDocument()
  await screen.getByRole('option', { name: /ubuntu-22-04/ }).click()

  await expect.element(combobox).toHaveValue('ubuntu-22-04')
  await expect.element(screen.getByText('Selected: image-1')).toBeVisible()
})
