/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { user3, user4 } from '@oxide/api-mocks'

import { expect, expectRowVisible, getPageAsUser, test } from './utils'

test('Project access shows and edits project role assignments', async ({ page }) => {
  await page.goto('/projects/mock-project')
  await page.getByRole('link', { name: 'Project Access' }).click()
  await expect(page).toHaveURL(/\/projects\/mock-project\/access$/)
  await expect(page.getByRole('heading', { name: 'Project Access' })).toBeVisible()

  // identities with a direct silo or project role appear; the effective role is
  // the strongest across silo and project
  const table = page.getByRole('table')
  await expectRowVisible(table, { Name: 'Hannah Arendt', Type: 'User', Role: 'silo.admin' })
  await expectRowVisible(table, {
    Name: 'Jacob Klein',
    Type: 'User',
    Role: 'project.collaborator',
  })
  await expectRowVisible(table, {
    Name: 'Herbert Marcuse',
    Type: 'User',
    Role: 'project.limited_collaborator',
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

  // identities with only an inherited (via-group) role or no role don't appear
  await expect(table.getByRole('cell', { name: 'Hans Jonas' })).toBeHidden()
  await expect(table.getByRole('cell', { name: 'Simone de Beauvoir' })).toBeHidden()

  // add Simone as collaborator
  await page.getByRole('button', { name: 'Add user or group' }).click()
  await expect(page.getByRole('heading', { name: 'Add user or group' })).toBeVisible()
  await page.getByRole('button', { name: 'User or group' }).click()
  // already-assigned identities aren't offered
  await expect(page.getByRole('option', { name: 'Jacob Klein' })).toBeHidden()
  await page.getByRole('option', { name: 'Simone de Beauvoir' }).click()
  await page.getByRole('radio', { name: /^Collaborator / }).click()
  await page.getByRole('button', { name: 'Assign role' }).click()
  await expectRowVisible(table, {
    Name: 'Simone de Beauvoir',
    Type: 'User',
    Role: 'project.collaborator',
  })

  // change Simone's role from collaborator to viewer
  await page
    .getByRole('row', { name: user4.display_name, exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Change project role' }).click()
  await expect(page.getByRole('heading', { name: 'Edit project role' })).toBeVisible()
  await expect(page.getByRole('radio', { name: /^Collaborator / })).toBeChecked()
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.getByRole('button', { name: 'Update role' }).click()
  await expectRowVisible(table, { Name: user4.display_name, Role: 'project.viewer' })

  // remove Jacob's project role
  const jacobRow = page.getByRole('row', { name: user3.display_name, exact: false })
  await jacobRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Remove project role' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(jacobRow).toBeHidden()

  // add a project role to Hannah, who has only a silo role. Because we show the
  // effective (strongest) role first, the badge stays silo.admin with a +1 for
  // the added project role
  await page.getByRole('button', { name: 'Add user or group' }).click()
  await page.getByRole('button', { name: 'User or group' }).click()
  await page.getByRole('option', { name: 'Hannah Arendt' }).click()
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.getByRole('button', { name: 'Assign role' }).click()
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    Type: 'User',
    Role: 'silo.admin+1',
  })
})

test('Inherited-only row offers Add project role, not a disabled Change', async ({
  page,
}) => {
  await page.goto('/projects/mock-project/access')
  const table = page.getByRole('table')

  // Hannah has only a silo role, so there's no project role to change, but a
  // project role can still be added from the row action. Remove is disabled
  // because the inherited silo role can only be changed on the silo page.
  await table
    .getByRole('row', { name: 'Hannah Arendt', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await expect(page.getByRole('menuitem', { name: 'Change project role' })).toBeHidden()
  await expect(page.getByRole('menuitem', { name: 'Add project role' })).toBeEnabled()
  const removeItem = page.getByRole('menuitem', { name: 'Remove project role' })
  await expect(removeItem).toBeDisabled()
  await removeItem.hover()
  await expect(page.getByRole('tooltip')).toHaveText('This role is inherited from the silo')

  await page.getByRole('menuitem', { name: 'Add project role' }).click()
  await expect(page.getByRole('heading', { name: 'Add project role' })).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('Hannah Arendt')
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.getByRole('button', { name: 'Add project role' }).click()

  // effective role is still silo.admin, with a +1 badge for the new project role
  await expectRowVisible(table, { Name: 'Hannah Arendt', Role: 'silo.admin+1' })
})

test('Non-admin cannot change or remove project roles', async ({ browser }) => {
  // Jacob Klein is only a project collaborator (not project admin or silo
  // collaborator/admin), so he lacks `modify` on the project and can't edit role
  // assignments. Both row actions should be disabled with an explanation.
  const page = await getPageAsUser(browser, 'Jacob Klein')
  await page.goto('/projects/mock-project/access')

  await expect(page.getByRole('heading', { name: 'Project Access' })).toBeVisible()

  await page
    .getByRole('row', { name: 'Herbert Marcuse', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()

  const changeRole = page.getByRole('menuitem', { name: 'Change project role' })
  await expect(changeRole).toBeDisabled()
  await changeRole.hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    "You don't have permission to change project roles"
  )

  const removeRole = page.getByRole('menuitem', { name: 'Remove project role' })
  await expect(removeRole).toBeDisabled()
  await removeRole.hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    "You don't have permission to remove project roles"
  )
})

test('Project access user details side modal', async ({ page }) => {
  await page.goto('/projects/mock-project')
  await page.getByRole('link', { name: 'Project Access' }).click()

  // clicking a user opens their details
  await page.getByRole('button', { name: 'Hannah Arendt' }).click()
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()
  await expect(modal.getByText('Hannah Arendt')).toBeVisible()

  // direct silo.admin assignment
  const roleRow = modal.getByRole('row').filter({ hasText: 'silo.admin' })
  await expect(roleRow).toContainText('Assigned')

  // group memberships (exact, since a role row also reads "via kernel-devs")
  await expect(modal.getByRole('cell', { name: 'kernel-devs', exact: true })).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'web-devs', exact: true })).toBeVisible()
})

test('Project access group members side modal', async ({ page }) => {
  await page.goto('/projects/mock-project')
  await page.getByRole('link', { name: 'Project Access' }).click()

  // clicking a group opens its members and roles
  await page.getByRole('button', { name: 'real-estate-devs' }).click()
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()
  await expect(modal.getByText('silo.collaborator')).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'Hans Jonas' })).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'Jane Austen' })).toBeVisible()
})
