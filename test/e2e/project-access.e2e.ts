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

const openRowActions = (page: Page, name: string) =>
  page
    .getByRole('table')
    .getByRole('row', { name, exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()

test('Project Users tab shows effective roles across silo, project, and groups', async ({
  page,
}) => {
  await page.goto('/projects/mock-project')
  await page.getByRole('link', { name: 'Project Access' }).click()
  await expect(page).toHaveURL(/\/projects\/mock-project\/access\/users$/)
  await expect(page.getByRole('heading', { name: 'Project Access' })).toBeVisible()

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

test('Add, change, and remove a project role from the Users tab', async ({ page }) => {
  await page.goto(usersUrl)
  const table = page.getByRole('table')

  // Simone has no role anywhere, so only Add is offered
  await openRowActions(page, 'Simone de Beauvoir')
  await expect(page.getByRole('menuitem', { name: 'Change project role' })).toBeHidden()
  await expect(page.getByRole('menuitem', { name: 'Remove project role' })).toBeHidden()
  await page.getByRole('menuitem', { name: 'Add project role' }).click()
  await expect(page.getByRole('heading', { name: 'Add project role' })).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('Simone de Beauvoir')
  await page.getByRole('radio', { name: /^Collaborator / }).click()
  await page.getByRole('button', { name: 'Add project role' }).click()
  await expectRowVisible(table, {
    Name: 'Simone de Beauvoir',
    Role: 'project.collaborator',
  })

  await openRowActions(page, 'Simone de Beauvoir')
  await page.getByRole('menuitem', { name: 'Change project role' }).click()
  await expect(page.getByRole('heading', { name: 'Edit project role' })).toBeVisible()
  await expect(page.getByRole('radio', { name: /^Collaborator / })).toBeChecked()
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.getByRole('button', { name: 'Update role' }).click()
  await expectRowVisible(table, { Name: 'Simone de Beauvoir', Role: 'project.viewer' })

  await openRowActions(page, 'Simone de Beauvoir')
  const removeRole = page.getByRole('menuitem', { name: 'Remove project role' })
  await expect(removeRole).toHaveClass(/destructive/)
  await removeRole.click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(table, { Name: 'Simone de Beauvoir', Role: '—' })
})

test('Roles from the silo or a group cannot be removed on the project page', async ({
  page,
}) => {
  await page.goto(usersUrl)
  const table = page.getByRole('table')

  // Hannah's effective role is a direct silo role
  await openRowActions(page, 'Hannah Arendt')
  await expect(page.getByRole('menuitem', { name: 'Change project role' })).toBeHidden()
  const removeItem = page.getByRole('menuitem', { name: 'Remove project role' })
  await expect(removeItem).toBeDisabled()
  await expect(removeItem).not.toHaveClass(/destructive/)
  await removeItem.hover()
  await expect(page.getByRole('tooltip')).toHaveText('This role comes from the silo policy')

  // a project role can still be added; the stronger silo role stays effective
  await page.getByRole('menuitem', { name: 'Add project role' }).click()
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.getByRole('button', { name: 'Add project role' }).click()
  await expectRowVisible(table, { Name: 'Hannah Arendt', Role: 'silo.admin' })

  // Hans's effective role comes from a group
  await page.keyboard.press('Escape')
  await openRowActions(page, 'Hans Jonas')
  const hansRemove = page.getByRole('menuitem', { name: 'Remove project role' })
  await expect(hansRemove).toBeDisabled()
  await hansRemove.hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    'Role is inherited from a group and cannot be changed here.'
  )
})

test('Non-admin cannot change or remove project roles', async ({ browser }) => {
  // Jacob Klein is only a project collaborator (not project admin or silo
  // collaborator/admin), so he lacks `modify` on the project and can't edit role
  // assignments. Both row actions should be disabled with an explanation.
  const page = await getPageAsUser(browser, 'Jacob Klein')
  await page.goto(usersUrl)
  await expect(page.getByRole('heading', { name: 'Project Access' })).toBeVisible()

  await openRowActions(page, 'Herbert Marcuse')

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
  await openRowActions(page, 'kernel-devs')
  await page.getByRole('menuitem', { name: 'Change project role' }).click()
  await expect(page.getByRole('radio', { name: /^Viewer / })).toBeChecked()
  await page.getByRole('radio', { name: /^Collaborator / }).click()
  await page.getByRole('button', { name: 'Update role' }).click()
  await expectRowVisible(table, { Name: 'kernel-devs', Role: 'project.collaborator' })

  // real-estate-devs' role comes from the silo
  await openRowActions(page, 'real-estate-devs')
  await expect(page.getByRole('menuitem', { name: 'Add project role' })).toBeEnabled()
  await expect(page.getByRole('menuitem', { name: 'Remove project role' })).toBeDisabled()
  await page.keyboard.press('Escape')

  // group detail modal
  await page.getByRole('link', { name: 'real-estate-devs' }).click()
  await expect(page).toHaveURL(/\/projects\/mock-project\/access\/groups\/[0-9a-f-]+$/)
  const modal = page.getByRole('dialog')
  await expect(modal.getByText('silo.collaborator')).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'Hans Jonas' })).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'Jane Austen' })).toBeVisible()
  await page.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click()
  await expect(page).toHaveURL(new RegExp(`${groupsUrl}$`))
})

test('Project Access root redirects to the Users tab', async ({ page }) => {
  await page.goto('/projects/mock-project/access')
  await expect(page).toHaveURL(/\/projects\/mock-project\/access\/users$/)
  await expect(page.getByRole('heading', { name: 'Project Access' })).toBeVisible()
})
