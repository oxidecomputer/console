/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

test('Shows 404 page when a resource is not found', async ({ page }) => {
  await page.goto('/nonexistent')
  await expect(page.locator('text=Page not found')).toBeVisible()

  await page.goto('/projects/nonexistent')
  await expect(page.locator('text=Page not found')).toBeVisible()
})
