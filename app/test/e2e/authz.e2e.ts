/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, getPageAsUser, test } from './utils'

test.describe('Silo/system picker', () => {
  test('appears for fleet viewer', async ({ page }) => {
    await page.goto('/projects')
    await expect(page.getByRole('link', { name: 'SILO maze-war' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Switch between system and silo' })
    ).toBeVisible()
  })

  test('does not appear to for dev user', async ({ browser }) => {
    const page = await getPageAsUser(browser, 'Hans Jonas')
    await page.goto('/projects')
    await expect(page.getByRole('link', { name: 'SILO maze-war' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Switch between system and silo' })
    ).toBeHidden()
  })
})

test('dev user gets 404 on system pages', async ({ browser }) => {
  const page = await getPageAsUser(browser, 'Hans Jonas')
  await page.goto('/system/silos')
  await expect(page.getByText('Page not found')).toBeVisible()

  await page.goto('/system/utilization')
  await expect(page.getByText('Page not found')).toBeVisible()

  await page.goto('/system/inventory/sleds')
  await expect(page.getByText('Page not found')).toBeVisible()
})
