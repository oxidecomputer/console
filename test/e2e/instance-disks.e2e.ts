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
  expectNoToast,
  expectNotVisible,
  expectRowVisible,
  expectToast,
  expectVisible,
  stopInstance,
  test,
} from './utils'

test('Disk detail side modal', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  await page.getByRole('button', { name: 'disk-1' }).click()

  const modal = page.getByRole('dialog', { name: 'Disk details' })
  await expect(modal).toBeVisible()
  await expect(modal.getByText('disk-1')).toBeVisible()
  await expect(modal.getByText('2 GiB')).toBeVisible()
})

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
  await page.goto('/projects/mock-project/instances/db-stopped')

  // Attach existing disk form
  await page.click('role=button[name="Attach existing disk"]')

  // Disk is required
  await expectNotVisible(page, ['text="Disk name is required"'])
  await page.getByRole('button', { name: 'Attach disk' }).click()
  await expectVisible(page, ['role=dialog >> text="Disk name is required"'])

  await page.getByRole('combobox', { name: 'Disk name' }).click()
  // disk-stopped-boot is already attached, so should not be visible in the list
  await expectNotVisible(page, ['role=option[name="disk-stopped-boot"]'])
  await expectVisible(page, ['role=option[name="disk-3"]', 'role=option[name="disk-4"]'])
  await page.click('role=option[name="disk-3"]')

  await page.click('role=button[name="Attach disk"]')
  await expectVisible(page, ['role=cell[name="disk-3"]'])
})

test('Combobox typing after select', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')
  await stopInstance(page)

  await page.getByRole('button', { name: 'Attach existing disk' }).click()

  const combobox = page.getByRole('combobox', { name: 'Disk name' })
  await combobox.click()
  await page.getByRole('option', { name: 'disk-3' }).click()
  await expect(combobox).toHaveValue('disk-3')

  // Click out, then click back in.
  const dialogTitle = page
    .getByRole('dialog')
    .getByText('Attach disk', { exact: true })
    .first()
  await dialogTitle.click()
  await combobox.click()

  // Typing edits the visible input AND filters the dropdown in lockstep.
  await combobox.press('End')
  await combobox.pressSequentially('zzz')
  await expect(combobox).toHaveValue('disk-3zzz')
  await expect(page.getByRole('option', { name: 'disk-3', exact: true })).toBeHidden()
  await expect(page.getByRole('option', { name: 'No items match' })).toBeVisible()

  // Blurring (closing the dropdown) without picking anything reverts the
  // input to the still-selected label. The form value is unchanged.
  await dialogTitle.click()
  await expect(combobox).toHaveValue('disk-3')

  // Backspacing then blurring also reverts: selection is sticky.
  await combobox.click()
  await combobox.press('End')
  await combobox.press('Backspace')
  await expect(combobox).toHaveValue('disk-')
  await dialogTitle.click()
  await expect(combobox).toHaveValue('disk-3')

  // Submitting now uses the still-selected value.
  await page.getByRole('button', { name: 'Attach disk' }).click()
  await expect(page.getByRole('cell', { name: 'disk-3' })).toBeVisible()
})

test('Create disk', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db-stopped')

  const row = page.getByRole('cell', { name: 'created-disk' })
  await expect(row).toBeHidden()

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

  const otherDisksTable = page.getByRole('table', { name: 'Additional disks' })
  await expectRowVisible(otherDisksTable, { Disk: 'created-disk', size: '20 GiB' })
})

test('Detach disk', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db-stopped')

  const successMsg = page.getByText('Disk disk-stopped-data detached').first()
  const row = page.getByRole('row', { name: 'disk-stopped-data' })
  await expect(row).toBeVisible()
  await expect(successMsg).toBeHidden()

  await clickRowAction(page, 'disk-stopped-data', 'Detach')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(successMsg).toBeVisible()
  await expect(row).toBeHidden() // disk row goes away
})

test('Snapshot disk', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  // we don't know the full name of the disk, but this will work to find the toast
  const toastMessage = /Snapshot disk-1-[a-z0-9]{6} created/
  await expectNoToast(page, toastMessage)

  await clickRowAction(page, 'disk-1', 'Snapshot')

  await expectToast(page, toastMessage) // we see the toast!

  // now go see the snapshot on the snapshots page
  await page.getByRole('link', { name: 'Snapshots' }).click()
  await page.getByRole('button', { name: 'next' }).click()
  const table = page.getByRole('table')
  await expectRowVisible(table, {
    name: expect.stringMatching(/^disk-1-/),
    disk: 'disk-1',
  })
})

test('Attach disk error clears when modal closes', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db-stopped')

  // Attach disks until we hit the limit
  const disksToAttach = [
    'disk-3',
    'disk-4',
    'disk-5',
    'disk-6',
    'disk-7',
    'disk-8',
    'disk-9',
    'disk-10',
    'local-disk',
    'read-only-disk',
  ]

  const attachModal = page.getByRole('dialog', { name: 'Attach disk' })

  // Attach all available disks quickly to reach the 12 disk limit
  for (const diskName of disksToAttach) {
    await page.getByRole('button', { name: 'Attach existing disk' }).click()
    await page.getByRole('combobox', { name: 'Disk name' }).click()
    await page.getByRole('option', { name: diskName }).click()
    await page.getByRole('button', { name: 'Attach disk' }).click()
    await expect(attachModal).toBeHidden()
  }

  // Now try to attach one more and get an error
  await page.getByRole('button', { name: 'Attach existing disk' }).click()
  await expect(attachModal).toBeVisible()

  await page.getByRole('combobox', { name: 'Disk name' }).click()
  await page.getByRole('option', { name: 'disk-snapshot-error' }).click()
  await page.getByRole('button', { name: 'Attach disk' }).click()

  // Should see error about max disks
  await expect(
    page.getByText('Cannot attach more than 12 disks to an instance')
  ).toBeVisible()

  // Close the modal - this is the key part of the bug test
  await page.keyboard.press('Escape')
  await expect(attachModal).toBeHidden()

  // Detach one disk to make room
  await clickRowAction(page, 'disk-10', 'Detach')
  await page.getByRole('button', { name: 'Confirm' }).click()

  // Try to attach again - error should be cleared (this was the bug)
  await page.getByRole('button', { name: 'Attach existing disk' }).click()
  await expect(attachModal).toBeVisible()

  // The error should NOT be visible anymore
  await expect(
    page.getByText('Cannot attach more than 12 disks to an instance')
  ).toBeHidden()

  // Should be able to successfully attach now
  await page.getByRole('combobox', { name: 'Disk name' }).click()
  await page.getByRole('option', { name: 'disk-snapshot-error' }).click()
  await page.getByRole('button', { name: 'Attach disk' }).click()

  await expect(attachModal).toBeHidden()
})

test('Change boot disk', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db-stopped')

  const bootDiskTable = page.getByRole('table', { name: 'Boot disk' })
  const otherDisksTable = page.getByRole('table', { name: 'Additional disks' })
  const confirm = page.getByRole('button', { name: 'Confirm' })
  const noBootDisk = page.getByText('No boot disk set')
  const noOtherDisks = page.getByText('No other disks')

  const bootDisk = { Disk: 'disk-stopped-boot', size: '2 GiB' }
  const dataDisk = { Disk: 'disk-stopped-data', size: '4 GiB' }

  await expectRowVisible(bootDiskTable, bootDisk)
  await expectRowVisible(otherDisksTable, dataDisk)

  // Set disk-stopped-data as boot disk
  await clickRowAction(page, 'disk-stopped-data', 'Set as boot disk')
  await confirm.click()

  await expectRowVisible(bootDiskTable, dataDisk)
  await expectRowVisible(otherDisksTable, bootDisk)

  // Unset boot disk
  await expect(noBootDisk).toBeHidden()

  await clickRowAction(page, 'disk-stopped-data', 'Unset as boot disk')
  await confirm.click()

  await expect(noBootDisk).toBeVisible()
  await expectRowVisible(otherDisksTable, bootDisk)
  await expectRowVisible(otherDisksTable, dataDisk)

  await expect(page.getByText('Setting a boot disk is recommended')).toBeVisible()

  // detach disk so there's only one
  await clickRowAction(page, 'disk-stopped-data', 'Detach')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(page.getByText('Instance will boot from disk-stopped-boot')).toBeVisible()

  // set disk-stopped-boot back as boot disk
  await clickRowAction(page, 'disk-stopped-boot', 'Set as boot disk')
  await confirm.click()

  await expect(noBootDisk).toBeHidden()
  await expect(noOtherDisks).toBeVisible()

  // Remove disk-stopped-boot altogether, no disks left
  await clickRowAction(page, 'disk-stopped-boot', 'Unset as boot disk')
  await confirm.click()

  await expectRowVisible(otherDisksTable, bootDisk)

  await clickRowAction(page, 'disk-stopped-boot', 'Detach')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(noBootDisk).toBeVisible()
  await expect(noOtherDisks).toBeVisible()

  await expect(page.getByText('Attach a disk to be able to set a boot disk')).toBeVisible()
})
