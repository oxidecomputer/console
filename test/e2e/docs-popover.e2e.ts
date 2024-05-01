/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from './utils'

test('Show / hide contextual help docs links', async ({ page }) => {
  const learnAbout = page.getByText('Learn about disks')
  const managingDisksLink = page.getByRole('link', { name: 'Managing Disks' })

  await page.goto('/projects/mock-project/disks')

  await expect(learnAbout).toBeHidden()
  await expect(managingDisksLink).toBeHidden()

  // open the contextual help docs links
  await page.getByLabel('Links to docs').click()
  await expect(learnAbout).toBeVisible()
  await expect(managingDisksLink).toBeVisible()

  // close the contextual help docs links and verify they're hidden
  await page.getByRole('table').click()
  await expect(learnAbout).toBeHidden()
  await expect(managingDisksLink).toBeHidden()
})
