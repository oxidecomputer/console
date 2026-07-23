/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, expectRowVisible, getPageAsUser, test } from './utils'

test('Silo Access page shows and edits silo role assignments', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Silo Access' }).click()
  await expect(page).toHaveURL(/\/access$/)
  await expect(page.getByRole('heading', { name: 'Silo Access' })).toBeVisible()

  // only identities with a direct silo role appear
  const table = page.getByRole('table')
  await expectRowVisible(table, {
    Name: 'real-estate-devs',
    Type: 'Group',
    Role: 'silo.collaborator',
  })
  await expectRowVisible(table, { Name: 'Hannah Arendt', Type: 'User', Role: 'silo.admin' })

  // add Jacob Klein as collaborator
  await page.getByRole('button', { name: 'Add user or group' }).click()
  await expect(page.getByRole('heading', { name: 'Add user or group' })).toBeVisible()
  await page.getByRole('button', { name: 'User or group' }).click()
  // already-assigned identities aren't offered
  await expect(page.getByRole('option', { name: 'Hannah Arendt' })).toBeHidden()
  await page.getByRole('option', { name: 'Jacob Klein' }).click()
  await page.getByRole('radio', { name: /^Collaborator / }).click()
  await page.getByRole('button', { name: 'Assign role' }).click()
  await expectRowVisible(table, {
    Name: 'Jacob Klein',
    Type: 'User',
    Role: 'silo.collaborator',
  })

  // change Jacob's role to viewer
  await table
    .getByRole('row', { name: 'Jacob Klein', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Change silo role' }).click()
  await expect(page.getByRole('heading', { name: 'Edit silo role' })).toBeVisible()
  await expect(page.getByRole('radio', { name: /^Collaborator / })).toBeChecked()
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.getByRole('button', { name: 'Update role' }).click()
  await expectRowVisible(table, { Name: 'Jacob Klein', Role: 'silo.viewer' })

  // remove Jacob's role
  const jacobRow = page.getByRole('row', { name: 'Jacob Klein', exact: false })
  await jacobRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Remove silo role' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(jacobRow).toBeHidden()
})

test('Non-admin cannot change or remove silo roles', async ({ browser }) => {
  // Hans Jonas is only a silo collaborator (via the real-estate-devs group), so
  // he lacks `modify` on the silo and can't edit role assignments. Both row
  // actions should be disabled with an explanation.
  const page = await getPageAsUser(browser, 'Hans Jonas')
  await page.goto('/access')

  await expect(page.getByRole('heading', { name: 'Silo Access' })).toBeVisible()

  await page
    .getByRole('row', { name: 'Hannah Arendt', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()

  const changeRole = page.getByRole('menuitem', { name: 'Change silo role' })
  await expect(changeRole).toBeDisabled()
  await changeRole.hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    "You don't have permission to change silo roles"
  )

  const removeRole = page.getByRole('menuitem', { name: 'Remove silo role' })
  await expect(removeRole).toBeDisabled()
  await removeRole.hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    "You don't have permission to remove silo roles"
  )
})

test('Silo Access user details side modal', async ({ page }) => {
  await page.goto('/access')

  // clicking a user opens their details
  await page.getByRole('button', { name: 'Hannah Arendt' }).click()
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()
  await expect(modal.getByText('Hannah Arendt')).toBeVisible()

  // direct silo.admin assignment
  const roleRow = modal.getByRole('row').filter({ hasText: 'silo.admin' })
  await expect(roleRow).toContainText('Assigned')

  // group memberships
  await expect(modal.getByRole('cell', { name: 'kernel-devs', exact: true })).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'web-devs', exact: true })).toBeVisible()
})

test('Silo Access group members side modal', async ({ page }) => {
  await page.goto('/access')

  // clicking a group opens its members and roles
  await page.getByRole('button', { name: 'real-estate-devs' }).click()
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()
  await expect(modal.getByText('silo.collaborator')).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'Hans Jonas' })).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'Jane Austen' })).toBeVisible()
})

test('Users & Groups page lands on Users tab; shows direct + via-group silo roles', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Users & Groups' }).click()
  await expect(page).toHaveURL(/\/users$/)
  await expect(page.getByRole('heading', { name: 'Users & Groups' })).toBeVisible()

  const table = page.getByRole('table')

  // Hannah has a direct silo.admin assignment; Groups column shows the first
  // group (kernel-devs) and "+1" for web-devs
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    Role: 'silo.admin',
    Groups: 'kernel-devs+1',
  })

  // Hans Jonas has no direct role but inherits silo.collaborator from real-estate-devs
  await expectRowVisible(table, {
    Name: 'Hans Jonas',
    Role: 'silo.collaborator',
    Groups: 'real-estate-devs',
  })

  // Jacob Klein has no silo role and no groups
  await expectRowVisible(table, { Name: 'Jacob Klein', Role: '—', Groups: '—' })

  // Jane Austen has a direct silo.viewer role but inherits the stronger
  // silo.collaborator via real-estate-devs, so her effective role is
  // collaborator with a "+1" revealing the other role
  await expectRowVisible(table, {
    Name: 'Jane Austen',
    Role: 'silo.collaborator+1',
    Groups: 'real-estate-devs',
  })

  // hovering the +1 lists the other role and where it comes from
  const janeRow = table.getByRole('row', { name: 'Jane Austen', exact: false })
  await janeRow.getByText('+1').hover()
  const tooltip = page.getByRole('tooltip')
  await expect(tooltip).toContainText('Other roles')
  await expect(tooltip).toContainText('silo.viewer')
  await expect(tooltip).toContainText('Assigned')

  // Groups tab comes second
  await page.getByRole('tab', { name: 'Groups' }).click()
  await expect(page).toHaveURL(/\/groups$/)
})

test('User details side modal shows assigned + via-group roles and group list', async ({
  page,
}) => {
  await page.goto('/users')

  // Open Hannah's details
  await page.getByRole('button', { name: 'Hannah Arendt' }).click()
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()
  await expect(modal.getByText('Hannah Arendt')).toBeVisible()

  // Direct silo.admin assignment
  const roleRow = modal.getByRole('row').filter({ hasText: 'silo.admin' })
  await expect(roleRow).toBeVisible()
  await expect(roleRow).toContainText('Assigned')

  // Group memberships
  await expect(modal.getByRole('cell', { name: 'kernel-devs' })).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'web-devs' })).toBeVisible()

  await page.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click()
  await expect(modal).toBeHidden()

  // Hans Jonas inherits silo.collaborator via real-estate-devs
  await page.getByRole('button', { name: 'Hans Jonas' }).click()
  await expect(modal).toBeVisible()
  const viaRow = modal.getByRole('row').filter({ hasText: 'silo.collaborator' })
  await expect(viaRow).toContainText('via real-estate-devs')
})

test('Change and remove a user role from the Users tab', async ({ page }) => {
  await page.goto('/users')
  const table = page.getByRole('table')

  // Act on Jacob rather than the current user (Hannah, silo admin): demoting or
  // removing our own silo role would revoke our permission to keep editing, so
  // give Jacob a direct role first, then change and remove it.
  const jacobActions = () =>
    table
      .getByRole('row', { name: 'Jacob Klein', exact: false })
      .getByRole('button', { name: 'Row actions' })
      .click()

  await jacobActions()
  await page.getByRole('menuitem', { name: 'Add silo role' }).click()
  await page.getByRole('radio', { name: /^Collaborator / }).click()
  await page.getByRole('button', { name: 'Add silo role' }).click()
  await expectRowVisible(table, { Name: 'Jacob Klein', Role: 'silo.collaborator' })

  // change Jacob's role to viewer
  await jacobActions()
  await page.getByRole('menuitem', { name: 'Change silo role' }).click()
  await expect(page.getByRole('heading', { name: /Edit silo role/ })).toBeVisible()
  await expect(page.getByRole('radio', { name: /^Collaborator / })).toBeChecked()
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.getByRole('button', { name: 'Update role' }).click()
  await expectRowVisible(table, { Name: 'Jacob Klein', Role: 'silo.viewer' })

  // remove Jacob's direct role; he has no group-inherited role, so it goes to —
  await jacobActions()
  await page.getByRole('menuitem', { name: 'Remove silo role' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(table, { Name: 'Jacob Klein', Role: '—' })
})

test('Assign role to a user with no direct role from the row action', async ({ page }) => {
  await page.goto('/users')
  const table = page.getByRole('table')

  // Jacob Klein has no direct or inherited role
  await table
    .getByRole('row', { name: 'Jacob Klein', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  // unassigned users show only "Add silo role" — no Change/Remove
  await expect(page.getByRole('menuitem', { name: 'Change silo role' })).toBeHidden()
  await expect(page.getByRole('menuitem', { name: 'Remove silo role' })).toBeHidden()
  await page.getByRole('menuitem', { name: 'Add silo role' }).click()

  // Modal opens with the user already targeted (no listbox), and no role pre-selected
  await expect(page.getByRole('heading', { name: /Add silo role/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'User or group' })).toBeHidden()
  await expect(page.getByRole('dialog')).toContainText('Jacob Klein')

  await page.getByRole('radio', { name: /^Collaborator / }).click()
  await page.getByRole('button', { name: 'Add silo role' }).click()

  await expectRowVisible(table, {
    Name: 'Jacob Klein',
    Role: 'silo.collaborator',
  })
})

test('Inherited-only role shows Change/Remove with Remove disabled', async ({ page }) => {
  await page.goto('/users')
  const table = page.getByRole('table')

  // Hans Jonas has no direct silo role but inherits silo.collaborator via
  // real-estate-devs, so the badge shows but Remove can't act on a direct role
  await table
    .getByRole('row', { name: 'Hans Jonas', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await expect(page.getByRole('menuitem', { name: 'Add silo role' })).toBeHidden()
  await expect(page.getByRole('menuitem', { name: 'Change silo role' })).toBeEnabled()
  await expect(page.getByRole('menuitem', { name: 'Remove silo role' })).toBeDisabled()

  // Change role opens the edit modal with the inherited role pre-selected
  await page.getByRole('menuitem', { name: 'Change silo role' }).click()
  await expect(page.getByRole('heading', { name: /Edit silo role/ })).toBeVisible()
  await expect(page.getByRole('radio', { name: /^Collaborator / })).toBeChecked()
})

test('Groups tab shows roles and member counts; modal lists members', async ({ page }) => {
  await page.goto('/users')

  await page.getByRole('tab', { name: 'Groups' }).click()
  await expect(page).toHaveURL(/\/groups$/)

  const table = page.getByRole('table')

  await expectRowVisible(table, {
    Name: 'real-estate-devs',
    Role: 'silo.collaborator',
    Users: '2',
  })
  await expectRowVisible(table, { Name: 'kernel-devs', Role: '—', Users: '1' })
  await expectRowVisible(table, { Name: 'web-devs', Role: '—', Users: '1' })

  // Open the real-estate-devs group modal
  await page.getByRole('button', { name: 'real-estate-devs' }).click()
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()
  await expect(modal.getByText('silo.collaborator')).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'Hans Jonas' })).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'Jane Austen' })).toBeVisible()
})

test('Change and remove a group role from the Groups tab', async ({ page }) => {
  await page.goto('/groups')
  const table = page.getByRole('table')

  // real-estate-devs has silo.collaborator; change to viewer
  await table
    .getByRole('row', { name: 'real-estate-devs', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Change silo role' }).click()
  await expect(page.getByRole('heading', { name: /Edit silo role/ })).toBeVisible()
  await expect(page.getByRole('radio', { name: /^Collaborator / })).toBeChecked()
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.getByRole('button', { name: 'Update role' }).click()
  await expectRowVisible(table, {
    Name: 'real-estate-devs',
    Role: 'silo.viewer',
  })

  // Remove the role
  await table
    .getByRole('row', { name: 'real-estate-devs', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Remove silo role' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(table, { Name: 'real-estate-devs', Role: '—' })
})

test('Assign a role to a group with no direct role from the row action', async ({
  page,
}) => {
  await page.goto('/groups')
  const table = page.getByRole('table')

  // kernel-devs has no direct silo role
  await table
    .getByRole('row', { name: 'kernel-devs', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Add silo role' }).click()
  await expect(page.getByRole('heading', { name: /Add silo role/ })).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('kernel-devs')

  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.getByRole('button', { name: 'Add silo role' }).click()

  await expectRowVisible(table, { Name: 'kernel-devs', Role: 'silo.viewer' })
})
