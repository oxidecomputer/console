/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { clickRowAction, expectRowVisible } from './utils'

test('SSH keys', async ({ page }) => {
  await page.goto('/settings/ssh-keys')

  // see table with the ssh key
  await expect(page.getByRole('heading', { name: 'SSH Keys' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'm1-macbook-pro' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'mac-mini' })).toBeVisible()

  // click name to open side modal
  await page.getByRole('link', { name: 'm1-macbook-pro' }).click()

  // verify side modal content
  const modal = page.getByRole('dialog', { name: 'View SSH key' })
  await expect(modal).toBeVisible()
  await expect(modal.getByRole('heading', { name: 'm1-macbook-pro' })).toBeVisible()

  const propertiesTable = modal.locator('.properties-table')
  await expect(propertiesTable.getByText('ID')).toBeVisible()
  await expect(propertiesTable.getByText('Created')).toBeVisible()
  await expect(propertiesTable.getByText('Updated')).toBeVisible()

  // verify form fields are present and disabled
  await expect(modal.getByRole('textbox', { name: 'Name' })).toBeDisabled()
  await expect(modal.getByRole('textbox', { name: 'Description' })).toBeDisabled()
  await expect(modal.getByRole('textbox', { name: 'Public key' })).toBeDisabled()

  // close modal
  await modal.getByRole('button', { name: 'Close' }).click()
  await expect(modal).toBeHidden()

  // delete the two ssh keys
  await clickRowAction(page, 'm1-macbook-pro', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(page.getByRole('cell', { name: 'm1-macbook-pro' })).toBeHidden()

  await clickRowAction(page, 'mac-mini', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()

  // should show empty state
  await expect(page.getByText('No SSH keys')).toBeVisible()

  // there are two of these, but it doesn't matter which one we click
  await page.getByRole('button', { name: 'Add SSH key' }).click()

  // fill out form and submit
  await page.getByRole('textbox', { name: 'Name' }).fill('my-key')
  await page.getByRole('textbox', { name: 'Description' }).fill('definitely a key')
  await page.getByRole('textbox', { name: 'Public key' }).fill('key contents')
  await page.getByRole('dialog').getByRole('button', { name: 'Add SSH key' }).click()

  // it's there in the table
  await expect(page.getByText('No SSH keys')).toBeHidden()
  const table = page.getByRole('table')
  await expectRowVisible(table, { name: 'my-key', description: 'definitely a key' })

  // now delete it
  await page.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(page.getByRole('cell', { name: 'my-key' })).toBeHidden()
  await expect(page.getByText('No SSH keys')).toBeVisible()
})
