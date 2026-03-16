/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { user3 } from '@oxide/api-mocks'

import { expect, expectRowVisible, expectVisible, test } from './utils'

test('Click through project access page', async ({ page }) => {
  await page.goto('/projects/mock-project')
  await page.click('role=link[name*="Access"]')
  await expectVisible(page, ['role=heading[name*="Access"]'])

  // Mixed table: groups first, then users
  const table = page.locator('table')
  await expectRowVisible(table, { Name: 'Hannah Arendt', Role: 'silo.admin' })
  await expectRowVisible(table, { Name: 'Jacob Klein', Role: 'project.collaborator' })
  await expectRowVisible(table, {
    Name: 'Herbert Marcuse',
    Role: 'project.limited_collaborator',
  })

  // Change Jacob Klein from collaborator to viewer
  await page
    .locator('role=row', { hasText: user3.display_name })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')
  await expectVisible(page, ['role=heading[name*="Edit role"]'])
  await expect(page.getByRole('radio', { name: /^Collaborator / })).toBeChecked()
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.click('role=button[name="Update role"]')
  await expectRowVisible(table, { Name: user3.display_name, Role: 'project.viewer' })

  // Remove Jacob Klein's project role; row disappears since he has no other access
  const user3Row = page.getByRole('row', { name: user3.display_name, exact: false })
  await expect(user3Row).toBeVisible()
  await user3Row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Remove role' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(table.locator('role=row', { hasText: user3.display_name })).toBeHidden()
})
