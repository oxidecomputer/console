/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, expectVisible, test } from './utils'

test('navigating away from SideModal form triggers nav guard', async ({ page }) => {
  const floatingIpsPage = '/projects/mock-project/floating-ips'
  const floatingIpName = 'my-floating-ip'
  const formModal = page.getByRole('dialog', { name: 'Create floating IP' })
  const confirmModal = page.getByRole('dialog', { name: 'Confirm navigation' })

  await page.goto(floatingIpsPage)
  await page.locator('text="New Floating IP"').click()

  await expectVisible(page, [
    'role=heading[name*="Create floating IP"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=button[name="Advanced"]',
    'role=button[name="Create floating IP"]',
  ])

  await page.fill('input[name=name]', floatingIpName)

  // form is now dirty, so clicking away should trigger the nav guard
  // await page.keyboard.press('Escape')
  await page.getByRole('link', { name: 'Instances' }).click({ force: true })
  await expect(confirmModal).toBeVisible()

  // go back to the form
  await page.getByRole('button', { name: 'Keep editing' }).click()
  await expect(confirmModal).toBeHidden()
  await expect(formModal).toBeVisible()

  // now try to navigate away again
  await page.keyboard.press('Escape')
  await expect(confirmModal).toBeVisible()
  await page.getByRole('button', { name: 'Leave form' }).click()
  await expect(confirmModal).toBeHidden()
  await expect(formModal).toBeHidden()
  await expect(page).toHaveURL(floatingIpsPage)
})
