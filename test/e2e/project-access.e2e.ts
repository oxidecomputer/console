/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, expectRowVisible, getPageAsUser, test, type Page } from './utils'

const usersUrl = '/projects/mock-project/access/users'
const groupsUrl = '/projects/mock-project/access/groups'

const closeSideModal = (page: Page) =>
  page.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click()

test('Project Users tab shows effective roles across silo, project, and groups', async ({
  page,
}) => {
  await page.goto('/projects/mock-project')
  await page.getByRole('link', { name: 'Project Access' }).click()
  await expect(page).toHaveURL(/\/projects\/mock-project\/access\/groups$/)
  await expect(page.getByRole('heading', { name: 'Project Access' })).toBeVisible()
  await page.getByRole('tab', { name: 'Users' }).click()
  await expect(page).toHaveURL(/\/projects\/mock-project\/access\/users$/)

  const table = page.getByRole('table')

  // the strongest role from any scope or group is shown, labeled with its scope
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    Role: 'silo.admin',
    Groups: 'kernel-devs+1',
  })
  await expectRowVisible(table, { Name: 'Jacob Klein', Role: 'project.collaborator' })
  await expectRowVisible(table, {
    Name: 'Herbert Marcuse',
    Role: 'project.limited_collaborator',
  })
  await expectRowVisible(table, {
    Name: 'Hans Jonas',
    Role: 'silo.collaborator',
    Groups: 'real-estate-devs',
  })
  // every silo user is listed, including those with no access
  await expectRowVisible(table, { Name: 'Simone de Beauvoir', Role: '—', Groups: '—' })

  // inherited role names its source group
  const hansRow = table.getByRole('row', { name: 'Hans Jonas', exact: false })
  await hansRow.getByRole('button', { name: 'Tip' }).hover()
  await expect(page.getByRole('tooltip')).toContainText('via real-estate-devs')
})

test('Add, change, and remove a project role from the user details side modal', async ({
  page,
}) => {
  await page.goto(usersUrl)
  const table = page.getByRole('table')

  await page.getByRole('link', { name: 'Simone de Beauvoir' }).click()
  const sideModal = page.getByRole('dialog', { name: 'User' })

  // Simone has no role anywhere, so only Add is offered
  const emptyRow = sideModal.getByRole('row').filter({ hasText: 'No roles assigned' })
  await emptyRow.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Change project role' })).toBeHidden()
  await expect(page.getByRole('menuitem', { name: 'Remove project role' })).toBeHidden()
  await page.getByRole('menuitem', { name: 'Add project role' }).click()
  const addModal = page.getByRole('dialog', { name: 'Add project role' })
  await expect(addModal).toContainText('Simone de Beauvoir')
  await addModal.getByRole('radio', { name: /^Collaborator / }).click()
  await addModal.getByRole('button', { name: 'Add project role' }).click()
  const assignedRow = sideModal.getByRole('row').filter({ hasText: 'Assigned' })
  await expect(assignedRow).toContainText('project.collaborator')

  await assignedRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Change project role' }).click()
  const editModal = page.getByRole('dialog', { name: 'Edit project role' })
  await expect(editModal.getByRole('radio', { name: /^Collaborator / })).toBeChecked()
  await editModal.getByRole('radio', { name: /^Viewer / }).click()
  await editModal.getByRole('button', { name: 'Update role' }).click()
  await expect(assignedRow).toContainText('project.viewer')

  // the Users table reflects the change once the side modal closes
  await closeSideModal(page)
  await expectRowVisible(table, { Name: 'Simone de Beauvoir', Role: 'project.viewer' })

  await page.getByRole('link', { name: 'Simone de Beauvoir' }).click()
  await assignedRow.getByRole('button', { name: 'Row actions' }).click()
  const removeRole = page.getByRole('menuitem', { name: 'Remove project role' })
  await expect(removeRole).toHaveClass(/destructive/)
  await removeRole.click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(emptyRow).toBeVisible()
  await closeSideModal(page)
  await expectRowVisible(table, { Name: 'Simone de Beauvoir', Role: '—' })
})

test('Roles from the silo or a group cannot be edited on the project page', async ({
  page,
}) => {
  await page.goto(usersUrl)

  // Hannah has a direct silo role
  await page.getByRole('link', { name: 'Hannah Arendt' }).click()
  const sideModal = page.getByRole('dialog', { name: 'User' })
  const siloRow = sideModal.getByRole('row').filter({ hasText: 'silo.admin' })
  await siloRow.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Change silo role' })).toBeDisabled()
  const removeSilo = page.getByRole('menuitem', { name: 'Remove silo role' })
  await expect(removeSilo).toBeDisabled()
  await expect(removeSilo).not.toHaveClass(/destructive/)
  await removeSilo.hover()
  await expect(page.getByRole('tooltip')).toHaveText('This role comes from the silo policy')
  await page.keyboard.press('Escape')

  // a direct project role can still be added, from a row below the others
  const missingRow = sideModal
    .getByRole('row')
    .filter({ hasText: 'No project role assigned' })
  await expect(sideModal.getByRole('table').first().getByRole('row').last()).toContainText(
    'No project role assigned'
  )
  await missingRow.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Add project role' })).toBeEnabled()
  await page.keyboard.press('Escape')
  await closeSideModal(page)

  // Hans's only role comes from a group
  await page.getByRole('link', { name: 'Hans Jonas' }).click()
  const viaRow = sideModal.getByRole('row').filter({ hasText: 'via real-estate-devs' })
  await viaRow.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'View group' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Remove project role' })).toBeHidden()
  await page.keyboard.press('Escape')
  await missingRow.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Add project role' })).toBeEnabled()
})

test('User details side modal offers role actions by scope and source', async ({
  page,
}) => {
  await page.goto(usersUrl)
  await page.getByRole('link', { name: 'Hannah Arendt' }).click()
  const sideModal = page.getByRole('dialog', { name: 'User' })
  await expect(sideModal.getByRole('link', { name: 'Project Roles' })).toHaveAttribute(
    'href',
    'https://docs.oxide.computer/guides/configuring-access#_project'
  )

  // a direct silo role can't be removed from the project page
  const siloRow = sideModal.getByRole('row').filter({ hasText: 'silo.admin' })
  await siloRow.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Change silo role' })).toBeDisabled()
  const removeSilo = page.getByRole('menuitem', { name: 'Remove silo role' })
  await expect(removeSilo).toBeDisabled()
  await page.keyboard.press('Escape')

  // give Hannah a direct project role
  const missingRow = sideModal
    .getByRole('row')
    .filter({ hasText: 'No project role assigned' })
  await missingRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Add project role' }).click()
  const addModal = page.getByRole('dialog', { name: 'Add project role' })
  await addModal.getByRole('radio', { name: /^Viewer / }).click()
  await addModal.getByRole('button', { name: 'Add project role' }).click()
  await expect(addModal).toBeHidden()
  await expect(missingRow).toBeHidden()

  const projectRow = sideModal
    .getByRole('row')
    .filter({ hasText: 'project.' })
    .filter({ hasText: 'Assigned' })
  await expect(projectRow).toContainText('project.viewer')
  await projectRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Change project role' }).click()
  const editModal = page.getByRole('dialog', { name: 'Edit project role' })
  await editModal.getByRole('radio', { name: /^Admin / }).click()
  await editModal.getByRole('button', { name: 'Update role' }).click()
  await expect(editModal).toBeHidden()
  await expect(projectRow).toContainText('project.admin')

  await projectRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Remove project role' }).click()
  // removing your own admin role requires typing your name
  const confirmDialog = page.getByRole('dialog', { name: 'Delete role assignment' })
  await expect(confirmDialog).toContainText('This could remove your own project access.')
  await confirmDialog.getByRole('textbox').fill('Hannah Arendt')
  await confirmDialog.getByRole('button', { name: 'Confirm' }).click()
  await expect(projectRow).toBeHidden()
  await expect(sideModal).toBeVisible()

  // group memberships link to their group details
  await sideModal
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: 'kernel-devs', exact: true }) })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'View group' }).click()
  await expect(page).toHaveURL(/\/projects\/mock-project\/access\/groups\/[0-9a-f-]+$/)
  await expect(page.getByRole('dialog', { name: 'Group' })).toContainText('kernel-devs')
})

test('Add a project role from the group details side modal', async ({ page }) => {
  await page.goto(groupsUrl)

  // web-devs has no role anywhere, so the empty row offers Add
  await page.getByRole('link', { name: 'web-devs' }).click()
  const sideModal = page.getByRole('dialog', { name: 'Group' })
  const emptyRow = sideModal.getByRole('row').filter({ hasText: 'No roles assigned' })
  await emptyRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Add project role' }).click()
  const addModal = page.getByRole('dialog', { name: 'Add project role' })
  await addModal.getByRole('radio', { name: /^Viewer / }).click()
  await addModal.getByRole('button', { name: 'Add project role' }).click()
  await expect(addModal).toBeHidden()
  await expect(
    sideModal.getByRole('row').filter({ hasText: 'project.viewer' })
  ).toBeVisible()
  await page.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click()

  // real-estate-devs has only a silo role, which can't be edited here
  await page.getByRole('link', { name: 'real-estate-devs' }).click()
  const siloRow = sideModal.getByRole('row').filter({ hasText: 'silo.collaborator' })
  await siloRow.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Change silo role' })).toBeDisabled()
  await expect(page.getByRole('menuitem', { name: 'Remove silo role' })).toBeDisabled()
  await expect(page.getByRole('menuitem', { name: 'Add project role' })).toBeHidden()
  await page.keyboard.press('Escape')

  // a row below it offers to add a project role
  await sideModal
    .getByRole('row')
    .filter({ hasText: 'No project role assigned' })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Add project role' }).click()
  await expect(page.getByRole('dialog', { name: 'Add project role' })).toBeVisible()
})

test('Removing your own non-admin role skips the self-removal warning', async ({
  page,
}) => {
  await page.goto(usersUrl)
  const table = page.getByRole('table')

  // Hannah is the current user; give her a project viewer role, then remove it
  await page.getByRole('link', { name: 'Hannah Arendt' }).click()
  const sideModal = page.getByRole('dialog', { name: 'User' })
  await sideModal
    .getByRole('row')
    .filter({ hasText: 'No project role assigned' })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Add project role' }).click()
  const addModal = page.getByRole('dialog', { name: 'Add project role' })
  await addModal.getByRole('radio', { name: /^Viewer / }).click()
  await addModal.getByRole('button', { name: 'Add project role' }).click()
  await expect(addModal).toBeHidden()

  const projectRow = sideModal
    .getByRole('row')
    .filter({ hasText: 'project.' })
    .filter({ hasText: 'Assigned' })
  await projectRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Remove project role' }).click()
  const confirmDialog = page.getByRole('dialog', { name: 'Delete role assignment' })
  await expect(confirmDialog).toBeVisible()
  await expect(confirmDialog).not.toContainText('remove your own')
  await expect(confirmDialog.getByRole('textbox')).toBeHidden()
  await confirmDialog.getByRole('button', { name: 'Confirm' }).click()
  await expect(confirmDialog).toBeHidden()
  await expect(projectRow).toBeHidden()

  // the stronger silo role stays effective throughout
  await closeSideModal(page)
  await expectRowVisible(table, { Name: 'Hannah Arendt', Role: 'silo.admin' })
})

test('Non-admin cannot change or remove project roles', async ({ browser }) => {
  // Jacob Klein is only a project collaborator (not project admin or silo
  // collaborator/admin), so he lacks `modify` on the project and can't edit role
  // assignments. Both side modal actions should be disabled with an explanation.
  const page = await getPageAsUser(browser, 'Jacob Klein')
  await page.goto(usersUrl)
  await expect(page.getByRole('heading', { name: 'Project Access' })).toBeVisible()

  await page.getByRole('link', { name: 'Herbert Marcuse' }).click()
  await page
    .getByRole('dialog', { name: 'User' })
    .getByRole('row')
    .filter({ hasText: 'Assigned' })
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

test('Project user details side modal shows silo and project roles', async ({ page }) => {
  await page.goto(usersUrl)

  await page.getByRole('link', { name: 'Hannah Arendt' }).click()
  await expect(page).toHaveURL(/\/projects\/mock-project\/access\/users\/[0-9a-f-]+$/)
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()

  await expect(modal.getByRole('row').filter({ hasText: 'silo.admin' })).toContainText(
    'Assigned'
  )
  await expect(modal.getByRole('row').filter({ hasText: 'project.viewer' })).toContainText(
    'via kernel-devs'
  )
  // exact, since a role row also reads "via kernel-devs"
  await expect(modal.getByRole('cell', { name: 'kernel-devs', exact: true })).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'web-devs', exact: true })).toBeVisible()

  await page.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click()
  await expect(modal).toBeHidden()
  await expect(page).toHaveURL(/\/projects\/mock-project\/access\/users$/)
})

test('Project Groups tab shows and edits group roles', async ({ page }) => {
  await page.goto(usersUrl)
  await page.getByRole('tab', { name: 'Groups' }).click()
  await expect(page).toHaveURL(/\/projects\/mock-project\/access\/groups$/)

  const table = page.getByRole('table')
  await expectRowVisible(table, {
    Name: 'real-estate-devs',
    Role: 'silo.collaborator',
    Users: '2',
  })
  await expectRowVisible(table, { Name: 'kernel-devs', Role: 'project.viewer', Users: '1' })
  await expectRowVisible(table, { Name: 'web-devs', Role: '—', Users: '1' })

  // change kernel-devs' direct project role
  await page.getByRole('link', { name: 'kernel-devs' }).click()
  await page
    .getByRole('dialog', { name: 'Group' })
    .getByRole('row')
    .filter({ hasText: 'project.viewer' })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Change project role' }).click()
  const editModal = page.getByRole('dialog', { name: 'Edit project role' })
  await expect(editModal.getByRole('radio', { name: /^Viewer / })).toBeChecked()
  await editModal.getByRole('radio', { name: /^Collaborator / }).click()
  await editModal.getByRole('button', { name: 'Update role' }).click()
  await expect(editModal).toBeHidden()
  await closeSideModal(page)
  await expectRowVisible(table, { Name: 'kernel-devs', Role: 'project.collaborator' })

  // group detail modal
  await page.getByRole('link', { name: 'real-estate-devs' }).click()
  await expect(page).toHaveURL(/\/projects\/mock-project\/access\/groups\/[0-9a-f-]+$/)
  const modal = page.getByRole('dialog')
  await expect(modal.getByText('silo.collaborator')).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'Hans Jonas' })).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'Jane Austen' })).toBeVisible()
  await closeSideModal(page)
  await expect(page).toHaveURL(new RegExp(`${groupsUrl}$`))
})

test('Project Access root redirects to the Groups tab', async ({ page }) => {
  await page.goto('/projects/mock-project/access')
  await expect(page).toHaveURL(/\/projects\/mock-project\/access\/groups$/)
  await expect(page.getByRole('heading', { name: 'Project Access' })).toBeVisible()
})
