/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { expectToast } from './utils'

test('can update CPU platform preference', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  // go to settings tab
  await page.getByRole('tab', { name: 'settings' }).click()

  const save = page.getByRole('button', { name: 'Save' })
  await expect(save).toBeDisabled()

  // verify initial state is "No preference"
  const platformListbox = page.getByRole('button', { name: 'Preference' })
  await expect(platformListbox).toContainText('No preference')

  // change to AMD Milan
  await platformListbox.click()
  await page.getByRole('option', { name: 'AMD Milan' }).click()
  await expect(save).toBeEnabled()
  await save.click()

  await expectToast(page, 'CPU platform preference updated')
  await expect(platformListbox).toContainText('AMD Milan')
  await expect(save).toBeDisabled()

  // change to AMD Turin
  await platformListbox.click()
  await page.getByRole('option', { name: 'AMD Turin' }).click()
  await expect(save).toBeEnabled()
  await save.click()

  await expectToast(page, 'CPU platform preference updated')
  await expect(platformListbox).toContainText('AMD Turin')
  await expect(save).toBeDisabled()

  // change back to No preference
  await platformListbox.click()
  await page.getByRole('option', { name: 'No preference' }).click()
  await expect(save).toBeEnabled()
  await save.click()

  await expectToast(page, 'CPU platform preference updated')
  await expect(platformListbox).toContainText('No preference')
  await expect(save).toBeDisabled()
})
