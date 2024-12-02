/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { clickRowAction, expect, test } from './utils'

test('serial console can connect while starting', async ({ page }) => {
  // create an instance
  await page.goto('/projects/mock-project/instances-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('abc')
  await page.getByPlaceholder('Select a silo image').click()
  await page.getByRole('option', { name: 'ubuntu-22-04' }).click()

  await page.getByRole('button', { name: 'Create instance' }).click()

  // now go starting to its serial console page while it's starting up
  await expect(page).toHaveURL('/projects/mock-project/instances/abc/storage')
  await page.getByRole('tab', { name: 'Connect' }).click()
  await page.getByRole('main').getByRole('link', { name: 'Connect' }).click()

  // The message goes from creating to starting and then disappears once
  // the instance is running. skip the check for "creating" because it can
  // go by quickly
  await expect(page.getByText('Waiting for the instance to start')).toBeVisible()
  await expect(page.getByText('The instance is starting')).toBeVisible()
  await expect(page.getByText('The instance is')).toBeHidden()

  // Here it would be nice to test that the serial console connects, but we
  // can't mock websockets with MSW yet: https://github.com/mswjs/msw/pull/2011
})

test('links in instance actions', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await clickRowAction(page, 'db1', 'View serial console')
  await expect(page).toHaveURL('/projects/mock-project/instances/db1/serial-console')

  await page.goto('/projects/mock-project/instances/db1')
  await page.getByRole('button', { name: 'Instance actions' }).click()
  await page.getByRole('menuitem', { name: 'View serial console' }).click()
  await expect(page).toHaveURL('/projects/mock-project/instances/db1/serial-console')
})
