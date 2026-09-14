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

const pane = (page: Page) => page.getByRole('complementary', { name: 'Audit log entry' })

test('lists entries and opens detail pane', async ({ page }) => {
  await page.goto('/system/audit-log')
  await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible()
  await expect(row(page, 'instance create')).toBeVisible()

  // the compact timestamp has no year or zone, so the full UTC value is in a
  // tooltip. mock times are relative to now, so only check the shape
  await row(page, 'instance create').locator('time').hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
  )

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

test('stops offering Load More after a short page', async ({ page }) => {
  await page.goto('/system/audit-log')
  await expect(row(page, 'instance create')).toBeVisible()

  // the default range holds more than one page, so the first page is full
  const loadMore = page.getByRole('button', { name: 'Load More' })
  await expect(loadMore).toBeVisible()
  await loadMore.click()

  // the second page is short. The API still returns a next-page token, but a
  // short page means there's nothing left, so the button should give way
  await expect(page.getByText('No more logs in selected time range')).toBeVisible()
  await expect(loadMore).toBeHidden()
})

test('shows an empty message when the time range has no entries', async ({ page }) => {
  await page.goto('/system/audit-log')
  await expect(row(page, 'instance create')).toBeVisible()

  // Mock entries all fall within the last several hours, so a range ending
  // days ago is empty. In the range calendar the first Enter anchors a
  // selection and the second completes it, so finish a throwaway [today, today]
  // range first. Then only ever move left: anchor at today-6 and complete
  // further back. Moving right can cross into the current month, where focus
  // jumps to today (the max date) and the range swallows every entry.
  await page.getByLabel('Choose a date range').getByRole('button').click()
  await page.getByRole('button', { name: /Today/ }).click()
  await page.keyboard.press('Enter')
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('Enter')
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Escape')

  await expect(page.getByText('No logs in selected time range')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Load More' })).toBeHidden()
})
