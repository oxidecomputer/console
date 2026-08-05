/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from '@playwright/test'

import { clickRowAction, expectRowVisible, expectToast, getPageAsUser } from './utils'

test('support bundle list', async ({ page }) => {
  await page.goto('/system/support-bundles')
  await expect(page).toHaveTitle('Support Bundles / Oxide Console')
  await expect(page.getByRole('heading', { name: 'Support Bundles' })).toBeVisible()

  const table = page.getByRole('table')
  await expect(table.getByRole('row')).toHaveCount(4) // header + 3 bundles

  await expectRowVisible(table, {
    state: 'active',
    Size: '2.4 GiB',
    Reason: 'Created by external API',
    Comment: 'Investigating slow instance start times',
  })
  await expectRowVisible(table, {
    state: 'collecting',
    Size: '—',
    Reason: 'Diagnosis: fan failure on sled BRM42220031',
  })
  await expectRowVisible(table, { state: 'failed', Size: '—' })

  // docs popover links to the troubleshooting guide. filter to external links
  // because the sidebar and breadcrumb links have the same name
  await page.getByRole('button', { name: 'Learn about support bundles' }).click()
  const docsLink = page
    .getByRole('link', { name: 'Support Bundles' })
    .and(page.locator('[target="_blank"]'))
  await expect(docsLink).toHaveAttribute(
    'href',
    'https://docs.oxide.computer/guides/troubleshooting#_support_bundles'
  )
})

test('failed bundle state badge shows failure reason on hover', async ({ page }) => {
  await page.goto('/system/support-bundles')

  const row = page.getByRole('row', { name: 'failed' })
  await row.getByText('failed').hover()
  await expect(page.getByRole('tooltip')).toHaveText('Allocated dataset no longer exists')
})

test('download only available for active bundles', async ({ page }) => {
  await page.goto('/system/support-bundles')

  // collecting bundle: download disabled with reason
  const collectingRow = page.getByRole('row', { name: 'fan failure' })
  await collectingRow.getByRole('button', { name: 'Row actions' }).click()
  const downloadItem = page.getByRole('menuitem', { name: 'Download' })
  await expect(downloadItem).toBeDisabled()
  await downloadItem.hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    'Only bundles that have completed collection can be downloaded'
  )
  await page.keyboard.press('Escape')

  // active bundle: download works and produces a zip
  const activeRow = page.getByRole('row', { name: 'Investigating slow' })
  await activeRow.getByRole('button', { name: 'Row actions' }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('menuitem', { name: 'Download' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe(
    'support-bundle-ccdac005-66a8-4921-9e8b-30531c359c31.zip'
  )
})

test('view files in an active bundle', async ({ page }) => {
  await page.goto('/system/support-bundles')

  await clickRowAction(page, 'Investigating slow', 'View files')
  await expect(page).toHaveURL(
    '/system/support-bundles/ccdac005-66a8-4921-9e8b-30531c359c31/files'
  )

  const modal = page.getByRole('dialog', { name: 'Support bundle files' })
  await expect(modal).toBeVisible()

  // root listing: dirs first, then files
  await expect(modal.getByRole('button', { name: 'meta' })).toBeVisible()
  await expect(modal.getByRole('button', { name: 'bundle_id.txt' })).toBeVisible()

  // Download bundle button at top fetches the whole bundle zip
  const bundleDownloadPromise = page.waitForEvent('download')
  await modal.getByRole('button', { name: 'Download bundle', exact: true }).click()
  const bundleDownload = await bundleDownloadPromise
  expect(bundleDownload.suggestedFilename()).toBe(
    'support-bundle-ccdac005-66a8-4921-9e8b-30531c359c31.zip'
  )

  // drill into meta/ and view a JSON file inline
  await modal.getByRole('button', { name: 'meta', exact: true }).click()
  await modal.getByRole('button', { name: 'report.json' }).click()
  await expect(modal.getByText('"host info: sled 0"')).toBeVisible()

  // back returns to the meta/ listing
  await modal.getByRole('button', { name: 'Back' }).click()
  await expect(modal.getByRole('button', { name: 'reason_for_creation.txt' })).toBeVisible()

  // breadcrumb root button returns to the root listing, where the nested
  // zip is download-only
  await modal.getByRole('button', { name: '/', exact: true }).click()
  await modal.getByRole('button', { name: 'sp_task_dumps' }).click()
  await modal.getByRole('button', { name: 'switch_0' }).click()
  const downloadPromise = page.waitForEvent('download')
  await modal.getByRole('button', { name: 'dump-0.zip' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('dump-0.zip')
})

test('view files disabled for collecting bundle', async ({ page }) => {
  await page.goto('/system/support-bundles')

  const row = page.getByRole('row', { name: 'fan failure' })
  await row.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'View files' })).toBeDisabled()
})

test('create support bundle and poll to active', async ({ page }) => {
  await page.goto('/system/support-bundles')

  await page.getByRole('link', { name: 'New Support Bundle' }).click()
  await expect(page).toHaveURL('/system/support-bundles-new')

  await page.getByRole('textbox', { name: 'Comment' }).fill('test bundle')
  await page.getByRole('button', { name: 'Create support bundle' }).click()

  await expectToast(page, 'Support bundle created')

  const table = page.getByRole('table')
  await expectRowVisible(table, { state: 'collecting', Comment: 'test bundle' })

  // mock API flips it to active after 3s; list polls every 10s while any
  // bundle is transitioning
  const row = table.getByRole('row', { name: 'test bundle' })
  await expect(row.getByText('active')).toBeVisible({ timeout: 20_000 })
})

test('create shows insufficient capacity error in modal', async ({ page }) => {
  await page.goto('/system/support-bundles-new')

  await page.getByRole('textbox', { name: 'Comment' }).fill('no space')
  await page.getByRole('button', { name: 'Create support bundle' }).click()

  // error renders in the modal, which stays open
  const modal = page.getByRole('dialog', { name: 'Create support bundle' })
  await expect(modal.getByText(/one per external disk/)).toBeVisible()
})

test('edit support bundle comment', async ({ page }) => {
  await page.goto('/system/support-bundles')

  await clickRowAction(page, 'Investigating slow', 'Edit comment')
  await expect(page).toHaveURL(
    '/system/support-bundles/ccdac005-66a8-4921-9e8b-30531c359c31/edit'
  )

  const comment = page.getByRole('textbox', { name: 'Comment' })
  await expect(comment).toHaveValue('Investigating slow instance start times')
  await comment.fill('Resolved, keeping for reference')
  await page.getByRole('button', { name: 'Update support bundle' }).click()

  await expectToast(page, 'Support bundle updated')
  await expectRowVisible(page.getByRole('table'), {
    Comment: 'Resolved, keeping for reference',
  })
})

test('delete failed bundle removes it immediately', async ({ page }) => {
  await page.goto('/system/support-bundles')

  const table = page.getByRole('table')
  await expect(table.getByRole('row')).toHaveCount(4)

  await clickRowAction(page, 'failed', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, /deleted/)

  await expect(table.getByRole('row')).toHaveCount(3)
})

test('delete active bundle transitions to destroying', async ({ page }) => {
  await page.goto('/system/support-bundles')

  await clickRowAction(page, 'Investigating slow', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, /deleted/)

  const table = page.getByRole('table')
  await expectRowVisible(table, { state: 'destroying' })

  // mock API removes the bundle 3s later; polling picks it up
  await expect(table.getByRole('row', { name: 'destroying' })).toBeHidden({
    timeout: 20_000,
  })
})

test('delete collecting bundle warns about cancellation', async ({ page }) => {
  await page.goto('/system/support-bundles')

  await clickRowAction(page, 'fan failure', 'Delete')
  await expect(
    page.getByText('This bundle is still being collected', { exact: false })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click()
})

test('dev user gets 404 on support bundles page', async ({ browser }) => {
  const page = await getPageAsUser(browser, 'Hans Jonas')
  await page.goto('/system/support-bundles')
  await expect(page.getByText('Page not found')).toBeVisible()
})
