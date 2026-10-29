/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from '@playwright/test'

import { expectRowVisible, getPageAsUser } from './utils'

test('problem list tabs', async ({ page }) => {
  await page.goto('/system/problems')
  await expect(page).toHaveTitle('Problems / Oxide Console')
  await expect(page.getByRole('heading', { name: 'Problems' })).toBeVisible()

  const table = page.getByRole('table')
  await expectRowVisible(table, {
    Summary: 'Not a Real Problem',
    Class: 'system',
    Code: '0',
  })
  await expect(table.getByRole('columnheader', { name: 'Resolved' })).toBeHidden()

  await page.getByRole('tab', { name: 'Resolved' }).click()
  await expect(page).toHaveURL(/tab=resolved/)
  await expect(table.getByRole('columnheader', { name: 'Resolved' })).toBeVisible()
  await expectRowVisible(table, { Summary: 'Not a Real Problem' })
  await expect(page.getByText('Something went wrong')).toBeHidden()
})

test('problem detail with nothing attached', async ({ page }) => {
  await page.goto('/system/problems')
  await page.getByRole('link', { name: 'Not a Real Problem' }).click()

  await expect(page.getByRole('heading', { name: 'Not a Real Problem' })).toBeVisible()
  await expect(page.getByText('If you encounter this problem in real life')).toBeVisible()

  // Nexus doesn't record any of these yet
  for (const empty of [
    'No impacted resources',
    'No related problems',
    'No alerts',
    'No support bundles',
  ]) {
    await expect(page.getByText(empty)).toBeVisible()
  }
})

test('dev user gets 404 on problems page', async ({ browser }) => {
  const page = await getPageAsUser(browser, 'Hans Jonas')
  await page.goto('/system/problems')
  await expect(page.getByText('Page not found')).toBeVisible()
})
