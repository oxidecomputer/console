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
  expectRowVisible,
  expectToast,
  test,
} from './utils'

test('Disk detail side modal', async ({ page }) => {
  await page.goto('/projects/mock-project/disks')

  await page.getByRole('link', { name: 'disk-1', exact: true }).click()

  const modal = page.getByRole('dialog', { name: 'Disk details' })
  await expect(modal).toBeVisible()
  await expect(modal.getByText('disk-1')).toBeVisible()
  await expect(modal.getByText('2 GiB')).toBeVisible()
  await expect(modal.getByText('2,048 bytes')).toBeVisible() // block size
  await expect(modal.getByText('Read only')).toBeVisible()
  await expect(modal.getByText('No')).toBeVisible()
})

test('Read-only disk shows badge in table', async ({ page }) => {
  await page.goto('/projects/mock-project/disks')

  const table = page.getByRole('table')

  // Verify the read-only disk has the badge
  const readOnlyRow = table.getByRole('row', { name: /read-only-disk/ })
  await expect(readOnlyRow).toBeVisible()
  await expect(readOnlyRow.getByText('Read only', { exact: true })).toBeVisible()

  // Verify a regular disk does not have the badge
  const regularRow = table.getByRole('row', { name: /disk-1 db1/ })
  await expect(regularRow).toBeVisible()
  await expect(regularRow.getByText('Read only', { exact: true })).toBeHidden()
})

test('Read-only disk detail shows read-only status', async ({ page }) => {
  await page.goto('/projects/mock-project/disks')

  await page.getByRole('link', { name: 'read-only-disk' }).click()

  const modal = page.getByRole('dialog', { name: 'Disk details' })
  await expect(modal).toBeVisible()
  await expect(modal.getByText('Read only')).toBeVisible()
  await expect(modal.getByText('Yes')).toBeVisible()
})

test('List disks and snapshot', async ({ page }) => {
  await page.goto('/projects/mock-project/disks')

  const table = page.getByRole('table')
  await expect(table.getByRole('row')).toHaveCount(14) // 13 + header

  // check one attached and one not attached
  await expectRowVisible(table, {
    'Attached to': 'db1',
    name: 'disk-1',
    size: '2 GiB',
    state: 'attached',
  })
  await expectRowVisible(table, {
    'Attached to': '—',
    name: 'disk-3',
    size: '6 GiB',
    state: 'detached',
  })

  await clickRowAction(page, 'disk-1 db1', 'Snapshot')
  await expectToast(page, 'Creating snapshot of disk disk-1')
  // expectToast should have closed the toast already, but verify
  await expectNoToast(page, 'Creating snapshot of disk disk-1')
  // Next line is a little awkward, but we don't actually know what the snapshot name will be
  await expectToast(page, /Snapshot disk-1-[a-z0-9]{6} created/)
})

test('Disk snapshot error', async ({ page }) => {
  await page.goto('/projects/mock-project/disks')

  // special disk that triggers snapshot error
  await clickRowAction(page, 'disk-snapshot-error', 'Snapshot')
  await expectToast(page, 'Creating snapshot of disk disk-snapshot-error')
  // just including an actual expect to satisfy the linter
  await expect(page.getByRole('cell', { name: 'disk-snapshot-error' })).toBeVisible()
  // expectToast should have closed the toast already, but let's just verify …
  await expectNoToast(page, 'Creating snapshot of disk disk-snapshot-error')
  // … before we can check for the error toast
  await expectToast(page, 'Failed to create snapshotCannot snapshot disk')
})

test('Local disk snapshot disabled', async ({ page }) => {
  await page.goto('/projects/mock-project/disks')

  const row = page.getByRole('row', { name: 'local-disk', exact: false })
  await row.getByRole('button', { name: 'Row actions' }).click()

  const snapshotItem = page.getByRole('menuitem', { name: 'Snapshot' })
  await expect(snapshotItem).toBeDisabled()

  // hover to see tooltip with disabled reason
  await snapshotItem.hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    'Only distributed disks support snapshots'
  )
})

test.describe('Disk create', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/mock-project/disks-new')
    await expect(page.getByRole('dialog', { name: 'Create disk' })).toBeVisible()
    await page.getByRole('textbox', { name: 'Name' }).fill('a-new-disk')
  })

  test.afterEach(async ({ page }) => {
    await page.getByRole('button', { name: 'Create disk' }).click()

    await expect(page.getByRole('dialog', { name: 'Create disk' })).toBeHidden()
    await expectToast(page, 'Disk a-new-disk created')
    await expect(page.getByRole('cell', { name: 'a-new-disk' })).toBeVisible()
  })

  // expects are in the afterEach

  /* eslint-disable playwright/expect-expect */
  test('from blank', async ({ page }) => {
    await page.getByRole('radio', { name: '512' }).click()
  })

  test('from snapshot', async ({ page }) => {
    await page.getByRole('radio', { name: 'Snapshot' }).click()
    await page.getByRole('button', { name: 'Source snapshot' }).click()
    await page.getByRole('option', { name: 'delete-500' }).click()
  })

  // max-size snapshot required a fix
  test('from max-size snapshot', async ({ page }) => {
    await page.getByRole('radio', { name: 'Snapshot' }).click()
    await page.getByRole('button', { name: 'Source snapshot' }).click()
    await page.getByRole('option', { name: 'snapshot-max' }).click()
  })

  test('from image', async ({ page }) => {
    await page.getByRole('radio', { name: 'Image' }).click()
    await page.getByRole('button', { name: 'Source image' }).click()
    await page.getByRole('option', { name: 'image-3' }).click()
  })

  test('switching to snapshot and back to blank', async ({ page }) => {
    await page.getByRole('radio', { name: 'Snapshot' }).click()
    await page.getByRole('radio', { name: 'Blank' }).click()
  })

  test('local disk', async ({ page }) => {
    const source = page.getByRole('radiogroup', { name: 'Source' })
    const blockSize = page.getByRole('radiogroup', { name: 'Block size' })
    // verify source and block size are visible for distributed (default)
    await expect(source).toBeVisible()
    await expect(blockSize).toBeVisible()

    await page.getByRole('radio', { name: 'Local' }).click()

    // source and block size options should disappear when local is selected
    await expect(source).toBeHidden()
    await expect(blockSize).toBeHidden()
  })
  /* eslint-enable playwright/expect-expect */
})

test('Create disk from snapshot with read-only', async ({ page }) => {
  await page.goto('/projects/mock-project/disks-new')
  await page.getByRole('textbox', { name: 'Name' }).fill('a-new-disk')
  await page.getByRole('radio', { name: 'Snapshot' }).click()
  await page.getByRole('button', { name: 'Source snapshot' }).click()
  await page.getByRole('option', { name: 'delete-500' }).click()
  await page.getByRole('checkbox', { name: 'Make disk read-only' }).check()

  await page.getByRole('button', { name: 'Create disk' }).click()
  await expect(page.getByRole('dialog', { name: 'Create disk' })).toBeHidden()

  const row = page.getByRole('row', { name: /a-new-disk/ })
  await expect(row.getByText('Read only', { exact: true })).toBeVisible()

  // Verify snapshot ID in detail modal
  await page.getByRole('link', { name: 'a-new-disk' }).click()
  const modal = page.getByRole('dialog', { name: 'Disk details' })
  await expect(modal.getByText('e6c58826-62fb-4205-820e-620407cd04e7')).toBeVisible()
})

test('Create disk from image with read-only', async ({ page }) => {
  await page.goto('/projects/mock-project/disks-new')
  await page.getByRole('textbox', { name: 'Name' }).fill('a-new-disk')
  await page.getByRole('radio', { name: 'Image' }).click()
  await page.getByRole('button', { name: 'Source image' }).click()
  await page.getByRole('option', { name: 'image-3' }).click()
  await page.getByRole('checkbox', { name: 'Make disk read-only' }).check()

  await page.getByRole('button', { name: 'Create disk' }).click()
  await expect(page.getByRole('dialog', { name: 'Create disk' })).toBeHidden()

  const row = page.getByRole('row', { name: /a-new-disk/ })
  await expect(row.getByText('Read only', { exact: true })).toBeVisible()

  // Verify image ID in detail modal
  await page.getByRole('link', { name: 'a-new-disk' }).click()
  const modal = page.getByRole('dialog', { name: 'Disk details' })
  await expect(modal.getByText('4700ecf1-8f48-4ecf-b78e-816ddb76aaca')).toBeVisible()
})
