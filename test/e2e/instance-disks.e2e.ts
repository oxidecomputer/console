/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  clickRowAction,
  expect,
  expectNotVisible,
  expectRowVisible,
  expectVisible,
  stopInstance,
  test,
} from './utils'

test('Attach disk', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  const row = page.getByRole('row', { name: 'disk-1', exact: false })
  await expect(row).toBeVisible()

  // can't detach, also test fancy construction of disabled tooltip
  await row.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Detach' })).toBeDisabled()
  await page.getByRole('menuitem', { name: 'Detach' }).hover()
  await expect(
    page.getByText('Instance must be stopped before disk can be detached')
  ).toBeVisible()
  await page.keyboard.press('Escape') // close menu

  // Have to stop instance to edit disks
  await stopInstance(page)

  // New disk form
  const createForm = page.getByRole('dialog', { name: 'Create disk' })
  await expect(createForm).toBeHidden()
  await page.getByRole('button', { name: 'Create disk' }).click()
  await expect(createForm).toBeVisible()

  await expect(createForm.getByRole('textbox', { name: 'Name' })).toBeVisible()
  await expect(createForm.getByRole('textbox', { name: 'Description' })).toBeVisible()
  await expect(
    createForm.getByRole('radiogroup', { name: 'Block size (Bytes)' })
  ).toBeVisible()
  await expect(createForm.getByRole('textbox', { name: 'Size (GiB)' })).toBeVisible()
  await expect(createForm.getByRole('button', { name: 'Create disk' })).toBeVisible()

  await page.click('role=button[name="Cancel"]')

  // Attach existing disk form
  await page.click('role=button[name="Attach existing disk"]')

  // Disk is required
  await expectNotVisible(page, ['text="Disk name is required"'])
  await page.getByRole('button', { name: 'Attach disk' }).click()
  await expectVisible(page, ['role=dialog >> text="Disk name is required"'])

  await page.click('role=button[name*="Disk name"]')
  // disk-1 is already attached, so should not be visible in the list
  await expectNotVisible(page, ['role=option[name="disk-1"]'])
  await expectVisible(page, ['role=option[name="disk-3"]', 'role=option[name="disk-4"]'])
  await page.click('role=option[name="disk-3"]')

  await page.click('role=button[name="Attach disk"]')
  await expectVisible(page, ['role=cell[name="disk-3"]'])
})

// TODO: move create form asserts to their own test and actually test the create!

test('Detach disk', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  // Have to stop instance to edit disks
  await stopInstance(page)

  const successMsg = page.getByText('Disk detached').nth(0)
  const row = page.getByRole('row', { name: 'disk-1' })
  await expect(row).toBeVisible()
  await expect(successMsg).toBeHidden()

  await clickRowAction(page, 'disk-1', 'Detach')
  await expect(successMsg).toBeVisible()
  await expect(row).toBeHidden() // disk row goes away
})

test('Snapshot disk', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  // have to use nth with toasts because the text shows up in multiple spots
  const successMsg = page.getByText('Snapshot created').nth(0)
  await expect(successMsg).toBeHidden()

  await clickRowAction(page, 'disk-2', 'Snapshot')

  await expect(successMsg).toBeVisible() // we see the toast!

  // now go see the snapshot on the snapshots page
  await page.getByRole('link', { name: 'Snapshots' }).click()
  await page.getByRole('button', { name: 'next' }).click()
  const table = page.getByRole('table')
  await expectRowVisible(table, {
    name: expect.stringMatching(/^disk-2-/),
    disk: 'disk-2',
  })
})

// TODO: tests for different combinations of boot and other disks
