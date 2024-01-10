/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expectRowVisible, expectVisible, test } from './utils'

test('Test pagination', async ({ page }) => {
  await page.goto('/projects/mock-project/snapshots')

  // Test pagination
  await page.getByRole('button', { name: 'next' }).click()
  await expectRowVisible(page.getByRole('table'), {
    name: 'disk-1-snapshot-25',
    disk: 'disk-1',
  })
  await page.getByRole('button', { name: 'prev', exact: true }).click()
  await expectVisible(page, [
    'role=heading[name*="Snapshots"]',
    'role=cell[name="snapshot-1"]',
    'role=cell[name="snapshot-2"]',
    'role=cell[name="delete-500"]',
    'role=cell[name="snapshot-4"]',
  ])
})
