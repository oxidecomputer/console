/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { commands, userEvent } from 'vitest/browser'

import { Combobox, toComboboxItems } from '~/ui/lib/Combobox'

import { Subform } from './Subform'

// Combobox's onClose behaves differently when the document is unfocused, and
// the test iframe's focus state is nondeterministic. See Combobox.browser.spec.tsx.
beforeEach(() => {
  vi.spyOn(document, 'hasFocus').mockReturnValue(true)
})

afterEach(() => {
  vi.restoreAllMocks()
})

const items = toComboboxItems([{ name: 'disk-3' }, { name: 'disk-4' }])

// Filling alone doesn't reliably leave the first option highlighted (Firefox
// CI pressed Enter with nothing active), so open the list and Home to it
// explicitly, like Combobox.browser.spec.tsx does
async function highlightFirstOption(screen: RenderResult, label: string) {
  const combobox = screen.getByRole('combobox', { name: label })
  await combobox.fill('disk')
  await commands.pressComboboxKey(label, 'ArrowDown')
  const option = screen.getByRole('option', { name: 'disk-3' })
  await expect.element(option).toBeVisible()
  await commands.pressComboboxKey(label, 'Home')
  await expect
    .element(combobox)
    .toHaveAttribute('aria-activedescendant', option.element().id)
}

function Harness() {
  const [inner, setInner] = useState('')
  const [outer, setOuter] = useState('')
  const [formSubmits, setFormSubmits] = useState(0)
  const [subformSubmits, setSubformSubmits] = useState(0)

  return (
    <form
      aria-label="Parent form"
      onSubmit={(event) => {
        event.preventDefault()
        setFormSubmits((count) => count + 1)
      }}
    >
      <Combobox
        items={items}
        label="Outer disk"
        selectedItemValue={outer}
        onChange={setOuter}
      />
      <Subform
        onSubmit={() => setSubformSubmits((count) => count + 1)}
        onClear={() => {}}
        addButtonLabel="Add"
        disabled={false}
      >
        <Combobox
          items={items}
          label="Inner disk"
          selectedItemValue={inner}
          onChange={setInner}
        />
        <input aria-label="Port" />
      </Subform>
      <button type="submit">Submit</button>
      <output>Inner: {inner || '(empty)'}</output>
      <output>Outer: {outer || '(empty)'}</output>
      <output>Form submits: {formSubmits}</output>
      <output>Subform submits: {subformSubmits}</output>
    </form>
  )
}

test('Enter selects while open, then submits the subform once closed', async () => {
  const screen = await render(<Harness />)

  await highlightFirstOption(screen, 'Inner disk')
  await commands.pressComboboxKey('Inner disk', 'Enter')
  await expect.element(screen.getByText('Inner: disk-3')).toBeVisible()
  await expect.element(screen.getByText('Subform submits: 0')).toBeVisible()

  await commands.pressComboboxKey('Inner disk', 'Enter')
  await expect.element(screen.getByText('Subform submits: 1')).toBeVisible()
  await expect.element(screen.getByText('Form submits: 0')).toBeVisible()
})

test('Enter in a text input submits the subform', async () => {
  const screen = await render(<Harness />)

  await screen.getByRole('textbox', { name: 'Port' }).fill('80')
  await userEvent.keyboard('{Enter}')
  await expect.element(screen.getByText('Subform submits: 1')).toBeVisible()
  await expect.element(screen.getByText('Form submits: 0')).toBeVisible()
})

test('Enter on the Add button submits the subform once', async () => {
  const screen = await render(<Harness />)

  const button = screen.getByRole('button', { name: 'Add' })
  // focus directly because WebKit doesn't Tab to buttons
  button.element().focus()
  await expect.element(button).toHaveFocus()
  await userEvent.keyboard('{Enter}')
  await expect.element(screen.getByText('Subform submits: 1')).toBeVisible()
  await expect.element(screen.getByText('Form submits: 0')).toBeVisible()
})

test('outside a subform, Enter in a closed combobox submits the form', async () => {
  const screen = await render(<Harness />)

  await highlightFirstOption(screen, 'Outer disk')
  await commands.pressComboboxKey('Outer disk', 'Enter')
  await expect.element(screen.getByText('Outer: disk-3')).toBeVisible()
  await expect.element(screen.getByText('Form submits: 0')).toBeVisible()

  await commands.pressComboboxKey('Outer disk', 'Enter')
  await expect.element(screen.getByText('Form submits: 1')).toBeVisible()
  await expect.element(screen.getByText('Subform submits: 0')).toBeVisible()
})
