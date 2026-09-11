/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { clickRowAction, expect, test } from './utils'

test('mobile user menu identifies the current user', async ({ page }) => {
  await page.setViewportSize({ width: 404, height: 800 })
  await page.goto('/projects')

  await page.getByRole('button', { name: 'User menu' }).click()

  const menu = page.getByRole('menu')
  await expect(menu.getByText('Hannah Arendt')).toBeVisible()
  // username is not an interactive item
  await expect(menu.getByRole('menuitem', { name: 'Hannah Arendt' })).toHaveCount(0)
})

test('mobile sidebar opens as an overlay and closes on dismiss or navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 404, height: 800 })
  await page.goto('/projects/mock-project/instances/db1/networking')

  const toggle = page.getByRole('button', { name: 'Toggle sidebar' })
  const disksLink = page
    .locator('nav[aria-label="Sidebar navigation"]')
    .getByRole('link', { name: 'Disks', exact: true })
  const userName = page
    .getByRole('button', { name: 'User menu' })
    .getByText('Hannah Arendt')

  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(disksLink).not.toBeInViewport()
  await expect(userName).toBeHidden()

  // The instance tab list is wider than a phone and should scroll within the page.
  const tabList = page.getByRole('tablist')
  await expect
    .poll(() =>
      tabList.evaluate((element) => ({
        overflowX: getComputedStyle(element).overflowX,
        overflows: element.scrollWidth > element.clientWidth,
      }))
    )
    .toEqual({ overflowX: 'auto', overflows: true })

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(disksLink).toBeInViewport()

  // Click the scrim to the right of the sidebar.
  await page.mouse.click(390, 100)
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(disksLink).not.toBeInViewport()

  await toggle.click()
  await disksLink.click()
  await expect(page).toHaveURL('/projects/mock-project/disks')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(disksLink).not.toBeInViewport()

  // Just below the desktop breakpoint, the drawer and hidden username persist.
  await page.setViewportSize({ width: 999, height: 800 })
  await expect(toggle).toBeVisible()
  await expect(disksLink).not.toBeInViewport()
  await expect(userName).toBeHidden()

  // At the desktop breakpoint the persistent sidebar replaces the toggle and
  // the username reappears.
  await page.setViewportSize({ width: 1000, height: 800 })
  await expect(toggle).toBeHidden()
  await expect(disksLink).toBeInViewport()
  await expect(userName).toBeVisible()
})

test('mobile dialogs and toasts stay within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/projects/mock-project/disks')

  await page.getByRole('link', { name: 'disk-1', exact: true }).click()
  const sideModal = page.getByRole('dialog', { name: 'Disk details' })
  await expect(sideModal).toBeVisible()
  await expect
    .poll(() =>
      sideModal.evaluate((element) => {
        const { left, right, width } = element.getBoundingClientRect()
        return { left, right, width }
      })
    )
    .toEqual({ left: 0, right: 320, width: 320 })
  await page.keyboard.press('Escape')
  await expect(sideModal).toBeHidden()

  await clickRowAction(page, 'disk-3', 'Delete')
  const confirmModal = page.getByRole('dialog', { name: 'Delete disk' })
  await expect(confirmModal).toBeVisible()
  await expect
    .poll(() =>
      confirmModal.evaluate((element) => {
        const { left, right, width } = element.getBoundingClientRect()
        return { left, right, width }
      })
    )
    .toEqual({ left: 16, right: 304, width: 288 })

  await confirmModal.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByTestId('Toasts').getByText('Disk disk-3 deleted')).toBeVisible()

  const toast = page.locator('.shadow-toast')
  await expect
    .poll(() =>
      toast.evaluate((element) => {
        const { left, right, width } = element.getBoundingClientRect()
        return { left, right, width }
      })
    )
    .toEqual({ left: 16, right: 304, width: 288 })
})
