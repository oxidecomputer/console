/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test, type Page } from '@playwright/test'

import { nexusSecurityHeaders } from '../../app/api/__generated__/nexus-console'

/** Collect page errors, console errors, and CSP violations */
async function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  // not every browser logs violations to the console
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      console.error(`CSP violation: ${event.violatedDirective} ${event.blockedURI}`)
    })
  })
  return errors
}

test('Production build runs under the Nexus CSP', async ({ page }) => {
  const errors = await trackErrors(page)
  try {
    const response = await page.goto('/projects/mock-project/instances')
    // make sure the test isn't passing because the server dropped the CSP
    expect(response?.headers()['content-security-policy']).toBe(
      nexusSecurityHeaders['content-security-policy']
    )

    await expect(page.getByRole('heading', { name: 'Instances' })).toBeVisible()
    // client-side navigation only works if the app hydrated
    await page.getByRole('link', { name: 'db1' }).click()
    await expect(page.getByRole('heading', { name: 'db1' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'disk-1' })).toBeVisible()
  } finally {
    // a CSP violation usually means the page never renders, so report the
    // errors instead of a missing heading
    expect(errors).toEqual([])
  }
})
