/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, expectRowVisible, getPageAsUser, test } from './utils'

test('Non-admin cannot change or remove silo roles', async ({ browser }) => {
  // Hans Jonas is only a silo collaborator (via the real-estate-devs group), so
  // he lacks `modify` on the silo and can't edit role assignments. Both side
  // modal actions should be disabled with an explanation.
  const page = await getPageAsUser(browser, 'Hans Jonas')
  await page.goto('/access/users')

  await expect(page.getByRole('heading', { name: 'Silo Access' })).toBeVisible()

  await page.getByRole('link', { name: 'Hannah Arendt' }).click()
  await page
    .getByRole('dialog', { name: 'User' })
    .getByRole('row')
    .filter({ hasText: 'Assigned' })
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

test('Silo Access page lands on Groups tab; Users tab shows direct + via-group silo roles', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Silo Access' }).click()
  await expect(page).toHaveURL(/\/access\/groups$/)
  await expect(page.getByRole('heading', { name: 'Silo Access' })).toBeVisible()

  // Users tab comes second
  await page.getByRole('tab', { name: 'Users' }).click()
  await expect(page).toHaveURL(/\/access\/users$/)

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
  // collaborator; the other role is only shown in the detail side modal
  await expectRowVisible(table, {
    Name: 'Jane Austen',
    Role: 'silo.collaborator',
    Groups: 'real-estate-devs',
  })

  // the effective role is inherited, so an info icon names the source group
  const janeRow = table.getByRole('row', { name: 'Jane Austen', exact: false })
  await janeRow.getByRole('button', { name: 'Tip' }).hover()
  await expect(page.getByRole('tooltip')).toContainText('via real-estate-devs')
})

test('User details side modal shows assigned + via-group roles and group list', async ({
  page,
}) => {
  await page.goto('/access/users')

  // Open Hannah's details
  await page.getByRole('link', { name: 'Hannah Arendt' }).click()
  await expect(page).toHaveURL(/\/access\/users\/[0-9a-f-]+$/)
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

  await expect(modal.getByRole('link', { name: 'Silo Roles' })).toHaveAttribute(
    'href',
    'https://docs.oxide.computer/guides/configuring-access#_silo'
  )
  await expect(modal.getByRole('link', { name: 'Managing Groups' })).toBeHidden()

  await page.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click()
  await expect(modal).toBeHidden()
  await expect(page).toHaveURL(/\/access\/users$/)

  // Hans Jonas inherits silo.collaborator via real-estate-devs
  await page.getByRole('link', { name: 'Hans Jonas' }).click()
  await expect(modal).toBeVisible()
  const viaRow = modal.getByRole('row').filter({ hasText: 'silo.collaborator' })
  await expect(viaRow).toContainText('via real-estate-devs')
})

test('Change and remove a role from the user details side modal', async ({ page }) => {
  await page.goto('/access/users')
  await page.getByRole('link', { name: 'Jane Austen' }).click()
  const sideModal = page.getByRole('dialog', { name: 'User' })
  await expect(sideModal).toBeVisible()

  // Jane has a direct silo.viewer role and silo.collaborator via real-estate-devs
  const assignedRow = sideModal.getByRole('row').filter({ hasText: 'Assigned' })
  await expect(assignedRow).toContainText('silo.viewer')

  // the edit modal opens over the side modal, and the side modal stays open after
  await assignedRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Change silo role' }).click()
  const editModal = page.getByRole('dialog', { name: 'Edit silo role' })
  await expect(editModal).toBeVisible()
  await expect(editModal.getByRole('radio', { name: /^Viewer / })).toBeChecked()
  await editModal.getByRole('radio', { name: /^Admin / }).click()
  await editModal.getByRole('button', { name: 'Update role' }).click()
  await expect(editModal).toBeHidden()
  await expect(sideModal).toBeVisible()
  await expect(assignedRow).toContainText('silo.admin')

  await assignedRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Remove silo role' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(assignedRow).toBeHidden()
  await expect(sideModal).toBeVisible()

  // an inherited role links to its source group
  const viaRow = sideModal.getByRole('row').filter({ hasText: 'via real-estate-devs' })
  await viaRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'View group' }).click()
  await expect(page).toHaveURL(/\/access\/groups\/[0-9a-f-]+$/)
  await expect(page.getByRole('dialog', { name: 'Group' })).toContainText(
    'real-estate-devs'
  )
})

test('Change a role and view members from the group details side modal', async ({
  page,
}) => {
  await page.goto('/access/groups')
  await page.getByRole('link', { name: 'real-estate-devs' }).click()
  const sideModal = page.getByRole('dialog', { name: 'Group' })
  const docLinks = sideModal.getByRole('link', { name: /Roles|Managing/ })
  await expect(docLinks).toHaveText(['Silo Roles', 'Managing Groups'])

  const roleRow = sideModal.getByRole('row').filter({ hasText: 'silo.collaborator' })
  await roleRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Change silo role' }).click()
  const editModal = page.getByRole('dialog', { name: 'Edit silo role' })
  await expect(editModal).toContainText('real-estate-devs')
  await expect(editModal.getByRole('radio', { name: /^Collaborator / })).toBeChecked()
  await editModal.getByRole('radio', { name: /^Viewer / }).click()
  await editModal.getByRole('button', { name: 'Update role' }).click()
  await expect(editModal).toBeHidden()
  const viewerRow = sideModal.getByRole('row').filter({ hasText: 'silo.viewer' })
  await expect(viewerRow).toBeVisible()

  await viewerRow.getByRole('button', { name: 'Row actions' }).click()
  const removeRole = page.getByRole('menuitem', { name: 'Remove silo role' })
  await expect(removeRole).toHaveClass(/destructive/)
  await removeRole.click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(
    sideModal.getByRole('row').filter({ hasText: 'No roles assigned' })
  ).toBeVisible()

  // the Groups table reflects the change once the side modal closes
  await page.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click()
  await expectRowVisible(page.getByRole('table'), { Name: 'real-estate-devs', Role: '—' })
  await page.getByRole('link', { name: 'real-estate-devs' }).click()

  // members link to their user details
  await sideModal
    .getByRole('row', { name: 'Hans Jonas', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await expect(page.getByRole('menuitem', { name: 'Copy ID' })).toBeVisible()
  await page.getByRole('menuitem', { name: 'View user' }).click()
  await expect(page).toHaveURL(/\/access\/users\/[0-9a-f-]+$/)
  await expect(page.getByRole('dialog', { name: 'User' })).toContainText('Hans Jonas')
})

test('Add a role from the group details side modal when none is assigned', async ({
  page,
}) => {
  await page.goto('/access/groups')
  await page.getByRole('link', { name: 'kernel-devs' }).click()
  const sideModal = page.getByRole('dialog', { name: 'Group' })

  // kernel-devs has no silo role
  const emptyRow = sideModal.getByRole('row').filter({ hasText: 'No roles assigned' })
  await emptyRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Add silo role' }).click()
  const addModal = page.getByRole('dialog', { name: 'Add silo role' })
  await addModal.getByRole('radio', { name: /^Viewer / }).click()
  await addModal.getByRole('button', { name: 'Add silo role' }).click()
  await expect(addModal).toBeHidden()
  await expect(sideModal.getByRole('row').filter({ hasText: 'silo.viewer' })).toBeVisible()
  await expect(emptyRow).toBeHidden()

  await page.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click()
  await expectRowVisible(page.getByRole('table'), {
    Name: 'kernel-devs',
    Role: 'silo.viewer',
  })
})

test('Add, change, and remove a user role from the user details side modal', async ({
  page,
}) => {
  await page.goto('/access/users')
  const table = page.getByRole('table')

  // Act on Jacob rather than the current user (Hannah, silo admin): demoting or
  // removing our own silo role would revoke our permission to keep editing
  await page.getByRole('link', { name: 'Jacob Klein' }).click()
  const sideModal = page.getByRole('dialog', { name: 'User' })

  // Jacob has no silo role and no groups, so only Add is offered
  const emptyRow = sideModal.getByRole('row').filter({ hasText: 'No roles assigned' })
  await emptyRow.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Change silo role' })).toBeHidden()
  await expect(page.getByRole('menuitem', { name: 'Remove silo role' })).toBeHidden()
  await page.getByRole('menuitem', { name: 'Add silo role' }).click()

  // the modal targets Jacob, with no identity picker and no role preselected
  const addModal = page.getByRole('dialog', { name: 'Add silo role' })
  await expect(addModal).toContainText('Jacob Klein')
  await expect(addModal.getByRole('combobox')).toBeHidden()
  await expect(addModal.getByRole('radio', { name: /^Collaborator / })).not.toBeChecked()
  await addModal.getByRole('radio', { name: /^Collaborator / }).click()
  await addModal.getByRole('button', { name: 'Add silo role' }).click()
  await expect(addModal).toBeHidden()
  await expect(emptyRow).toBeHidden()
  const assignedRow = sideModal.getByRole('row').filter({ hasText: 'Assigned' })
  await expect(assignedRow).toContainText('silo.collaborator')

  await assignedRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Change silo role' }).click()
  const editModal = page.getByRole('dialog', { name: 'Edit silo role' })
  await expect(editModal.getByRole('radio', { name: /^Collaborator / })).toBeChecked()
  await editModal.getByRole('radio', { name: /^Viewer / }).click()
  await editModal.getByRole('button', { name: 'Update role' }).click()
  await expect(assignedRow).toContainText('silo.viewer')

  // the Users table reflects the change once the side modal closes
  await page.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click()
  await expectRowVisible(table, { Name: 'Jacob Klein', Role: 'silo.viewer' })

  // remove Jacob's direct role; he has no group-inherited role, so it goes to —
  await page.getByRole('link', { name: 'Jacob Klein' }).click()
  await assignedRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Remove silo role' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(emptyRow).toBeVisible()
  await page.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click()
  await expectRowVisible(table, { Name: 'Jacob Klein', Role: '—' })
})

test('A user with only inherited roles can get a direct role', async ({ page }) => {
  await page.goto('/access/users')
  await page.getByRole('link', { name: 'Hans Jonas' }).click()
  const sideModal = page.getByRole('dialog', { name: 'User' })

  // Hans has no direct silo role but inherits silo.collaborator via
  // real-estate-devs, which can't be changed or removed from here
  const viaRow = sideModal.getByRole('row').filter({ hasText: 'via real-estate-devs' })
  await viaRow.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'View group' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Change silo role' })).toBeHidden()
  await expect(page.getByRole('menuitem', { name: 'Remove silo role' })).toBeHidden()
  await expect(page.getByRole('menuitem', { name: 'Add silo role' })).toBeHidden()
  await page.keyboard.press('Escape')

  // a row below the inherited roles offers to add a direct one
  const missingRow = sideModal.getByRole('row').filter({ hasText: 'No silo role assigned' })
  await expect(sideModal.getByRole('table').first().getByRole('row').last()).toContainText(
    'No silo role assigned'
  )
  await missingRow.getByRole('button', { name: 'Row actions' }).click()

  // Add opens with no role preselected, since there's no direct role to change
  await page.getByRole('menuitem', { name: 'Add silo role' }).click()
  const addModal = page.getByRole('dialog', { name: 'Add silo role' })
  await expect(addModal.getByRole('radio', { name: /^Collaborator / })).not.toBeChecked()
  await addModal.getByRole('radio', { name: /^Viewer / }).click()
  await addModal.getByRole('button', { name: 'Add silo role' }).click()
  await expect(addModal).toBeHidden()
  await expect(sideModal.getByRole('row').filter({ hasText: 'Assigned' })).toContainText(
    'silo.viewer'
  )

  // with a direct role in place, the row goes away
  await expect(missingRow).toBeHidden()
})

test('User and group detail URLs open the side modal directly', async ({ page }) => {
  await page.goto('/access/users')
  await page.getByRole('link', { name: 'Hannah Arendt' }).click()
  await expect(page.getByRole('dialog')).toContainText('Hannah Arendt')

  // a fresh load of the URL lands on the same user's modal over the Users tab
  // (navigate instead of page.reload(), which doesn't work in Firefox)
  await page.goto(page.url())
  await expect(page.getByRole('dialog')).toContainText('Hannah Arendt')
  await page.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click()
  await expect(page).toHaveURL(/\/access\/users$/)
  await expect(page.getByRole('tab', { name: 'Users', selected: true })).toBeVisible()

  await page.goto('/access/groups')
  await page.getByRole('link', { name: 'real-estate-devs' }).click()
  await expect(page.getByRole('dialog')).toContainText('real-estate-devs')
  await page.goto(page.url())
  await expect(page.getByRole('dialog')).toContainText('real-estate-devs')
  await page.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click()
  await expect(page).toHaveURL(/\/access\/groups$/)
  await expect(page.getByRole('tab', { name: 'Groups', selected: true })).toBeVisible()
})

test('Unknown user or group ID shows Not Found', async ({ page }) => {
  await page.goto('/access/users/7e5a4f1c-2b3d-4e6f-8a9b-0c1d2e3f4a5b')
  await expect(page.getByText('Page not found')).toBeVisible()
  await page.goto('/access/groups/7e5a4f1c-2b3d-4e6f-8a9b-0c1d2e3f4a5b')
  await expect(page.getByText('Page not found')).toBeVisible()
})

test('Groups tab shows roles and member counts; modal lists members', async ({ page }) => {
  await page.goto('/access/users')

  await page.getByRole('tab', { name: 'Groups' }).click()
  await expect(page).toHaveURL(/\/access\/groups$/)

  const table = page.getByRole('table')

  await expectRowVisible(table, {
    Name: 'real-estate-devs',
    Role: 'silo.collaborator',
    Users: '2',
  })
  await expectRowVisible(table, { Name: 'kernel-devs', Role: '—', Users: '1' })
  await expectRowVisible(table, { Name: 'web-devs', Role: '—', Users: '1' })

  // Open the real-estate-devs group modal
  await page.getByRole('link', { name: 'real-estate-devs' }).click()
  await expect(page).toHaveURL(/\/access\/groups\/[0-9a-f-]+$/)
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()
  await expect(modal.getByText('silo.collaborator')).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'Hans Jonas' })).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'Jane Austen' })).toBeVisible()
})

// changing your own role away from admin requires confirmation because you
// may not be able to undo it
test('Changing your own admin role requires typing your name', async ({ page }) => {
  await page.goto('/access/users')

  // Hannah Arendt is the mock session user and a silo admin
  await page.getByRole('link', { name: 'Hannah Arendt' }).click()
  const sideModal = page.getByRole('dialog', { name: 'User' })
  const assignedRow = sideModal.getByRole('row').filter({ hasText: 'Assigned' })
  await assignedRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Change silo role' }).click()
  const editForm = page.getByRole('dialog', { name: 'Edit silo role' })
  const update = editForm.getByRole('button', { name: 'Update role' })
  const warning = editForm.getByText('This could remove your ability to manage silo roles.')

  // nothing extra while admin stays selected
  await expect(warning).toBeHidden()
  await expect(editForm.getByRole('textbox')).toBeHidden()

  // picking a lower role adds the warning and the name field
  await editForm.getByRole('radio', { name: /^Viewer / }).click()
  await expect(warning).toBeVisible()
  await expect(update).toBeDisabled()
  await editForm.getByRole('textbox').fill('Hannah')
  await expect(update).toBeDisabled()
  await editForm.getByRole('textbox').fill('Hannah Arendt')
  await expect(update).toBeEnabled()
  await update.click()

  await expect(editForm).toBeHidden()
  await expect(assignedRow).toContainText('silo.viewer')

  // no longer a silo admin, so role actions are disabled without a navigation
  await assignedRow.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Change silo role' })).toBeDisabled()
})

test('Silo Access root redirects to the Groups tab', async ({ page }) => {
  await page.goto('/access')
  await expect(page).toHaveURL(/\/access\/groups$/)
  await expect(page.getByRole('heading', { name: 'Silo Access' })).toBeVisible()
})
