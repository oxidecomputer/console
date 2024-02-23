/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

test.describe('/lookup/i', () => {
  test('404s on existing name', async ({ page }) => {
    await page.goto('/lookup/i/db1')
    await expect(page.getByText('Page not found')).toBeVisible()
  })

  test('404s on empty ID', async ({ page }) => {
    await page.goto('/lookup/i/')
    await expect(page.getByText('Page not found')).toBeVisible()
  })

  test('looks up instance by ID', async ({ page }) => {
    await page.goto('/lookup/i/935499b3-fd96-432a-9c21-83a3dc1eece4')
    await expect(page).toHaveURL('/projects/mock-project/instances/db1/storage')
  })
})

test.describe('/lookup/instances', () => {
  test('404s on existing name', async ({ page }) => {
    await page.goto('/lookup/instances/db1')
    await expect(page.getByText('Page not found')).toBeVisible()
  })

  test('404s on empty ID', async ({ page }) => {
    await page.goto('/lookup/instances/')
    await expect(page.getByText('Page not found')).toBeVisible()
  })

  test('looks up instance by ID', async ({ page }) => {
    await page.goto('/lookup/instances/935499b3-fd96-432a-9c21-83a3dc1eece4')
    await expect(page).toHaveURL('/projects/mock-project/instances/db1/storage')
  })
})
