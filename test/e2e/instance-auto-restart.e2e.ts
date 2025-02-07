/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { expectToast } from './utils'

test('Auto restart policy on failed instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/you-fail')

  // check popover
  const indicator = page.getByRole('button', { name: 'Auto-restart status' })
  await indicator.click()
  await expect(page.getByText('Auto RestartEnabled')).toBeVisible()
  await expect(page.getByText('PolicyDefault')).toBeVisible()
  await expect(page.getByText('CooldownWaiting (5 minutes)')).toBeVisible()

  // now go to settings tab by clicking link in popover
  await page.getByRole('link', { name: 'Default' }).click()

  // assert contents of table-like thing showing the state. leave date underspecified
  // because it's always 5 minutes of whatever now is
  await expect(page.getByText(/Cooldown expiration.+, 202\d.+\(5 minutes\)/)).toBeVisible()
  await expect(page.getByText(/Last auto-restarted.+, 202\d/)).toBeVisible()

  const save = page.getByRole('button', { name: 'Save' })
  await expect(save).toBeDisabled()

  const policyListbox = page.getByRole('button', { name: 'Policy' })
  await expect(policyListbox).toContainText('Default')

  await page.getByRole('button', { name: 'Policy' }).click()
  await page.getByRole('option', { name: 'Never' }).click()
  await save.click()

  await expectToast(page, 'Instance auto-restart policy updated')
  await expect(policyListbox).toContainText('Never')
  await expect(save).toBeDisabled()
})

// TODO: test that polling updates the relevant stuff

// unlike the other instance update things, you can change auto restart policy
// regardless of state
test('Auto restart policy on running instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  await expect(page.getByText('Running')).toBeVisible() // it's running. we know

  // go to settings tab
  await page.getByRole('tab', { name: 'settings' }).click()

  // assert contents of table-like thing showing the state
  await expect(page.getByText('Cooldown expirationN/A')).toBeVisible()
  await expect(page.getByText('Last auto-restartedN/A')).toBeVisible()

  // await expect(page.getByRole('button', { name: 'Policy' }))
  const save = page.getByRole('button', { name: 'Save' })
  await expect(save).toBeDisabled()

  const policyListbox = page.getByRole('button', { name: 'Policy' })
  await expect(policyListbox).toContainText('Default')

  await page.getByRole('button', { name: 'Policy' }).click()
  await page.getByRole('option', { name: 'Never' }).click()
  await save.click()

  await expectToast(page, 'Instance auto-restart policy updated')
  await expect(policyListbox).toContainText('Never')
  await expect(save).toBeDisabled()
})
