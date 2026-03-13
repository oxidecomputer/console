/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { user3 } from '@oxide/api-mocks'

import { expect, expectRowVisible, expectVisible, test } from './utils'

test('Click through silo access page', async ({ page }) => {
  await page.goto('/')

  await page.click('role=link[name*="Access"]')

  await expectVisible(page, ['role=heading[name*="Access"]'])

  // Users tab is shown by default
  const table = page.locator('role=table')
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    'Silo Role': 'silo.admin',
  })

  // Navigate to Groups tab to check groups
  await page.getByRole('tab', { name: 'Silo Groups' }).click()
  await expectRowVisible(table, {
    Name: 'real-estate-devs',
    'Silo Role': 'silo.collaborator',
  })

  // Go back to Users tab to assign a role to Jacob Klein
  await page.getByRole('tab', { name: 'Silo Users' }).click()

  // Assign collaborator role to Jacob Klein via Change role action
  await page
    .locator('role=row', { hasText: user3.display_name })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')

  await expectVisible(page, ['role=heading[name*="Edit role"]'])
  await page.getByRole('radio', { name: /^Collaborator / }).click()
  await page.click('role=button[name="Update role"]')

  // Jacob Klein shows up with collaborator role
  await expectRowVisible(table, {
    Name: 'Jacob Klein',
    'Silo Role': 'silo.collaborator',
  })

  // now change Jacob Klein's role from collab to viewer
  await page
    .locator('role=row', { hasText: user3.display_name })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')

  await expectVisible(page, ['role=heading[name*="Edit role"]'])

  // Verify Collaborator is currently selected
  await expect(page.getByRole('radio', { name: /^Collaborator / })).toBeChecked()

  // Select Viewer role
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.click('role=button[name="Update role"]')

  await expectRowVisible(table, { Name: user3.display_name, 'Silo Role': 'silo.viewer' })

  // now remove Jacob Klein's silo role
  const user3Row = page.getByRole('row', { name: user3.display_name, exact: false })
  await expect(user3Row).toBeVisible()
  await user3Row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Remove role' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()

  // Row is still visible but silo role is now empty
  await expectRowVisible(table, { Name: user3.display_name, 'Silo Role': '—' })
})
