/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { clickRowAction, expect, expectRowVisible, expectVisible, test } from './utils'

const floatingIpsPage = '/projects/mock-project/floating-ips'
const originalName = 'cola-float'
const updatedName = 'updated-cola-float'
const updatedDescription = 'An updated description for this Floating IP'
const expectedFormElements = [
  'role=heading[name*="Edit floating IP"]',
  'role=textbox[name="Name"]',
  'role=textbox[name="Description"]',
  'role=button[name="Save changes"]',
]

test('can update a floating IP', async ({ page }) => {
  await page.goto(floatingIpsPage)
  await clickRowAction(page, 'cola-float', 'Edit')
  await expectVisible(page, expectedFormElements)

  await page.fill('input[name=name]', updatedName)
  await page.getByRole('textbox', { name: 'Description' }).fill(updatedDescription)
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page).toHaveURL(floatingIpsPage)
  await expectRowVisible(page.getByRole('table'), {
    name: updatedName,
    description: updatedDescription,
  })
})

// Make sure that it still works even if the name doesn't change
test('can update *just* the floating IP description', async ({ page }) => {
  // Go to the edit page for the original floating IP
  await page.goto(`${floatingIpsPage}/${originalName}/edit`)
  await expectVisible(page, expectedFormElements)

  await page.getByRole('textbox', { name: 'Description' }).fill(updatedDescription)
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page).toHaveURL(floatingIpsPage)
  await expectRowVisible(page.getByRole('table'), {
    name: originalName,
    description: updatedDescription,
  })
})
