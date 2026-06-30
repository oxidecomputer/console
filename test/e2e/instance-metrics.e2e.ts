/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from '@playwright/test'

import { OXQL_GROUP_BY_ERROR } from '~/api'

import { expectConsoleMessage, expectNoConsoleMessage, getPageAsUser } from './utils'

test('Click through instance metrics', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/metrics/cpu')

  await expect(
    page.getByRole('heading', { name: 'CPU Utilization: Running' })
  ).toBeVisible()
  await expect(page.getByText('Something went wrong')).toBeHidden()

  await page.getByRole('tab', { name: 'Disk' }).click()
  await expect(page).toHaveURL('/projects/mock-project/instances/db1/metrics/disk')
  await expect(page.getByRole('heading', { name: 'Disk Reads' })).toBeVisible()
  await expect(page.getByText('Something went wrong')).toBeHidden()

  // exact distinguishes from top level "networking" tab
  await page.getByRole('tab', { name: 'Network', exact: true }).click()
  await expect(page).toHaveURL('/projects/mock-project/instances/db1/metrics/network')
  await expect(page.getByRole('heading', { name: 'Bytes Sent' })).toBeVisible()
  await expect(page.getByText('Something went wrong')).toBeHidden()
})

test('Date range picker: choosing a custom range', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/metrics/cpu')
  await expect(
    page.getByRole('heading', { name: 'CPU Utilization: Running' })
  ).toBeVisible()

  const preset = page.getByRole('button', { name: 'Choose a time range preset' })
  const calendarButton = page.getByRole('button', { name: 'Calendar' })
  await expect(preset).toContainText('Last hour')

  await calendarButton.click()
  await expect(page.getByRole('dialog', { name: 'Calendar' })).toBeVisible()

  // anchor the selection on today, extend it three days earlier, and commit.
  // keyboard navigation keeps this independent of the date the test runs on.
  await page.getByRole('button', { name: /Today/ }).click()
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Escape')

  // picking dates flips the preset to Custom and widens the displayed range to
  // span multiple days, i.e. two dates rather than the single date a same-day
  // preset like "Last hour" shows
  await expect(preset).toContainText('Custom')
  await expect(calendarButton).toContainText(/\d+\/\d+\/\d+,.+\d+\/\d+\/\d+,/)
  // the chart refetches for the new range without erroring
  await expect(page.getByText('Something went wrong')).toBeHidden()
})

test('Date range picker: invalid range shows an error', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/metrics/cpu')
  await expect(
    page.getByRole('heading', { name: 'CPU Utilization: Running' })
  ).toBeVisible()

  await page.getByRole('button', { name: 'Calendar' }).click()
  await expect(page.getByRole('dialog', { name: 'Calendar' })).toBeVisible()

  // collapse the range to a single day by picking today as both start and end
  const today = page.getByRole('button', { name: /Today/ })
  await today.click()
  await today.click()

  // Set the times explicitly rather than relying on the times inherited from
  // the default "Last hour" range. When the test runs shortly after midnight,
  // that range straddles midnight (start ~23:00 the previous day, end ~00:00
  // today), so collapsing both dates to today leaves start after end and the
  // range reads as invalid before we've done anything. Start with a valid
  // same-day range (01:00 before 23:00): no error.
  const hours = page.getByRole('spinbutton', { name: 'hour,' })
  const minutes = page.getByRole('spinbutton', { name: 'minute,' })
  await hours.first().click()
  await page.keyboard.type('01')
  await minutes.first().click()
  await page.keyboard.type('00')
  await hours.nth(1).click()
  await page.keyboard.type('23')
  await minutes.nth(1).click()
  await page.keyboard.type('00')
  await expect(page.getByText('Date range is invalid')).toBeHidden()

  // now flip the start time (23:00) to be after the end time (01:00) on that
  // same day
  await hours.first().click()
  await page.keyboard.type('23')
  await hours.nth(1).click()
  await page.keyboard.type('01')

  await expect(page.getByText('Date range is invalid')).toBeVisible()
})

// TODO: more detailed tests using the dropdowns to change CPU state and disk

test('Instance metrics work for non-fleet viewer', async ({ browser }) => {
  const page = await getPageAsUser(browser, 'Hans Jonas')
  await page.goto('/projects/mock-project/instances/db1/metrics/cpu')
  await expect(
    page.getByRole('heading', { name: 'CPU Utilization: Running' })
  ).toBeVisible()
  // we don't want an error, we want the data!
  await expect(page.getByText('Something went wrong')).toBeHidden()
})

test('empty and loading states', async ({ page }) => {
  // we have special handling in the API to return special data for this project
  await page.goto('/projects/other-project/instances/failed-restarting-soon/metrics/cpu')

  const loading = page.getByLabel('Chart loading') // aria-label on loading indicator
  const noData = page.getByText('No data', { exact: true })

  // default running state returns two data points, which get turned into one by
  // the data munging
  await expect(loading).toBeVisible()
  await expect(loading).toBeHidden()
  await expect(noData).toBeHidden()

  const statePicker = page.getByRole('button', { name: 'Choose state' })

  // emulation state returns one data point
  await statePicker.click()
  await page.getByRole('option', { name: 'State: Emulation' }).click()
  await expect(loading).toBeVisible()
  await expect(loading).toBeHidden()
  await expect(noData).toBeVisible()

  // idle state returns group_by must be aligned error, treated as empty
  await expectNoConsoleMessage(page, OXQL_GROUP_BY_ERROR)
  await statePicker.click()
  await page.getByRole('option', { name: 'State: Idle' }).click()
  await expect(loading).toBeVisible()
  await expect(loading).toBeHidden()
  await expect(page.getByText('Something went wrong')).toBeHidden()
  await expect(noData).toBeVisible()
  await expectConsoleMessage(page, OXQL_GROUP_BY_ERROR)

  // make sure empty state goes away again for the first one
  await statePicker.click()
  await page.getByRole('option', { name: 'State: Running' }).click()
  await expect(noData).toBeHidden()
  await expect(loading).toBeHidden()
})
