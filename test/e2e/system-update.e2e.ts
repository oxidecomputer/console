/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, expectToast, test } from './utils'

test('Update status displays correctly', async ({ page }) => {
  await page.goto('/system/update')

  await expect(page.getByRole('heading', { name: 'System Update' })).toBeVisible()

  // Verify target release is 17.0.0 in the properties table
  await expect(page.getByLabel('Properties table')).toContainText('17.0.0')

  await expect(page.getByText('Progress')).toBeVisible()

  await expect(page.getByText('60%')).toBeVisible() // 12/20 = 60%
  await expect(page.getByText('(12 of 20)')).toBeVisible()

  await expect(page.getByText('Suspended No')).toBeVisible()

  await expect(page.getByText('Available Releases')).toBeVisible()

  await expect(page.getByText('rack-18.0.0.zip')).toBeVisible()
  await expect(page.getByText('rack-17.0.0.zip')).toBeVisible()
  await expect(page.getByText('rack-16.0.0.zip')).toBeVisible()

  // Verify the Target badge is specifically on the 17.0.0 entry
  const release17 = page.getByRole('listitem').filter({ hasText: '17.0.0' })
  await expect(release17.getByText('Target')).toBeVisible()

  // Verify the badge is NOT on the 18.0.0 entry
  const release18 = page.getByRole('listitem').filter({ hasText: '18.0.0' })
  await expect(release18.getByText('Target')).toBeHidden()
})

test('Set target release', async ({ page }) => {
  await page.goto('/system/update')

  await expect(page.getByText('Available Releases')).toBeVisible()

  // Verify initial state: 17.0.0 is the target
  await expect(page.getByLabel('Properties table')).toContainText('17.0.0')

  const release17 = page.getByRole('listitem').filter({ hasText: '17.0.0' })
  await expect(release17.getByText('Target')).toBeVisible()

  // Current target (17.0.0) should be disabled
  await page.getByRole('button', { name: '17.0.0 actions' }).click()
  const disabledItem = page.getByRole('menuitem', { name: 'Set as target release' })
  await expect(disabledItem).toBeDisabled()
  await page.keyboard.press('Escape')

  // Upgrade to 18.0.0
  await page.getByRole('button', { name: '18.0.0 actions' }).click()
  await page.getByRole('menuitem', { name: 'Set as target release' }).click()

  const modal = page.getByRole('dialog', { name: 'Confirm set target release' })
  await expect(modal).toBeVisible()
  await expect(
    modal.getByText('Are you sure you want to set 18.0.0 as the target release?')
  ).toBeVisible()

  await page.getByRole('button', { name: 'Confirm' }).click()

  await expectToast(page, 'Target release updated')

  // Verify the target release updated in the properties table
  await expect(page.getByLabel('Properties table')).toContainText('18.0.0')

  // Verify the badge moved from 17.0.0 to 18.0.0
  await expect(release17.getByText('Target')).toBeHidden()

  const release18 = page.getByRole('listitem').filter({ hasText: '18.0.0' })
  await expect(release18.getByText('Target')).toBeVisible()
})

test('Cannot downgrade to older release', async ({ page }) => {
  await page.goto('/system/update')

  // Verify initial state: 17.0.0 is the target
  await expect(page.getByLabel('Properties table')).toContainText('17.0.0')

  const release17 = page.getByRole('listitem').filter({ hasText: '17.0.0' })
  await expect(release17.getByText('Target')).toBeVisible()

  // Try to downgrade to 16.0.0
  await page.getByRole('button', { name: '16.0.0 actions' }).click()
  await page.getByRole('menuitem', { name: 'Set as target release' }).click()

  const modal = page.getByRole('dialog', { name: 'Confirm set target release' })
  await expect(modal).toBeVisible()
  await expect(
    modal.getByText('Are you sure you want to set 16.0.0 as the target release?')
  ).toBeVisible()

  await page.getByRole('button', { name: 'Confirm' }).click()

  // Verify error toast appears
  await expectToast(
    page,
    'Requested target release (16.0.0) must not be older than current target release (17.0.0).'
  )

  // Verify the target release has NOT changed - still 17.0.0
  await expect(page.getByLabel('Properties table')).toContainText('17.0.0')
  await expect(release17.getByText('Target')).toBeVisible()

  const release16 = page.getByRole('listitem').filter({ hasText: '16.0.0' })
  await expect(release16.getByText('Target')).toBeHidden()
})
