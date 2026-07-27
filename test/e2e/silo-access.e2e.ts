/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { user3, user4 } from '@oxide/api-mocks'

import {
  expect,
  expectNotVisible,
  expectRowVisible,
  expectVisible,
  getPageAsUser,
  test,
} from './utils'

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
  await page.click('role=menuitem[name="Change silo role"]')

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
  await page.getByRole('menuitem', { name: 'Remove silo role' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(user3Row).toBeHidden()
})

test('Non-admin cannot change or remove roles', async ({ browser }) => {
  // Hans Jonas is only a silo collaborator (via the real-estate-devs group), so
  // he lacks `modify` on the silo and can't change role assignments. Both row
  // actions should be disabled.
  const page = await getPageAsUser(browser, 'Hans Jonas')
  await page.goto('/access')

  await expect(page.getByRole('heading', { name: /Access/ })).toBeVisible()

  await page
    .getByRole('row', { name: 'Hannah Arendt', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()

  const changeRole = page.getByRole('menuitem', { name: 'Change silo role' })
  await expect(changeRole).toBeDisabled()
  await changeRole.hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    "You don't have permission to change roles"
  )

  const removeRole = page.getByRole('menuitem', { name: 'Remove silo role' })
  await expect(removeRole).toBeDisabled()
  await removeRole.hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    "You don't have permission to remove roles"
  )
})
