/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from '@playwright/test'

import { getPageAsUser } from './utils'

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
