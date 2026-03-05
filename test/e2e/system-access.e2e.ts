/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { user3 } from '@oxide/api-mocks'

import { expect, expectRowVisible, expectToast, getPageAsUser, test } from './utils'

test('Click through system access page', async ({ page }) => {
  await page.goto('/system/access')

  const table = page.getByRole('table')

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
  await page.getByRole('button', { name: 'Add user or group' }).click()
  await expect(page.getByRole('heading', { name: /Add user or group/ })).toBeVisible()

  await page.getByRole('button', { name: /User or group/ }).click()
  // users already assigned should not be in the list
  await expect(page.getByRole('option', { name: 'Hannah Arendt' })).toBeHidden()
  await expect(page.getByRole('option', { name: 'Jacob Klein' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'Hans Jonas' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'Simone de Beauvoir' })).toBeVisible()

  await page.getByRole('option', { name: 'Jacob Klein' }).click()
  await page.getByRole('radio', { name: /^Collaborator / }).click()
  await page.getByRole('button', { name: 'Assign role' }).click()

  // user 3 shows up in the table
  await expectRowVisible(table, {
    Name: 'Jacob Klein',
    Type: 'User',
    Role: 'fleet.collaborator',
  })

  // change user 3's role from collaborator to viewer
  await page
    .getByRole('row', { name: user3.display_name, exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Change role' }).click()

  await expect(page.getByRole('heading', { name: /Edit role/ })).toBeVisible()
  await expect(page.getByRole('radio', { name: /^Collaborator / })).toBeChecked()

  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.getByRole('button', { name: 'Update role' }).click()

  await expectRowVisible(table, { Name: user3.display_name, Role: 'fleet.viewer' })

  // delete user 3
  const user3Row = page.getByRole('row', { name: user3.display_name, exact: false })
  await expect(user3Row).toBeVisible()
  await user3Row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Access removed')
  await expect(user3Row).toBeHidden()
})

test('Add a group to system access', async ({ page }) => {
  await page.goto('/system/access')

  const table = page.getByRole('table')

  // groups should not already be in the table
  await expect(page.getByRole('cell', { name: 'web-devs' })).toBeHidden()

  await page.getByRole('button', { name: 'Add user or group' }).click()
  await page.getByRole('button', { name: /User or group/ }).click()

  // groups appear before users in the picker, with a "Group" badge
  await expect(page.getByRole('option', { name: /web-devs/ })).toBeVisible()
  await expect(page.getByRole('option', { name: /kernel-devs/ })).toBeVisible()

  await page.getByRole('option', { name: /web-devs/ }).click()
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.getByRole('button', { name: 'Assign role' }).click()

  await expectRowVisible(table, {
    Name: 'web-devs',
    Type: 'Group',
    Role: 'fleet.viewer',
  })
})

test('Self-removal warning on delete', async ({ page }) => {
  await page.goto('/system/access')

  // Hannah Arendt is the logged-in user with fleet admin
  const hannahRow = page.getByRole('row', { name: 'Hannah Arendt', exact: false })
  await hannahRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()

  // confirm dialog should show the self-removal warning
  await expect(page.getByText('This will remove your own fleet access.')).toBeVisible()

  // cancel instead of confirming
  await page.getByRole('button', { name: 'Cancel' }).click()
})

test('Fleet viewer cannot modify system access', async ({ browser }) => {
  const page = await getPageAsUser(browser, 'Jane Austen')
  await page.goto('/system/access')

  const table = page.getByRole('table')
  await expect(page.getByRole('heading', { name: /System Access/ })).toBeVisible()
  await expectRowVisible(table, { Name: 'Hannah Arendt', Role: 'fleet.admin' })

  // attempt to add a user — the submit should fail with 403
  await page.getByRole('button', { name: 'Add user or group' }).click()
  await page.getByRole('button', { name: /User or group/ }).click()
  await page.getByRole('option', { name: 'Jacob Klein' }).click()
  await page.getByRole('button', { name: 'Assign role' }).click()
  await expect(page.getByText('Action not authorized')).toBeVisible()

  // dismiss the modal and confirm the table is unchanged
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('cell', { name: 'Jacob Klein' })).toBeHidden()
})
