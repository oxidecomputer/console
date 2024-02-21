/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { clickRowAction, expect, expectNotVisible, expectVisible, test } from './utils'

const floatingIpsPage = '/projects/mock-project/floating-ips'

test('can create a Floating IP', async ({ page }) => {
  await page.goto(floatingIpsPage)
  await page.locator('text="New Floating IP"').click()

  await expectVisible(page, [
    'role=heading[name*="Create Floating IP"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=button[name="Advanced"]',
    'role=button[name="Create Floating IP"]',
  ])

  const floatingIpName = 'my-floating-ip'
  await page.fill('input[name=name]', floatingIpName)
  await page.fill('textarea[name=description]', 'A description for this Floating IP')

  // accordion content should be hidden
  await expectNotVisible(page, ['role=textbox[name="Address"]'])

  // open accordion
  await page.getByRole('button', { name: 'Advanced' }).click()

  // accordion content should be visible
  await expectVisible(page, ['role=textbox[name="Address"]'])

  await page.getByRole('button', { name: 'Create Floating IP' }).click()

  await expect(page).toHaveURL(floatingIpsPage)

  await expectVisible(page, [
    `text=${floatingIpName}`,
    'text=A description for this Floating IP',
  ])
})

test('can detach and attach a Floating IP', async ({ page }) => {
  await page.goto(floatingIpsPage)

  await expectVisible(page, ['text=db1'])
  await clickRowAction(page, 'cola-float', 'Detach')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expectNotVisible(page, ['role=heading[name*="Detach Floating IP"]'])
  // Since we detached it, we don't expect to see db1 any longer
  await expectNotVisible(page, ['text=db1'])

  // Reattach it to db1
  await clickRowAction(page, 'cola-float', 'Attach')
  await page.locator('text="Select instance"').click()

  // Click the down arrow and select top option
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: 'Attach' }).click()

  // The dialog should be gone
  await expectNotVisible(page, ['role=heading[name*="Attach Floating IP"]'])
  await expectVisible(page, ['text=db1'])
})
