/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, expectRowVisible, expectVisible, test } from './utils'

test('Click through silo access page', async ({ page }) => {
  await page.goto('/')
  await page.click('role=link[name*="Access"]')
  await expectVisible(page, ['role=heading[name*="Access"]'])

  // Mixed table: groups first, then users
  const table = page.locator('role=table')
  await expectRowVisible(table, {
    Name: 'real-estate-devs',
    'Silo Role': 'silo.collaborator',
  })
  await expectRowVisible(table, { Name: 'Hannah Arendt', 'Silo Role': 'silo.admin' })
  // Hans Jonas is a member of real-estate-devs, so gets collaborator via group
  await expectRowVisible(table, { Name: 'Hans Jonas', 'Silo Role': 'silo.collaborator' })

  // Change real-estate-devs role from collaborator to viewer
  await table
    .locator('role=row', { hasText: 'real-estate-devs' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')
  await expectVisible(page, ['role=heading[name*="Edit role"]'])
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.click('role=button[name="Update role"]')
  await expectRowVisible(table, { Name: 'real-estate-devs', 'Silo Role': 'silo.viewer' })

  // Remove real-estate-devs role; row disappears since it now has no silo role
  await table
    .locator('role=row', { hasText: 'real-estate-devs' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Remove role"]')
  await page.click('role=button[name="Confirm"]')
  await expect(table.locator('role=row', { hasText: 'real-estate-devs' })).toBeHidden()
})

test('Group role change propagates to user effective role', async ({ page }) => {
  await page.goto('/')
  await page.click('role=link[name*="Access"]')

  const table = page.locator('role=table')
  // Jane Austen has collaborator via real-estate-devs group
  await expectRowVisible(table, { Name: 'Jane Austen', 'Silo Role': 'silo.collaborator' })

  // Verify her role tip shows via real-estate-devs
  const janeRow = table.locator('role=row', { hasText: 'Jane Austen' })
  await janeRow.getByRole('button', { name: 'Tip' }).hover()
  await expect(page.locator('.ox-tooltip')).toContainText('real-estate-devs')

  // Change real-estate-devs role to admin
  await table
    .locator('role=row', { hasText: 'real-estate-devs' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')
  await page.getByRole('radio', { name: /^Admin / }).click()
  await page.click('role=button[name="Update role"]')

  // Jane Austen now shows admin as effective role (inherited via real-estate-devs)
  await expectRowVisible(table, { Name: 'Jane Austen', 'Silo Role': 'silo.admin' })
})
