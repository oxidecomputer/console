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

test('properties table stacks label above value on small screens', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')
  const props = page.getByLabel('Properties table')
  const label = props.getByText('cpu', { exact: true })
  const value = props.getByText('2 vCPUs')
  const columnCount = () =>
    props.evaluate(
      (element) => getComputedStyle(element).gridTemplateColumns.split(' ').length
    )

  await page.setViewportSize({ width: 404, height: 800 })
  await expect.poll(columnCount).toBe(1)
  const stacked = await Promise.all([label.boundingBox(), value.boundingBox()])
  expect(stacked[0]).toBeTruthy()
  expect(stacked[1]).toBeTruthy()
  expect(stacked[0]!.y).toBeLessThan(stacked[1]!.y)

  await page.setViewportSize({ width: 1000, height: 800 })
  await expect.poll(columnCount).toBe(4)
  const sideBySide = await Promise.all([label.boundingBox(), value.boundingBox()])
  expect(sideBySide[0]).toBeTruthy()
  expect(sideBySide[1]).toBeTruthy()
  expect(sideBySide[0]!.x).toBeLessThan(sideBySide[1]!.x)
})

test('date range picker is icon-only on small screens', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/metrics/cpu')
  const picker = page.getByLabel('Choose a date range', { exact: true })
  const button = picker.getByRole('button')

  await page.setViewportSize({ width: 404, height: 800 })
  await expect
    .poll(() => button.evaluate((element) => element.getBoundingClientRect().width))
    .toBeLessThan(50)

  await page.setViewportSize({ width: 1000, height: 800 })
  await expect
    .poll(() => button.evaluate((element) => element.getBoundingClientRect().width))
    .toBeGreaterThan(200)
})

test('metrics filters go full width on small screens', async ({ page }) => {
  await page.goto('/system/utilization?tab=metrics')
  const listbox = page.getByRole('button', { name: 'Filter by silo' })

  await page.setViewportSize({ width: 404, height: 800 })
  await expect
    .poll(() => listbox.evaluate((element) => element.getBoundingClientRect().width))
    .toBeGreaterThan(300)

  await page.setViewportSize({ width: 1000, height: 800 })
  await expect
    .poll(() =>
      listbox.evaluate((element) => Math.round(element.getBoundingClientRect().width))
    )
    .toBe(208)
})

test('tab list sticks under the top bar', async ({ page }) => {
  // Short viewport so the page can scroll far enough for the tabs to hit the
  // stick point (stacked properties above the tabs eat most of an 800px frame).
  await page.setViewportSize({ width: 404, height: 480 })
  await page.goto('/projects/mock-project/instances/db1/storage')

  const tabList = page.getByRole('tablist')
  const wrap = page.locator('.ox-tabs-list-wrap')
  await expect
    .poll(() => wrap.evaluate((element) => getComputedStyle(element).position))
    .toBe('sticky')

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect
    .poll(async () => {
      const box = await tabList.boundingBox()
      const top = await wrap.evaluate((element) =>
        parseFloat(getComputedStyle(element).top)
      )
      return box ? Math.abs(box.y - top) < 2 : false
    })
    .toBe(true)
})

test('CLI command is hidden on small screens', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/connect')
  const cli = page.getByRole('button', { name: 'CLI Command' })

  await page.setViewportSize({ width: 404, height: 800 })
  await expect(cli).toBeHidden()

  await page.setViewportSize({ width: 1000, height: 800 })
  await expect(cli).toBeVisible()
})
