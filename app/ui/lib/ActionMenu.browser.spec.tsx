/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'

import { ActionMenu, type QuickActionItem } from './ActionMenu'

const navigationItems: QuickActionItem[] = [
  { value: 'db1', navGroup: 'Go to instance', action: '/instances/db1' },
  { value: 'db2', navGroup: 'Go to instance', action: '/instances/db2' },
]

function ActionMenuHarness() {
  const [isOpen, setIsOpen] = useState(true)
  const [action, setAction] = useState('none')
  const items: QuickActionItem[] = [
    {
      value: 'New instance',
      navGroup: 'Actions',
      action: () => setAction('New instance'),
    },
    ...navigationItems,
  ]

  return (
    <MemoryRouter>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open quick actions
      </button>
      <output>Action: {action}</output>
      <ActionMenu
        aria-label="Quick actions"
        isOpen={isOpen}
        items={items}
        onDismiss={() => setIsOpen(false)}
      />
    </MemoryRouter>
  )
}

test('navigates options with arrow keys and wraps at the ends', async () => {
  const screen = await render(<ActionMenuHarness />)
  const selected = screen.getByRole('option', { selected: true })

  await expect.element(selected).toHaveTextContent('New instance')
  await userEvent.keyboard('{ArrowDown}')
  await expect.element(selected).toHaveTextContent('db1')
  await userEvent.keyboard('{ArrowUp}{ArrowUp}')
  await expect.element(selected).toHaveTextContent('db2')
})

test('filters items and resets the search when dismissed', async () => {
  const screen = await render(<ActionMenuHarness />)
  const search = screen.getByPlaceholder('Search')

  await search.fill('db1')
  await expect.element(screen.getByRole('option', { name: 'db1' })).toBeVisible()
  await expect
    .element(screen.getByRole('option', { name: 'New instance' }))
    .not.toBeInTheDocument()

  await userEvent.keyboard('{Escape}')
  await expect
    .element(screen.getByRole('dialog', { name: 'Quick actions' }))
    .not.toBeInTheDocument()
  await screen.getByRole('button', { name: 'Open quick actions' }).click()

  await expect.element(search).toHaveValue('')
  await expect.element(screen.getByRole('option', { name: 'New instance' })).toBeVisible()
  await expect
    .element(screen.getByRole('option', { selected: true }))
    .toHaveTextContent('New instance')
})

test('invokes the selected action with Enter and dismisses the menu', async () => {
  const screen = await render(<ActionMenuHarness />)

  await userEvent.keyboard('{Enter}')

  await expect.element(screen.getByText('Action: New instance')).toBeVisible()
  await expect
    .element(screen.getByRole('dialog', { name: 'Quick actions' }))
    .not.toBeInTheDocument()
})

test('dismisses with Escape', async () => {
  const screen = await render(<ActionMenuHarness />)

  await userEvent.keyboard('{Escape}')

  await expect
    .element(screen.getByRole('dialog', { name: 'Quick actions' }))
    .not.toBeInTheDocument()
})
