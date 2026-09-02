/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test, type Page } from '@playwright/test'

// rows are role=button so they can be keyboard-toggled; the row's accessible
// name includes the operation, which is enough to pick a row
const row = (page: Page, operation: string) =>
  page.getByRole('button', { name: new RegExp(operation, 'i') }).first()

// the detail pane is the only place with a Raw JSON heading
const pane = (page: Page) =>
  page
    .getByRole('heading', { name: 'Raw JSON' })
    .locator('xpath=ancestor::div[contains(@class, "w-120")]')

test('lists entries and opens detail pane', async ({ page }) => {
  await page.goto('/system/audit-log')
  await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible()
  await expect(row(page, 'instance create')).toBeVisible()

  await row(page, 'instance create').click()
  const detail = pane(page)
  await expect(detail).toBeVisible()
  await expect(detail.getByText('Instance Create')).toBeVisible()
  // status badge in the header; the same number also appears in the raw JSON
  await expect(
    detail.getByRole('heading', { level: 3 }).locator('..').getByText('201')
  ).toBeVisible()

  // actor and silo IDs resolve to names, and the silo links to its page
  await expect(detail.getByText('Hannah Arendt')).toBeVisible()
  await expect(detail.getByRole('link', { name: 'maze-war' })).toBeVisible()

  await page.getByRole('button', { name: 'Close' }).click()
  await expect(detail).toBeHidden()
})

test('shows Not found for deleted actor and silo', async ({ page }) => {
  await page.goto('/system/audit-log')
  // this mock entry points at a user ID and silo ID that don't exist
  await row(page, 'instance delete').click()
  const detail = pane(page)
  await expect(detail.getByText('Instance Delete')).toBeVisible()
  await expect(detail.getByText('Not found')).toHaveCount(2)
})

test('keyboard navigation between entries', async ({ page }) => {
  await page.goto('/system/audit-log')
  await row(page, 'instance start').click()
  const detail = pane(page)
  await expect(detail.getByText('Instance Start')).toBeVisible()

  // arrows and j/k both move the selection while the pane is open
  await page.keyboard.press('ArrowDown')
  await expect(detail.getByText('Instance Delete')).toBeVisible()
  await page.keyboard.press('j')
  await expect(detail.getByText('User Login')).toBeVisible()
  await page.keyboard.press('k')
  await expect(detail.getByText('Instance Delete')).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(detail).toBeHidden()

  // with the pane closed, j does nothing
  await page.keyboard.press('j')
  await expect(detail).toBeHidden()
})
