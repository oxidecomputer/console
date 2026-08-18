/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'

import { Document16Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from './DocsPopover'

function DocsPopoverHarness() {
  return (
    <>
      <button type="button">Outside</button>
      <DocsPopover
        heading="disks"
        icon={<Document16Icon />}
        summary="Create, attach, and manage disks."
        links={[{ href: 'https://example.com/disks', linkText: 'Disks and Snapshots' }]}
      />
    </>
  )
}

test('opens contextual help with an external guide link', async () => {
  const screen = await render(<DocsPopoverHarness />)

  await screen.getByTitle('Learn about disks').click()

  await expect
    .element(screen.getByRole('heading', { name: 'Learn about disks' }))
    .toBeVisible()
  await expect.element(screen.getByText('Create, attach, and manage disks.')).toBeVisible()
  await expect
    .element(screen.getByRole('link', { name: 'Disks and Snapshots' }))
    .toHaveAttribute('target', '_blank')
})

test('closes with Escape and restores focus to the trigger', async () => {
  const screen = await render(<DocsPopoverHarness />)
  const trigger = screen.getByTitle('Learn about disks')

  await trigger.click()
  await userEvent.keyboard('{Escape}')

  await expect
    .element(screen.getByRole('heading', { name: 'Learn about disks' }))
    .not.toBeInTheDocument()
  await expect.element(trigger).toHaveFocus()
})

test('closes when an unobscured outside control is clicked', async () => {
  const screen = await render(<DocsPopoverHarness />)

  await screen.getByTitle('Learn about disks').click()
  await screen.getByRole('button', { name: 'Outside' }).click()

  await expect
    .element(screen.getByRole('heading', { name: 'Learn about disks' }))
    .not.toBeInTheDocument()
})
