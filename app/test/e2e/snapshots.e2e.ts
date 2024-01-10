/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, expectNotVisible, expectRowVisible, expectVisible, test } from './utils'

test('Click through snapshots', async ({ page }) => {
  await page.goto('/projects/mock-project')
  await page.click('role=link[name*="Snapshots"]')
  await expectVisible(page, [
    'role=heading[name*="Snapshots"]',
    'role=cell[name="snapshot-1"]',
    'role=cell[name="snapshot-2"]',
    'role=cell[name="delete-500"]',
    'role=cell[name="snapshot-4"]',
    'role=cell[name="snapshot-disk-deleted"]',
  ])

  // test async disk name fetch
  const table = page.getByRole('table')
  await expectRowVisible(table, { name: 'snapshot-1', disk: 'disk-1' })
  await expectRowVisible(table, { name: 'snapshot-disk-deleted', disk: 'Deleted' })

  // Test pagination
  await page.getByRole('button', { name: 'next' }).click()
  await expectRowVisible(table, { name: 'disk-1-snapshot-25', disk: 'disk-1' })
  await page.getByRole('button', { name: 'prev', exact: true }).click()
  await expectVisible(page, [
    'role=heading[name*="Snapshots"]',
    'role=cell[name="snapshot-1"]',
    'role=cell[name="snapshot-2"]',
    'role=cell[name="delete-500"]',
    'role=cell[name="snapshot-4"]',
  ])
})

test('Confirm delete snapshot', async ({ page }) => {
  await page.goto('/projects/mock-project/snapshots')

  const row = page.getByRole('row', { name: 'disk-1-snapshot-5' })

  async function clickDelete() {
    await row.getByRole('button', { name: 'Row actions' }).click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()
  }

  await clickDelete()

  const modal = page.getByRole('dialog', { name: 'Confirm delete' })
  await expect(modal).toBeVisible()

  // cancel works
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(modal).toBeHidden()

  // get back in there
  await clickDelete()
  await page.getByRole('button', { name: 'Confirm' }).click()

  // modal closes, row is gone
  await expectNotVisible(page, [modal, row])
})

test('Error on delete snapshot', async ({ page }) => {
  await page.goto('/projects/mock-project/snapshots')

  const row = page.getByRole('row', { name: 'delete-500' })

  await row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()

  const modal = page.getByRole('dialog', { name: 'Confirm delete' })
  await expect(modal).toBeVisible()

  const spinner = page.getByRole('dialog').getByLabel('Spinner')
  await expect(spinner).toBeHidden()

  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(spinner).toBeVisible()

  // modal closes, but row is not gone and error toast is visible
  await expect(modal).toBeHidden()
  await expectVisible(page, [
    row,
    page.getByText('Could not delete resource', { exact: true }),
  ])
})

test('Create image from snapshot', async ({ page }) => {
  await page.goto('/projects/mock-project/snapshots')

  const row = page.getByRole('row', { name: 'snapshot-4' })
  await row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Create image' }).click()

  await expectVisible(page, ['role=dialog[name="Create image from snapshot"]'])

  await page.fill('role=textbox[name="Name"]', 'image-from-snapshot-4')
  await page.fill('role=textbox[name="Description"]', 'image description')
  await page.fill('role=textbox[name="OS"]', 'Ubuntu')
  await page.fill('role=textbox[name="Version"]', '20.02')

  await page.click('role=button[name="Create image"]')

  await expect(page).toHaveURL('/projects/mock-project/snapshots')

  await page.click('role=link[name*="Images"]')
  await expectRowVisible(page.getByRole('table'), {
    name: 'image-from-snapshot-4',
    description: 'image description',
  })
})

test('Create image from snapshot, name taken', async ({ page }) => {
  await page.goto('/projects/mock-project/snapshots')

  const row = page.getByRole('row', { name: 'snapshot-4' })
  await row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Create image' }).click()

  await expectVisible(page, ['role=dialog[name="Create image from snapshot"]'])

  await page.fill('role=textbox[name="Name"]', 'image-1')
  await page.click('role=button[name="Create image"]')

  await expect(page.getByText('name already exists').nth(0)).toBeVisible()
})
