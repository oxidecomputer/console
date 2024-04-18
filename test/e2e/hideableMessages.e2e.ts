/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from './utils'

test('Hideable messages should stay hidden', async ({ page }) => {
  // Go to the Floating IPs page and hide the box
  await page.goto('/projects/mock-project/floating-ips')
  await page.getByLabel('Close information box').click()

  // Go to the IP Pools Linked Silos page and hide the box
  await page.goto('/system/networking/ip-pools/ip-pool-1?tab=silos')
  await page.getByLabel('Close information box').click()

  // Go back to the Floating IPs page and make sure the box is still hidden
  await page.goto('/projects/mock-project/floating-ips')
  await expect(page.getByLabel('Close information box')).toBeHidden()

  // Go back to the IP Pools Linked Silos page and make sure the box is still hidden
  await page.goto('/system/networking/ip-pools/ip-pool-1?tab=silos')
  await expect(page.getByLabel('Close information box')).toBeHidden()
})
