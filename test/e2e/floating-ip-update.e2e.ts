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

test('can update a Floating IP', async ({ page }) => {
  await page.goto(floatingIpsPage)
  await clickRowAction(page, 'cola-float', 'Edit')

  await expectVisible(page, [
    'role=heading[name*="Edit floating IP"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=button[name="Save changes"]',
  ])

  await page.fill('input[name=name]', updatedName)
  await page.getByRole('textbox', { name: 'Description' }).fill(updatedDescription)

  await page.getByRole('button', { name: 'Save changes' }).click()

  await expect(page).toHaveURL(floatingIpsPage)

  await expectRowVisible(page.getByRole('table'), {
    name: updatedName,
    description: updatedDescription,
  })
})

test('updating a Floating IP description works (even without updating name)', async ({
  page,
}) => {
  await page.goto(floatingIpsPage)
  await clickRowAction(page, originalName, 'Edit')

  await expectVisible(page, [
    'role=heading[name*="Edit floating IP"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=button[name="Save changes"]',
  ])

  const updatedDescription = 'An updated description for this Floating IP'
  await page.getByRole('textbox', { name: 'Description' }).fill(updatedDescription)
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page).toHaveURL(floatingIpsPage)
  await expectRowVisible(page.getByRole('table'), {
    name: originalName,
    description: updatedDescription,
  })
})
