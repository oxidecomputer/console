/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { user3, user4 } from '@oxide/api-mocks'

import { expect, expectNotVisible, expectRowVisible, expectVisible, test } from './utils'

test('Click through project access page', async ({ page }) => {
  await page.goto('/projects/mock-project')
  await page.click('role=link[name*="Access"]')

  // page is there, we see user 1 and 3 but not 2 or 4
  await expectVisible(page, ['role=heading[name*="Access"]'])
  const table = page.locator('table')
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    Type: 'User',
    Role: 'silo.admin',
  })
  await expectRowVisible(table, {
    Name: 'Jacob Klein',
    Type: 'User',
    Role: 'project.collaborator',
  })
  await expectRowVisible(table, {
    Name: 'real-estate-devs',
    Type: 'Group',
    Role: 'silo.collaborator',
  })
  await expectRowVisible(table, {
    Name: 'kernel-devs',
    Type: 'Group',
    Role: 'project.viewer',
  })

  await expectNotVisible(page, [
    `role=cell[name="Hans Jonas"]`,
    `role=cell[name="Simone de Beauvoir"]`,
  ])

  // Add user 4 as collab
  await page.click('role=button[name="Add user or group"]')
  await expectVisible(page, ['role=heading[name*="Add user or group"]'])

  await page.click('role=button[name*="User or group"]')
  // only users not already on the project should be visible
  await expectNotVisible(page, ['role=option[name="Jacob Klein"]'])

  await expectVisible(page, [
    'role=option[name="Hannah Arendt"]',
    'role=option[name="Hans Jonas"]',
    'role=option[name="Simone de Beauvoir"]',
  ])

  await page.click('role=option[name="Simone de Beauvoir"]')

  await page.click('role=button[name*="Role"]')
  await expectVisible(page, [
    'role=option[name="Admin"]',
    'role=option[name="Collaborator"]',
    'role=option[name="Viewer"]',
  ])

  await page.click('role=option[name="Collaborator"]')
  await page.click('role=button[name="Assign role"]')

  // User 4 shows up in the table
  await expectRowVisible(table, {
    Name: 'Simone de Beauvoir',
    Type: 'User',
    Role: 'project.collaborator',
  })

  // now change user 4 role from collab to viewer
  await page
    .locator('role=row', { hasText: user4.display_name })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')

  await expectVisible(page, [
    'role=heading[name*="Change project role for Simone de Beauvoir"]',
  ])
  await expectVisible(page, ['button:has-text("Collaborator")'])

  await page.click('role=button[name*="Role"]')
  await page.click('role=option[name="Viewer"]')
  await page.click('role=button[name="Update role"]')

  await expectRowVisible(table, { Name: user4.display_name, Role: 'project.viewer' })

  // now delete user 3. has to be 3 or 4 because they're the only ones that come
  // from the project policy
  const user3Row = page.getByRole('row', { name: user3.display_name, exact: false })
  await expect(user3Row).toBeVisible()
  await user3Row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(user3Row).toBeHidden()

  // now add a project role to user 1, who currently only has silo role
  await page.click('role=button[name="Add user or group"]')
  await page.click('role=button[name*="User or group"]')
  await page.click('role=option[name="Hannah Arendt"]')
  await page.click('role=button[name*="Role"]')
  await page.click('role=option[name="Viewer"]')
  await page.click('role=button[name="Assign role"]')
  // because we only show the "effective" role, we should still see the silo admin role, but should now have an additional count value
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    Type: 'User',
    Role: 'silo.admin+1',
  })
})
