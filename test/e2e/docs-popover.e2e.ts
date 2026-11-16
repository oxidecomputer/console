/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from './utils'

test('disks page wires its contextual documentation', async ({ page }) => {
  await page.goto('/projects/mock-project/disks')
  await page.getByRole('button', { name: 'Learn about disks' }).click()

  await expect(page.getByRole('link', { name: 'Disks and Snapshots' })).toHaveAttribute(
    'href',
    'https://docs.oxide.computer/guides/managing-disks-and-snapshots'
  )
})
