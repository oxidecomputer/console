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
    Reason: 'Created by external API',
    Comment: 'Investigating slow instance start times',
  })
  await expectRowVisible(table, {
    state: 'collecting',
    Reason: 'Diagnosis: fan failure on sled BRM42220031',
  })
  await expectRowVisible(table, { state: 'failed' })

  // sorted newest first: collecting (Aug 1), active (Jul 30), failed (Jul 28)
  const rows = table.getByRole('row')
  await expect(rows.nth(1)).toContainText('collecting')
  await expect(rows.nth(2)).toContainText('active')
  await expect(rows.nth(3)).toContainText('failed')

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

test('failed bundle shows failure reason on tip icon hover', async ({ page }) => {
  await page.goto('/system/support-bundles')

  const row = page.getByRole('row', { name: 'failed' })
  await row.getByRole('button', { name: 'Tip' }).hover()
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

  const activeRow = page.getByRole('row', { name: 'Investigating slow' })
  await activeRow.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Download' })).toBeEnabled()
})

test('bundle detail modal shows metadata for active bundle', async ({ page }) => {
  await page.goto('/system/support-bundles')

  // ID cell links to the detail modal
  await page.getByRole('link', { name: 'ccdac0…359c31' }).click()
  await expect(page).toHaveURL(
    '/system/support-bundles/ccdac005-66a8-4921-9e8b-30531c359c31'
  )

  const modal = page.getByRole('dialog', { name: 'Support bundle' })
  await expect(modal.getByLabel('ccdac005-66a8-4921-9e8b-30531c359c31')).toBeVisible()
  await expect(modal.getByText('active')).toBeVisible()

  // file count comes from the index endpoint, size from a HEAD of download
  await expect(modal.getByText('8', { exact: true })).toBeVisible()
  await expect(modal.getByText('2.4 GiB')).toBeVisible()

  await expect(modal.getByRole('button', { name: 'Download bundle' })).toBeEnabled()

  // comment is editable in place; save is disabled until it changes
  await expect(modal.getByRole('textbox', { name: 'Comment' })).toHaveValue(
    'Investigating slow instance start times'
  )
  await expect(modal.getByRole('button', { name: 'Update comment' })).toBeDisabled()

  await modal.getByRole('button', { name: 'Cancel' }).click()
  await expect(modal).toBeHidden()
  await expect(page).toHaveURL('/system/support-bundles')
})

test('bundle detail modal for failed bundle', async ({ page }) => {
  await page.goto('/system/support-bundles')

  await page.getByRole('link', { name: 'bfc48b…fe3a7c' }).click()

  const modal = page.getByRole('dialog', { name: 'Support bundle' })
  await expect(modal.getByText('failed')).toBeVisible()
  await expect(modal.getByText(/Allocated dataset/)).toBeVisible()

  // no zip exists, so no file count or size rows and no download
  await expect(modal.getByText('Files')).toBeHidden()
  await expect(modal.getByText('Size')).toBeHidden()
  const download = modal.getByRole('button', { name: 'Download bundle' })
  await expect(download).toBeDisabled()
  await download.hover()
  // getByText rather than role=tooltip: the open modal makes the portaled
  // tooltip aria-hidden, so it has no role, but it is still visible
  await expect(
    page.getByText('Only bundles that have completed collection can be downloaded')
  ).toBeVisible()
})

test('detail modal polls a collecting bundle to active', async ({ page }) => {
  await page.goto('/system/support-bundles')

  await page.getByRole('link', { name: 'New Support Bundle' }).click()
  await page.getByRole('textbox', { name: 'Comment' }).fill('poll me')
  await page.getByRole('button', { name: 'Create support bundle' }).click()
  await expectToast(page, 'Support bundle created')

  // open the new bundle's detail modal while it's still collecting. the ID
  // link is the only link in the row
  await page.getByRole('row', { name: 'poll me' }).getByRole('link').click()

  const modal = page.getByRole('dialog', { name: 'Support bundle' })
  await expect(modal.getByText('collecting')).toBeVisible()
  await expect(modal.getByRole('button', { name: 'Download bundle' })).toBeDisabled()

  // mock flips the bundle to active after 3s; the modal's view query polls
  // every 10s, so the open modal updates in place
  await expect(modal.getByText('active')).toBeVisible({ timeout: 20_000 })
  await expect(modal.getByRole('button', { name: 'Download bundle' })).toBeEnabled()
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

  await clickRowAction(page, 'Investigating slow', 'View details')
  await expect(page).toHaveURL(
    '/system/support-bundles/ccdac005-66a8-4921-9e8b-30531c359c31'
  )

  const comment = page.getByRole('textbox', { name: 'Comment' })
  await expect(comment).toHaveValue('Investigating slow instance start times')
  await comment.fill('Resolved, keeping for reference')
  await page.getByRole('button', { name: 'Update comment' }).click()

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
  await expectToast(page, /Deleting support bundle/)

  await expect(table.getByRole('row')).toHaveCount(3)
})

test('delete active bundle transitions to destroying', async ({ page }) => {
  await page.goto('/system/support-bundles')

  await clickRowAction(page, 'Investigating slow', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, /Deleting support bundle/)

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
