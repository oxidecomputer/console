/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from './utils'

test('Show / hide contextual help docs links', async ({ page }) => {
  const managingDisksLink = page.getByRole('link', { name: 'Managing Disks' })

  await page.goto('/projects/mock-project/disks')

  // open the contextual help docs links
  page.getByLabel('Links to learn more').click()
  await expect(managingDisksLink).toBeVisible()

  // close the contextual help docs links and verify they're hidden
  page.getByRole('table').click()
  await expect(managingDisksLink).toBeHidden()
})
