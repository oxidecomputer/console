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

  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
})

test('Shows something went wrong page on other errors', async ({ page }) => {
  const errors: Error[] = []
  // listen for 'pageerror' instead of 'console' because firefox wasn't including
  // the desired event in 'console'
  page.on('pageerror', (e) => errors.push(e))

  await page.goto('/projects/error-503') // specially handled in mock server
  await expect(page.getByText('Something went wrong')).toBeVisible()

  // Invariant failed doesn't show up in the page...
  await expect(page.getByText('Invariant failed')).toBeHidden()

  // but we do see it in the browser console
  const error =
    'Expected query to be prefetched.\nKey: ["projectView",{"path":{"project":"error-503"}}]'
  expect(errors.some((e) => e.message.includes(error))).toBeTruthy()

  // test clicking sign out
  await page.getByRole('button', { name: 'Sign out' }).click()
  // login route doesn't actually work in the mock setup  (in production this
  // is handled by nexus, and it's hard to get Vite to do the right thing here
  // without getting elaborate with middleware), so this is a 404, but we do end
  // up at the right URL
  await expect(page).toHaveURL('/login')
})
