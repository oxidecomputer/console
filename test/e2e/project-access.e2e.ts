/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { user3 } from '@oxide/api-mocks'

import { expect, expectRowVisible, test } from './utils'

test('Project access lands on Groups tab; Users tab shows effective project roles', async ({
  page,
}) => {
  await page.goto('/projects/mock-project')
  await page.click('role=link[name*="Access"]')
  await expect(page.getByRole('heading', { name: /Access/ })).toBeVisible()
  await expect(page).toHaveURL(/\/access\/groups$/)

  // Groups tab: kernel-devs has direct project.viewer; real-estate-devs has
  // direct silo.collaborator only; web-devs has nothing
  let table = page.getByRole('table')
  await expectRowVisible(table, { Name: 'kernel-devs', Role: 'project.viewer' })
  await expectRowVisible(table, { Name: 'real-estate-devs', Role: 'silo.collaborator' })
  await expectRowVisible(table, { Name: 'web-devs', Role: '—' })

  // Switch to Users tab
  await page.getByRole('tab', { name: 'Users' }).click()
  await expect(page).toHaveURL(/\/access\/users$/)

  table = page.getByRole('table')
  // Hannah has direct silo.admin which dominates over kernel-devs project.viewer
  await expectRowVisible(table, { Name: 'Hannah Arendt', Role: 'silo.admin' })
  // Jacob has direct project.collaborator
  await expectRowVisible(table, { Name: 'Jacob Klein', Role: 'project.collaborator' })
  // Herbert has direct project.limited_collaborator
  await expectRowVisible(table, {
    Name: 'Herbert Marcuse',
    Role: 'project.limited_collaborator',
  })
  // Hans inherits silo.collaborator via real-estate-devs
  await expectRowVisible(table, { Name: 'Hans Jonas', Role: 'silo.collaborator' })
})

test('Change and remove a user project role from the Users tab', async ({ page }) => {
  await page.goto('/projects/mock-project/access/users')
  const table = page.getByRole('table')

  // Jacob Klein has direct project.collaborator — change to viewer
  await table
    .getByRole('row', { name: user3.display_name, exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Change project role' }).click()
  await expect(page.getByRole('heading', { name: /Edit role/ })).toBeVisible()
  await expect(page.getByRole('radio', { name: /^Collaborator / })).toBeChecked()
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.getByRole('button', { name: 'Update role' }).click()
  await expectRowVisible(table, { Name: user3.display_name, Role: 'project.viewer' })

  // Remove Jacob's direct project role; he has no other access so badge becomes —
  await table
    .getByRole('row', { name: user3.display_name, exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Remove project role' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(table, { Name: user3.display_name, Role: '—' })
})

test('Inherited silo role on Users tab shows Assign + disabled Remove', async ({
  page,
}) => {
  await page.goto('/projects/mock-project/access/users')
  const table = page.getByRole('table')

  // Hans Jonas inherits silo.collaborator via real-estate-devs but has no
  // direct project role — show "Assign project role", and disabled "Remove role"
  await table
    .getByRole('row', { name: 'Hans Jonas', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await expect(page.getByRole('menuitem', { name: 'Assign project role' })).toBeEnabled()
  await expect(page.getByRole('menuitem', { name: 'Change project role' })).toBeHidden()
  await expect(
    page.getByRole('menuitem', { name: 'Remove role', exact: true })
  ).toBeDisabled()

  // Assign opens the modal with no role pre-selected
  await page.getByRole('menuitem', { name: 'Assign project role' }).click()
  await expect(page.getByRole('heading', { name: /Assign role/ })).toBeVisible()
})

test('Assign a project role to an unassigned user', async ({ page }) => {
  await page.goto('/projects/mock-project/access/users')
  const table = page.getByRole('table')

  // Simone de Beauvoir has no roles at all
  await table
    .getByRole('row', { name: 'Simone de Beauvoir', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await expect(page.getByRole('menuitem', { name: 'Change project role' })).toBeHidden()
  await expect(page.getByRole('menuitem', { name: 'Remove role' })).toBeHidden()
  await page.getByRole('menuitem', { name: 'Assign project role' }).click()

  await expect(page.getByRole('heading', { name: /Assign role/ })).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('Simone de Beauvoir')

  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.getByRole('button', { name: 'Assign role' }).click()

  await expectRowVisible(table, {
    Name: 'Simone de Beauvoir',
    Role: 'project.viewer',
  })
})

test('Change and remove a group project role from the Groups tab', async ({ page }) => {
  await page.goto('/projects/mock-project/access/groups')
  const table = page.getByRole('table')

  // kernel-devs has direct project.viewer — change to collaborator
  await table
    .getByRole('row', { name: 'kernel-devs', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Change project role' }).click()
  await expect(page.getByRole('heading', { name: /Edit role/ })).toBeVisible()
  await expect(page.getByRole('radio', { name: /^Viewer / })).toBeChecked()
  await page.getByRole('radio', { name: /^Collaborator / }).click()
  await page.getByRole('button', { name: 'Update role' }).click()
  await expectRowVisible(table, { Name: 'kernel-devs', Role: 'project.collaborator' })

  // Remove the direct project role
  await table
    .getByRole('row', { name: 'kernel-devs', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Remove project role' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(table, { Name: 'kernel-devs', Role: '—' })
})

test('Assign stronger project role to a silo-only user, then remove it', async ({
  page,
}) => {
  await page.goto('/projects/mock-project/access/users')
  const table = page.getByRole('table')
  const janeRow = table.getByRole('row', { name: 'Jane Austen', exact: false })

  // Jane Austen is in real-estate-devs (silo.collaborator) and has no direct project role
  await expectRowVisible(table, { Name: 'Jane Austen', Role: 'silo.collaborator' })

  // Assign project.admin — stronger than her inherited silo.collaborator, so the
  // badge updates to project.admin (the role change gives us a sync point)
  await janeRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Assign project role' }).click()
  await expect(page.getByRole('heading', { name: /Assign role/ })).toBeVisible()
  await page.getByRole('radio', { name: /^Admin / }).click()
  await page.getByRole('button', { name: 'Assign role' }).click()
  await expectRowVisible(table, { Name: 'Jane Austen', Role: 'project.admin' })

  // Now that there's a direct project role, the row action menu should expose
  // "Change project role" instead of "Assign project role"
  await janeRow.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Change project role' })).toBeEnabled()
  await expect(page.getByRole('menuitem', { name: 'Assign project role' })).toBeHidden()

  // Remove the project role from the same menu; the row falls back to the
  // inherited silo role
  await page.getByRole('menuitem', { name: 'Remove project role' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(table, { Name: 'Jane Austen', Role: 'silo.collaborator' })
})

test('Group with only a silo role on Project Groups tab', async ({ page }) => {
  await page.goto('/projects/mock-project/access/groups')
  const table = page.getByRole('table')

  // real-estate-devs has direct silo.collaborator but no direct project role —
  // show "Assign project role", and disabled "Remove role"
  await table
    .getByRole('row', { name: 'real-estate-devs', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await expect(page.getByRole('menuitem', { name: 'Assign project role' })).toBeEnabled()
  await expect(page.getByRole('menuitem', { name: 'Change project role' })).toBeHidden()
  await expect(
    page.getByRole('menuitem', { name: 'Remove role', exact: true })
  ).toBeDisabled()
})
