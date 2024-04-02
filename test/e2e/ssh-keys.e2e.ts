/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { test } from '@playwright/test'

import { expectNotVisible, expectRowVisible, expectVisible } from './utils'

test('SSH keys', async ({ page }) => {
  await page.goto('/settings/ssh-keys')

  // see table with the ssh key
  await expectVisible(page, [
    'role=heading[name*="SSH Keys"]',
    'role=cell[name="m1-macbook-pro"]',
    'role=cell[name="mac-mini"]',
  ])

  // delete the two ssh keys
  await page.click('role=button[name="Row actions"]')
  await page.click('role=menuitem[name="Delete"]')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expectNotVisible(page, ['role=cell[name="m1-macbook-pro"]'])

  await page.click('role=button[name="Row actions"]')
  await page.click('role=menuitem[name="Delete"]')
  await page.getByRole('button', { name: 'Confirm' }).click()

  // should show empty state
  await expectVisible(page, ['text="No SSH keys"'])

  // there are two of these, but it doesn't matter which one we click
  await page.click('role=button[name="Add SSH key"]')

  // fill out form and submit
  await page.fill('role=textbox[name="Name"]', 'my-key')
  await page.fill('role=textbox[name="Description"]', 'definitely a key')
  await page.fill('role=textbox[name="Public key"]', 'key contents')
  await page.getByRole('dialog').getByRole('button', { name: 'Add SSH key' }).click()

  // it's there in the table
  await expectNotVisible(page, ['text="No SSH keys"'])
  const table = page.getByRole('table')
  await expectRowVisible(table, { name: 'my-key', description: 'definitely a key' })

  // now delete it
  await page.click('role=button[name="Row actions"]')
  await page.click('role=menuitem[name="Delete"]')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expectNotVisible(page, ['role=cell[name="my-key"]'])
  await expectVisible(page, ['text="No SSH keys"'])
})
