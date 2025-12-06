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

  // page is there; we see user 1 and 2 but not 3
  await page.click('role=link[name*="Access"]')

  await expectVisible(page, ['role=heading[name*="Access"]'])
  await expectRowVisible(table, {
    Name: 'real-estate-devs',
    Type: 'Group',
    Role: 'silo.collaborator',
  })
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    Type: 'User',
    Role: 'silo.admin',
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
  await page.getByRole('radio', { name: /^Collaborator / }).click()
  await page.click('role=button[name="Assign role"]')

  // User 3 shows up in the table
  await expectRowVisible(table, {
    Name: 'Jacob Klein',
    Role: 'silo.collaborator',
    Type: 'User',
  })

  // now change user 3's role from collab to viewer
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

  await expectRowVisible(table, { Name: user3.display_name, Role: 'silo.viewer' })

  // now delete user 3
  const user3Row = page.getByRole('row', { name: user3.display_name, exact: false })
  await expect(user3Row).toBeVisible()
  await user3Row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(user3Row).toBeHidden()
})

test('Add user on All tab and verify on Users tab', async ({ page }) => {
  await page.goto('/access/all')

  // Start on the All tab
  await expectVisible(page, ['role=tab[name="All"][selected]'])

  const allTable = page.locator('table')

  // Add Hans Jonas as viewer
  await page.click('role=button[name="Add user or group"]')
  await expectVisible(page, ['role=heading[name*="Add user or group"]'])

  await page.click('role=button[name*="User or group"]')
  await page.click('role=option[name="Hans Jonas"]')
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.click('role=button[name="Assign role"]')

  // User shows up in the All tab table
  await expectRowVisible(allTable, {
    Name: 'Hans Jonas',
    Type: 'User',
    Role: 'silo.viewer',
  })

  // Navigate to Users tab
  await page.click('role=tab[name="Users"]')
  await expectVisible(page, ['role=tab[name="Users"][selected]'])

  // Verify the URL changed to /users
  await expect(page).toHaveURL(/\/access\/users$/)

  const usersTable = page.locator('table')

  // User should still be visible on Users tab
  await expectRowVisible(usersTable, {
    Name: 'Hans Jonas',
    Role: 'silo.viewer',
  })

  // Type column should not be present on Users tab (since all are users)
  await expectNotVisible(page, ['role=columnheader[name="Type"]'])

  // Navigate to Groups tab
  await page.click('role=tab[name="Groups"]')
  await expectVisible(page, ['role=tab[name="Groups"][selected]'])

  // Hans Jonas should NOT be visible on Groups tab
  await expectNotVisible(page, ['role=cell[name="Hans Jonas"]'])

  // Type column should not be present on Groups tab either
  await expectNotVisible(page, ['role=columnheader[name="Type"]'])

  // Go back to All tab and verify Hans Jonas is still there
  await page.click('role=tab[name="All"]')
  await expectVisible(page, ['role=tab[name="All"][selected]'])
  await expectRowVisible(allTable, {
    Name: 'Hans Jonas',
    Type: 'User',
    Role: 'silo.viewer',
  })
})
