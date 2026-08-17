/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Page } from '@playwright/test'

import { expect, test } from './utils'

/** Seed theme preference into localStorage before any page loads. */
async function seedTheme(page: Page, theme: string) {
  await page.addInitScript((t) => {
    localStorage.setItem(
      'theme-preference',
      JSON.stringify({ state: { theme: t }, version: 0 })
    )
  }, theme)
}

/**
 * Block the app entry so React never boots. This isolates theme-init.js,
 * letting us test the pre-hydration theme. The #root empty check in tests
 * ensures this block is still working.
 */
async function blockReact(page: Page) {
  await page.route('**/app/main.tsx*', (route) => route.abort('blockedbyclient'))
}

test.describe('theme-init.js (pre-hydration)', () => {
  test('defaults to dark with no stored preference', async ({ page }) => {
    await blockReact(page)
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#root')).toBeEmpty()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('respects stored light preference', async ({ page }) => {
    await seedTheme(page, 'light')
    await blockReact(page)
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#root')).toBeEmpty()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('respects stored dark preference', async ({ page }) => {
    await seedTheme(page, 'dark')
    await blockReact(page)
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#root')).toBeEmpty()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('system preference resolves to emulated color scheme', async ({ page }) => {
    await seedTheme(page, 'system')
    await blockReact(page)

    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#root')).toBeEmpty()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('forces dark on auth pages regardless of preference', async ({ page }) => {
    await seedTheme(page, 'light')
    await blockReact(page)

    for (const path of ['/login/default-silo/saml/mock-idp', '/device/verify']) {
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('#root')).toBeEmpty()
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    }
  })
})

test('Login and device pages force dark theme even when preference is light', async ({
  page,
}) => {
  // Set theme to light via the UI
  await page.goto('/projects')
  await page.getByRole('button', { name: 'User menu' }).click()
  await page.getByRole('menuitem', { name: 'Theme' }).click()
  await page.getByRole('menuitemradio', { name: 'Light' }).click()
  await page.keyboard.press('Escape')

  const html = page.locator('html')
  await expect(html).toHaveAttribute('data-theme', 'light')

  await page.goto('/login/default-silo/saml/mock-idp')
  await expect(html).toHaveAttribute('data-theme', 'dark')

  await page.goto('/device/verify')
  await expect(html).toHaveAttribute('data-theme', 'dark')
})

test('Serial console terminal updates colors on theme change', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/serial-console')

  const xterm = page.getByRole('application')
  await expect(xterm).toContainText('oxide-instance login:', { timeout: 15_000 })

  // xterm.js 6+ sets background-color inline on the .xterm-scrollable-element
  const scrollable = page.locator('.xterm-scrollable-element')
  const getBg = () => scrollable.evaluate((el) => getComputedStyle(el).backgroundColor)

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
