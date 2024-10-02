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

test('Disabled actions', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  const bootDiskRow = page.getByRole('row', { name: 'disk-1', exact: false })
  await expect(bootDiskRow).toBeVisible()

  // Both buttons disabled, also test fancy tooltip

  await bootDiskRow.getByRole('button', { name: 'Row actions' }).click()

  const detachButton = page.getByRole('menuitem', { name: 'Detach' })
  const unsetButton = page.getByRole('menuitem', { name: 'Unset' })

  await expect(unsetButton).toBeDisabled()
  await page.getByRole('menuitem', { name: 'Unset' }).hover()
  await expect(
    page.getByText('Instance must be stopped before boot disk can be changed')
  ).toBeVisible()

  await expect(detachButton).toBeDisabled()
  await detachButton.hover()
  await expect(
    page.getByText('Boot disk must be unset before it can be detached')
  ).toBeVisible()
  await page.keyboard.press('Escape') // close menu

  const otherDiskRow = page.getByRole('row', { name: 'disk-2', exact: false })
  await expect(otherDiskRow).toBeVisible()

  await otherDiskRow.getByRole('button', { name: 'Row actions' }).click()

  const setButton = page.getByRole('menuitem', { name: 'Set as boot disk' })
  await expect(setButton).toBeDisabled()
  await setButton.hover()
  await expect(
    page.getByText('Instance must be stopped before boot disk can be changed')
  ).toBeVisible()

  await expect(detachButton).toBeDisabled()
  await detachButton.hover()
  await expect(
    page.getByText('Instance must be stopped before disk can be detached')
  ).toBeVisible()
  await page.keyboard.press('Escape') // close menu

  // confirm they become enabled when the instance is stopped
  await stopInstance(page)

  await bootDiskRow.getByRole('button', { name: 'Row actions' }).click()
  await expect(unsetButton).toBeEnabled()
  await expect(detachButton).toBeDisabled() // detach is always disabled on boot disk

  await otherDiskRow.getByRole('button', { name: 'Row actions' }).click()
  await expect(setButton).toBeEnabled()
  await expect(detachButton).toBeEnabled()
})

test('Attach disk', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  // Have to stop instance to edit disks
  await stopInstance(page)

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

test('Create disk', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  const row = page.getByRole('cell', { name: 'created-disk' })
  await expect(row).toBeHidden()

  // Have to stop instance to edit disks
  await stopInstance(page)

  // New disk form
  const createForm = page.getByRole('dialog', { name: 'Create disk' })
  await expect(createForm).toBeHidden()
  await page.getByRole('button', { name: 'Create disk' }).click()
  await expect(createForm).toBeVisible()

  await createForm.getByRole('textbox', { name: 'Name' }).fill('created-disk')
  await expect(createForm.getByRole('textbox', { name: 'Description' })).toBeVisible()

  await page.getByRole('radio', { name: 'Snapshot' }).click()
  await page.getByRole('button', { name: 'Source snapshot' }).click()
  await page.getByRole('option', { name: 'snapshot-heavy' }).click()

  await createForm.getByRole('button', { name: 'Create disk' }).click()

  const otherDisksTable = page.getByRole('table', { name: 'Other disks' })
  await expectRowVisible(otherDisksTable, { Disk: 'created-disk', size: '20 GiB' })
})

test('Detach disk', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  // Have to stop instance to edit disks
  await stopInstance(page)

  const successMsg = page.getByText('Disk detached').nth(0)
  const row = page.getByRole('row', { name: 'disk-2' })
  await expect(row).toBeVisible()
  await expect(successMsg).toBeHidden()

  await clickRowAction(page, 'disk-2', 'Detach')
  await expect(successMsg).toBeVisible()
  await expect(row).toBeHidden() // disk row goes away
})

test('Snapshot disk', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  // have to use nth with toasts because the text shows up in multiple spots
  const successMsg = page.getByText('Snapshot created').nth(0)
  await expect(successMsg).toBeHidden()

  await clickRowAction(page, 'disk-1', 'Snapshot')

  await expect(successMsg).toBeVisible() // we see the toast!

  // now go see the snapshot on the snapshots page
  await page.getByRole('link', { name: 'Snapshots' }).click()
  await page.getByRole('button', { name: 'next' }).click()
  const table = page.getByRole('table')
  await expectRowVisible(table, {
    name: expect.stringMatching(/^disk-1-/),
    disk: 'disk-1',
  })
})

test('Change boot disk', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  // assert disk-1 is boot disk, disk-2 also there
  const bootDiskTable = page.getByRole('table', { name: 'Boot disk' })
  const otherDisksTable = page.getByRole('table', { name: 'Other disks' })
  const confirm = page.getByRole('button', { name: 'Confirm' })
  const noBootDisk = page.getByText('No boot disk set')
  const noOtherDisks = page.getByText('No other disks')

  const disk1 = { Disk: 'disk-1', size: '2 GiB' }
  const disk2 = { Disk: 'disk-2', size: '4 GiB' }

  await expectRowVisible(bootDiskTable, disk1)
  await expectRowVisible(otherDisksTable, disk2)

  await stopInstance(page)

  // Set disk-2 as boot disk
  await clickRowAction(page, 'disk-2', 'Set as boot disk')
  await confirm.click()

  await expectRowVisible(bootDiskTable, disk2)
  await expectRowVisible(otherDisksTable, disk1)

  // Unset boot disk
  await expect(noBootDisk).toBeHidden()

  await clickRowAction(page, 'disk-2', 'Unset as boot disk')
  await confirm.click()

  await expect(noBootDisk).toBeVisible()
  await expectRowVisible(otherDisksTable, disk1)
  await expectRowVisible(otherDisksTable, disk2)

  await expect(page.getByText('Setting a boot disk is recommended')).toBeVisible()

  // detach disk so there's only one
  await clickRowAction(page, 'disk-2', 'Detach')

  await expect(page.getByText('Instance will boot from disk-1')).toBeVisible()

  // set disk-1 back as boot disk
  await clickRowAction(page, 'disk-1', 'Set as boot disk')
  await confirm.click()

  await expect(noBootDisk).toBeHidden()
  await expect(noOtherDisks).toBeVisible()

  // Remove disk-1 altogether, no disks left
  await clickRowAction(page, 'disk-1', 'Unset as boot disk')
  await confirm.click()

  await expectRowVisible(otherDisksTable, disk1)

  await clickRowAction(page, 'disk-1', 'Detach')
  await expect(noBootDisk).toBeVisible()
  await expect(noOtherDisks).toBeVisible()

  await expect(page.getByText('Attach a disk to be able to set a boot disk')).toBeVisible()
})
