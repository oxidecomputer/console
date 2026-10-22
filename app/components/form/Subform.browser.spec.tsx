/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
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

function Harness() {
  const [inner, setInner] = useState('')
  const [outer, setOuter] = useState('')
  const [formSubmits, setFormSubmits] = useState(0)
  const [subformSubmits, setSubformSubmits] = useState(0)
  const [clicks, setClicks] = useState(0)

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
      <Subform onSubmit={() => setSubformSubmits((count) => count + 1)}>
        <Combobox
          items={items}
          label="Inner disk"
          selectedItemValue={inner}
          onChange={setInner}
        />
        <input aria-label="Port" />
        <button type="button" onClick={() => setClicks((count) => count + 1)}>
          Add
        </button>
      </Subform>
      <button type="submit">Submit</button>
      <output>Inner: {inner || '(empty)'}</output>
      <output>Outer: {outer || '(empty)'}</output>
      <output>Form submits: {formSubmits}</output>
      <output>Subform submits: {subformSubmits}</output>
      <output>Add clicks: {clicks}</output>
    </form>
  )
}

test('Enter selects while open, then submits the subform once closed', async () => {
  const screen = await render(<Harness />)

  await screen.getByRole('combobox', { name: 'Inner disk' }).fill('disk')
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

test('Enter on a button in the subform activates the button only', async () => {
  const screen = await render(<Harness />)

  const button = screen.getByRole('button', { name: 'Add' })
  // focus directly because WebKit doesn't Tab to buttons
  button.element().focus()
  await expect.element(button).toHaveFocus()
  await userEvent.keyboard('{Enter}')
  await expect.element(screen.getByText('Add clicks: 1')).toBeVisible()
  await expect.element(screen.getByText('Subform submits: 0')).toBeVisible()
  await expect.element(screen.getByText('Form submits: 0')).toBeVisible()
})

test('outside a subform, Enter in a closed combobox submits the form', async () => {
  const screen = await render(<Harness />)

  await screen.getByRole('combobox', { name: 'Outer disk' }).fill('disk')
  await commands.pressComboboxKey('Outer disk', 'Enter')
  await expect.element(screen.getByText('Outer: disk-3')).toBeVisible()
  await expect.element(screen.getByText('Form submits: 0')).toBeVisible()

  await commands.pressComboboxKey('Outer disk', 'Enter')
  await expect.element(screen.getByText('Form submits: 1')).toBeVisible()
  await expect.element(screen.getByText('Subform submits: 0')).toBeVisible()
})
