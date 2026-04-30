/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, expectRowVisible, expectVisible, test } from './utils'

test('Users tab shows direct and via-group silo roles', async ({ page }) => {
  await page.goto('/users-and-groups')

  // landed on default tab
  await expectVisible(page, ['role=heading[name*="Users & Groups"]'])
  await expect(page).toHaveURL(/\/users-and-groups\/users$/)

  const table = page.getByRole('table')

  // Hannah has a direct silo.admin assignment; Groups column shows the first
  // group (kernel-devs) and "+1" for web-devs
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    'Silo Role': 'silo.admin',
    Groups: 'kernel-devs+1',
  })

  // Hans Jonas has no direct role but inherits silo.collaborator from real-estate-devs
  await expectRowVisible(table, {
    Name: 'Hans Jonas',
    'Silo Role': 'silo.collaborator',
    Groups: 'real-estate-devs',
  })

  // Jacob Klein has no silo role and no groups
  await expectRowVisible(table, { Name: 'Jacob Klein', 'Silo Role': '—', Groups: '—' })
})

test('User details side modal shows assigned + via-group roles and group list', async ({
  page,
}) => {
  await page.goto('/users-and-groups/users')

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

test('Groups tab shows roles and member counts; modal lists members', async ({ page }) => {
  await page.goto('/users-and-groups/users')

  // Switch to Groups tab via the tablist
  await page.getByRole('tab', { name: 'Groups' }).click()
  await expect(page).toHaveURL(/\/users-and-groups\/groups$/)

  const table = page.getByRole('table')

  await expectRowVisible(table, {
    Name: 'real-estate-devs',
    'Silo Role': 'silo.collaborator',
    Users: '2',
  })
  await expectRowVisible(table, { Name: 'kernel-devs', 'Silo Role': '—', Users: '1' })
  await expectRowVisible(table, { Name: 'web-devs', 'Silo Role': '—', Users: '1' })

  // Open the real-estate-devs group modal
  await page.getByRole('button', { name: 'real-estate-devs' }).click()
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()
  await expect(modal.getByText('silo.collaborator')).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'Hans Jonas' })).toBeVisible()
  await expect(modal.getByRole('cell', { name: 'Jane Austen' })).toBeVisible()
})
