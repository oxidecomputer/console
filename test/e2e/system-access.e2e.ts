/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { user3 } from '@oxide/api-mocks'

import { expect, expectRowVisible, getPageAsUser, test } from './utils'

test('Click through system access page', async ({ page }) => {
  await page.goto('/system/access')

  const table = page.locator('role=table')

  // initial fleet role assignments: Hannah Arendt (admin), Jane Austen (viewer)
  await expect(page.getByRole('heading', { name: /System Access/ })).toBeVisible()
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
  await expect(page.getByRole('cell', { name: user3.display_name })).toBeHidden()

  // Add user 3 as collaborator
  await page.click('role=button[name="Add user or group"]')
  await expect(page.getByRole('heading', { name: /Add user or group/ })).toBeVisible()

  await page.click('role=button[name*="User or group"]')
  // users already assigned should not be in the list
  await expect(page.getByRole('option', { name: 'Hannah Arendt' })).toBeHidden()
  await expect(page.getByRole('option', { name: 'Jacob Klein' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'Hans Jonas' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'Simone de Beauvoir' })).toBeVisible()

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

  await expect(page.getByRole('heading', { name: /Edit role/ })).toBeVisible()
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

test('Fleet viewer cannot modify system access', async ({ browser }) => {
  const page = await getPageAsUser(browser, 'Jane Austen')
  await page.goto('/system/access')

  const table = page.locator('role=table')
  await expect(page.getByRole('heading', { name: /System Access/ })).toBeVisible()
  await expectRowVisible(table, { Name: 'Hannah Arendt', Role: 'fleet.admin' })

  // attempt to add a user — the submit should fail with 403
  await page.click('role=button[name="Add user or group"]')
  await page.click('role=button[name*="User or group"]')
  await page.click('role=option[name="Jacob Klein"]')
  await page.click('role=button[name="Assign role"]')
  await expect(page.getByRole('heading', { name: 'Error' })).toBeVisible()
  await expect(page.getByText('Action not authorized')).toBeVisible()

  // dismiss the modal and confirm the table is unchanged
  await page.click('role=button[name="Cancel"]')
  await expect(page.getByRole('cell', { name: 'Jacob Klein' })).toBeHidden()
})
