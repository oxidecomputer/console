/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { user3 } from '@oxide/api-mocks'

import { expect, expectNotVisible, expectRowVisible, expectVisible, test } from './utils'

test('Click through system access page', async ({ page }) => {
  await page.goto('/system/access')

  const table = page.locator('role=table')

  // initial fleet role assignments: Hannah Arendt (admin), Jane Austen (viewer)
  await expectVisible(page, ['role=heading[name*="Access"]'])
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    Type: 'User',
    Role: 'fleet.admin',
  })
  await expectRowVisible(table, {
    Name: 'Jane Austen',
    Type: 'User',
    Role: 'fleet.viewer',
  })
  await expectNotVisible(page, [`role=cell[name="${user3.display_name}"]`])

  // Add user 3 as collaborator
  await page.click('role=button[name="Add user or group"]')
  await expectVisible(page, ['role=heading[name*="Add user or group"]'])

  await page.click('role=button[name*="User or group"]')
  // users already assigned should not be in the list
  await expectNotVisible(page, ['role=option[name="Hannah Arendt"]'])
  await expectVisible(page, [
    'role=option[name="Jacob Klein"]',
    'role=option[name="Hans Jonas"]',
    'role=option[name="Simone de Beauvoir"]',
  ])

  await page.click('role=option[name="Jacob Klein"]')
  await page.getByRole('radio', { name: /^Collaborator / }).click()
  await page.click('role=button[name="Assign role"]')

  // user 3 shows up in the table
  await expectRowVisible(table, {
    Name: 'Jacob Klein',
    Type: 'User',
    Role: 'fleet.collaborator',
  })

  // change user 3's role from collaborator to viewer
  await page
    .locator('role=row', { hasText: user3.display_name })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')

  await expectVisible(page, ['role=heading[name*="Edit role"]'])
  await expect(page.getByRole('radio', { name: /^Collaborator / })).toBeChecked()

  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.click('role=button[name="Update role"]')

  await expectRowVisible(table, { Name: user3.display_name, Role: 'fleet.viewer' })

  // delete user 3
  const user3Row = page.getByRole('row', { name: user3.display_name, exact: false })
  await expect(user3Row).toBeVisible()
  await user3Row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(user3Row).toBeHidden()
})
