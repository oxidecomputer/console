/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from './utils'

test('Theme picker changes data-theme on <html>', async ({ page }) => {
  await page.goto('/projects')
  const html = page.locator('html')

  const expectTheme = (s: string) => expect(html).toHaveAttribute('data-theme', s)

  // default is dark
  await expectTheme('dark')

  // open user menu > theme submenu
  await page.getByRole('button', { name: 'User menu' }).click()
  await page.getByRole('menuitem', { name: 'Theme' }).click()

  // pick Light
  await page.getByRole('menuitemradio', { name: 'Light' }).click()
  await expectTheme('light')

  // dismiss, reload, and confirm the choice persisted
  await page.reload()
  await expectTheme('light')

  // reopen and pick Dark
  await page.getByRole('button', { name: 'User menu' }).click()
  await page.getByRole('menuitem', { name: 'Theme' }).click()
  await page.getByRole('menuitemradio', { name: 'Dark' }).click()
  await expectTheme('dark')

  // pick System — resolves to the emulated scheme
  await page.getByRole('menuitemradio', { name: 'System' }).click()
  // Playwright defaults to prefers-color-scheme: light
  await expectTheme('light')

  // dismiss, emulate dark system preference, and confirm page is reactive
  await page.getByRole('heading', { name: 'Projects' }).click()
  await page.emulateMedia({ colorScheme: 'dark' })
  await expectTheme('dark')
})
