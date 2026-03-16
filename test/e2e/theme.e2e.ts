/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from './utils'

test('Serial console terminal updates colors on theme change', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/serial-console')

  const xterm = page.getByRole('application')
  await expect(xterm).toContainText('oxide-instance login:', { timeout: 15_000 })

  // xterm.js sets background-color inline on the .xterm-viewport element
  const viewport = page.locator('.xterm-viewport')
  const getBg = () => viewport.evaluate((el) => getComputedStyle(el).backgroundColor)

  const darkBg = await getBg()

  // switch to light via the user menu
  await page.getByRole('button', { name: 'User menu' }).click()
  await page.getByRole('menuitem', { name: 'Theme' }).click()
  await page.getByRole('menuitemradio', { name: 'Light' }).click()

  const lightBg = await getBg()
  expect(lightBg).not.toEqual(darkBg)

  // switch back to dark (menu is still open)
  await page.getByRole('menuitemradio', { name: 'Dark' }).click()

  expect(await getBg()).toEqual(darkBg)
})

test('Theme picker changes data-theme on <html>', async ({ page }) => {
  // default is light in Playwright, but don't rely on that
  await page.emulateMedia({ colorScheme: 'light' })

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

  // navigate fresh and confirm the choice persisted via localStorage
  // (page.reload() didn't work in Firefox)
  await page.goto('/projects')
  await expectTheme('light')

  // reopen and pick Dark
  await page.getByRole('button', { name: 'User menu' }).click()
  await page.getByRole('menuitem', { name: 'Theme' }).click()
  await page.getByRole('menuitemradio', { name: 'Dark' }).click()
  await expectTheme('dark')

  // pick System — resolves to the emulated scheme
  await page.getByRole('menuitemradio', { name: 'System' }).click()
  await expectTheme('light')

  // dismiss, emulate dark system preference, and confirm page is reactive
  await page.keyboard.press('Escape')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expectTheme('dark')
})
