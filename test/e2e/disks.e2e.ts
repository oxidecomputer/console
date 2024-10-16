/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { clickRowAction, expect, expectRowVisible, expectVisible, test } from './utils'

test('List disks and snapshot', async ({ page }) => {
  await page.goto('/projects/mock-project/disks')

  const table = page.getByRole('table')
  await expect(table.getByRole('row')).toHaveCount(12) // 11 + header

  // check one attached and one not attached
  await expectRowVisible(table, {
    'Attached to': 'db1',
    name: 'disk-1',
    size: '2 GiB',
    state: 'attached',
  })
  await expectRowVisible(table, {
    'Attached to': '',
    name: 'disk-3',
    size: '6 GiB',
    state: 'detached',
  })

  await clickRowAction(page, 'disk-1 db1', 'Snapshot')
  await expect(page.getByText("Creating snapshot of disk 'disk-1'").nth(0)).toBeVisible()
  // Next line is a little awkward, but we don't actually know what the snapshot name will be
  await expect(page.getByText('Snapshot disk-1-')).toBeVisible()
})

test('Disk snapshot error', async ({ page }) => {
  await page.goto('/projects/mock-project/disks')

  // special disk that triggers snapshot error
  await clickRowAction(page, 'disk-snapshot-error', 'Snapshot')
  await expect(
    page.getByText("Creating snapshot of disk 'disk-snapshot-error'").nth(0)
  ).toBeVisible()
  await expect(page.getByText('Failed to create snapshot').nth(0)).toBeVisible()
  await expect(page.getByText('Cannot snapshot disk').nth(0)).toBeVisible()
})

test.describe('Disk create', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/mock-project/disks-new')
    await page.getByRole('textbox', { name: 'Name' }).fill('a-new-disk')
  })

  test.afterEach(async ({ page }) => {
    await page.getByRole('button', { name: 'Create disk' }).click()

    await expect(page.getByText('Disk a-new-disk created')).toBeVisible()
    await expectVisible(page, ['role=cell[name="a-new-disk"]'])
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

  test('from image', async ({ page }) => {
    await page.getByRole('radio', { name: 'Image' }).click()
    await page.getByRole('button', { name: 'Source image' }).click()
    await page.getByRole('option', { name: 'image-3' }).click()
  })

  test('switching to snapshot and back to blank', async ({ page }) => {
    await page.getByRole('radio', { name: 'Snapshot' }).click()
    await page.getByRole('radio', { name: 'Blank' }).click()
  })
  /* eslint-enable playwright/expect-expect */
})
