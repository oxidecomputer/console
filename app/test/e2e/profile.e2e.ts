/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { user1 } from '@oxide/api-mocks'

import { expect, test } from './utils'

test('Profile page works', async ({ page }) => {
  await page.goto('/settings/profile')
  await expect(page.getByRole('textbox', { name: 'User ID' })).toHaveValue(user1.id)
  await expect(page.getByRole('cell', { name: 'web-devs' })).toBeVisible()
})
