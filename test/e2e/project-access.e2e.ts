/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { user3, user4 } from '@oxide/api-mocks'

import { closeToast, expect, expectRowVisible, expectVisible, test } from './utils'

test('Click through project access page', async ({ page }) => {
  await page.goto('/projects/mock-project')
  await page.click('role=link[name*="Access"]')

  await expectVisible(page, ['role=heading[name*="Access"]'])

  // Users tab is shown by default
  const table = page.locator('table')
  // Hannah is in kernel-devs which has project.viewer, so she starts with silo.admin+1
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    Role: 'silo.admin+1',
  })
  await expectRowVisible(table, {
    Name: 'Jacob Klein',
    Role: 'project.collaborator',
  })
  await expectRowVisible(table, {
    Name: 'Herbert Marcuse',
    Role: 'project.limited_collaborator',
  })

  // Navigate to Groups tab to check groups
  await page.getByRole('tab', { name: 'Project Groups' }).click()
  await expectRowVisible(table, {
    Name: 'real-estate-devs',
    Role: 'silo.collaborator',
  })
  await expectRowVisible(table, {
    Name: 'kernel-devs',
    Role: 'project.viewer',
  })

  // Go back to Users tab
  await page.getByRole('tab', { name: 'Project Users' }).click()

  // Assign collaborator role to Simone de Beauvoir (no existing project role)
  await page
    .locator('role=row', { hasText: 'Simone de Beauvoir' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')
  await page.getByRole('radio', { name: /^Collaborator / }).click()
  await page.click('role=button[name="Update role"]')

  // Simone de Beauvoir now has collaborator role
  await expectRowVisible(table, {
    Name: 'Simone de Beauvoir',
    Role: 'project.collaborator',
  })

  // now change user 4 role from collab to viewer
  await page
    .locator('role=row', { hasText: user4.display_name })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')

  await expectVisible(page, ['role=heading[name*="Edit role"]'])

  // Verify Collaborator is currently selected
  await expect(page.getByRole('radio', { name: /^Collaborator / })).toBeChecked()

  // Select Viewer role
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.click('role=button[name="Update role"]')

  await expectRowVisible(table, { Name: user4.display_name, Role: 'project.viewer' })

  // now remove user 3's project role. has to be 3 or 4 because they're the only ones
  // that come from the project policy
  const user3Row = page.getByRole('row', { name: user3.display_name, exact: false })
  await expect(user3Row).toBeVisible()
  await user3Row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Remove role' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()

  // Row is still visible but project role is now empty
  await expectRowVisible(table, { Name: user3.display_name, Role: '—' })
})

test('Group role change propagates to user effective role', async ({ page }) => {
  await page.goto('/projects/mock-project')
  await page.click('role=link[name*="Access"]')

  // On the Project Users tab by default; Jane Austen has silo.collaborator via group
  const table = page.locator('table')
  await expectRowVisible(table, { Name: 'Jane Austen', Role: 'silo.collaborator' })

  // Verify the tooltip on her role shows it's via real-estate-devs
  const janeRow = table.locator('role=row', { hasText: 'Jane Austen' })
  await janeRow.getByRole('button', { name: 'Tip' }).hover()
  await expect(page.locator('.ox-tooltip')).toContainText('real-estate-devs')

  // Navigate to Project Groups tab and change real-estate-devs to project.admin
  await page.getByRole('tab', { name: 'Project Groups' }).click()
  // Wait for the groups table to load before interacting
  await expectRowVisible(table, { Name: 'real-estate-devs', Role: 'silo.collaborator' })
  await table
    .locator('role=row', { hasText: 'real-estate-devs' })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.click('role=menuitem[name="Change role"]')
  await page.getByRole('radio', { name: /^Admin / }).click()
  await page.click('role=button[name="Update role"]')

  // real-estate-devs now shows project.admin (plus silo.collaborator as +1)
  await expectRowVisible(table, { Name: 'real-estate-devs', Role: 'project.admin+1' })
  await closeToast(page)

  // Navigate back to Project Users tab; Jane now has project.admin as effective role
  await page.getByRole('tab', { name: 'Project Users' }).click()
  await expectRowVisible(table, { Name: 'Jane Austen', Role: 'project.admin+1' })
})
