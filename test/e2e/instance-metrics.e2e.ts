/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { OXQL_GROUP_BY_ERROR } from '~/api'

import { expect, getPageAsUser, hasConsoleMessage, test } from './utils'

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
  expect(await hasConsoleMessage(page, OXQL_GROUP_BY_ERROR)).toBe(false) // error not in console
  await statePicker.click()
  await page.getByRole('option', { name: 'State: Idle' }).click()
  await expect(loading).toBeVisible()
  await expect(loading).toBeHidden()
  await expect(page.getByText('Something went wrong')).toBeHidden()
  await expect(noData).toBeVisible()
  expect(await hasConsoleMessage(page, OXQL_GROUP_BY_ERROR)).toBe(true) // error present in console

  // make sure empty state goes away again for the first one
  await statePicker.click()
  await page.getByRole('option', { name: 'State: Running' }).click()
  await expect(noData).toBeHidden()
  await expect(loading).toBeHidden()
})
