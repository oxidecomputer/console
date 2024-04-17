/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

test('date formatting - English locale', async ({ page }) => {
  await page.goto('/system/silos')
  await expect(page.getByText('Feb 28, 202312:00 AM')).toBeVisible()
})

test.describe('date formatting - German locale', () => {
  test.use({ locale: 'de-DE' })
  test('date formatting - German locale', async ({ page }) => {
    await page.goto('/system/silos')
    await expect(page.getByText('28.02.202300:00')).toBeVisible()
  })
})

test.describe('date formatting - French locale', () => {
  test.use({ locale: 'fr-FR' })
  test('date formatting - French locale', async ({ page }) => {
    await page.goto('/system/silos')
    await expect(page.getByText('28 févr. 202300:00')).toBeVisible()
  })
})
