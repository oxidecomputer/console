/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { user3, user4 } from '@oxide/api-mocks'

import { expect, expectNotVisible, expectRowVisible, expectVisible, test } from './utils'

test('Click through silo access page', async ({ page }) => {
  await page.goto('/')

  const table = page.locator('role=table')

  // page is there, we see user 1 and 2 but not 3
  await page.click('role=link[name*="Access & IAM"]')

  await expectVisible(page, ['role=heading[name*="Access & IAM"]'])
  await expectRowVisible(table, {
    // no space because expectRowVisible uses textContent, not accessible name
    Name: 'real-estate-devsGroup',
    'Silo role': 'collaborator',
  })
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    'Silo role': 'admin',
  })
  await expectNotVisible(page, [`role=cell[name="${user4.display_name}"]`])

  // Add user 2 as collab
  await page.click('role=button[name="Add user or group"]')
  await expectVisible(page, ['role=heading[name*="Add user or group"]'])

  await page.click('role=button[name*="User or group"]')
  // only users not already on the org should be visible
  await expectNotVisible(page, ['role=option[name="Hannah Arendt"]'])
  await expectVisible(page, [
    'role=option[name="Hans Jonas"]',
    'role=option[name="Jacob Klein"]',
    'role=option[name="Simone de Beauvoir"]',
  ])

  await page.click('role=option[name="Jacob Klein"]')

  await page.click('role=button[name*="Role"]')
  await expectVisible(page, [
    'role=option[name="Admin"]',
    'role=option[name="Collaborator"]',
    'role=option[name="Viewer"]',
  ])

  await page.click('role=option[name="Collaborator"]')
  await page.click('role=button[name="Assign role"]')

  // User 3 shows up in the table
  await expectRowVisible(table, {
    Name: 'Jacob Klein',
    'Silo role': 'collaborator',
  })

  // now change user 3's role from collab to viewer
  await page
    .locator('role=row', { hasText: user3.display_name })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')

  await expectVisible(page, ['role=heading[name*="Change user role"]'])
  await expectVisible(page, ['button:has-text("Collaborator")'])

  await page.click('role=button[name*="Role"]')
  await page.click('role=option[name="Viewer"]')
  await page.click('role=button[name="Save changes"]')

  await expectRowVisible(table, { Name: user3.display_name, 'Silo role': 'viewer' })

  // now delete user 3
  const user3Row = page.getByRole('row', { name: user3.display_name, exact: false })
  await expect(user3Row).toBeVisible()
  await user3Row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(user3Row).toBeHidden()
})
