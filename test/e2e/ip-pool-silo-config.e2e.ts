/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * Tests for IP pool selection forms under different silo configurations:
 * - myriad silo: v4-only default pool (user: Aryeh Kosman)
 * - thrax silo: v6-only default pool (user: Elizabeth Anscombe)
 * - pelerines silo: no default pools (user: Theodor Adorno)
 */

import { expect, getPageAsUser, test } from './utils'

test.describe('IP pool configuration: myriad silo (v4-only default)', () => {
  test('instance create form shows IPv4 default pool preselected', async ({ browser }) => {
    const page = await getPageAsUser(browser, 'Aryeh Kosman')
    await page.goto('/projects/kosman-project/instances-new')

    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('test-instance')

    // Select a silo image for boot disk
    await page.getByRole('tab', { name: 'Silo images' }).click()
    await page.getByPlaceholder('Select a silo image', { exact: true }).click()
    await page.getByRole('option', { name: 'ubuntu-22-04' }).click()

    // Open networking accordion
    await page.getByRole('button', { name: 'Networking' }).click()

    // Verify ephemeral IP checkbox is checked by default
    const ephemeralCheckbox = page.getByRole('checkbox', {
      name: 'Allocate and attach an ephemeral IP address',
    })
    await expect(ephemeralCheckbox).toBeChecked()

    // Pool dropdown should be visible with IPv4 pool preselected
    const poolDropdown = page.getByLabel('Pool')
    await expect(poolDropdown).toBeVisible()
    await expect(poolDropdown).toContainText('ip-pool-1')

    // Open dropdown to verify available options (only v4 pools should be available)
    await poolDropdown.click()
    await expect(page.getByRole('option', { name: 'ip-pool-1' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'ip-pool-3' })).toBeVisible()
    // IPv6 pools should not be available in this silo
    await expect(page.getByRole('option', { name: 'ip-pool-2' })).toBeHidden()
    await expect(page.getByRole('option', { name: 'ip-pool-4' })).toBeHidden()
  })

  test('floating IP create form shows IPv4 default pool preselected', async ({
    browser,
  }) => {
    const page = await getPageAsUser(browser, 'Aryeh Kosman')
    await page.goto('/projects/kosman-project/floating-ips-new')

    // Pool dropdown should show IPv4 default pool
    const poolDropdown = page.getByLabel('Pool')
    await expect(poolDropdown).toContainText('ip-pool-1')
  })
})

test.describe('IP pool configuration: thrax silo (v6-only default)', () => {
  test('instance create form shows IPv6 default pool preselected', async ({ browser }) => {
    const page = await getPageAsUser(browser, 'Elizabeth Anscombe')
    await page.goto('/projects/anscombe-project/instances-new')

    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('test-instance')

    // Select a silo image for boot disk
    await page.getByRole('tab', { name: 'Silo images' }).click()
    await page.getByPlaceholder('Select a silo image', { exact: true }).click()
    await page.getByRole('option', { name: 'ubuntu-22-04' }).click()

    // Open networking accordion
    await page.getByRole('button', { name: 'Networking' }).click()

    // Verify ephemeral IP checkbox is checked by default
    const ephemeralCheckbox = page.getByRole('checkbox', {
      name: 'Allocate and attach an ephemeral IP address',
    })
    await expect(ephemeralCheckbox).toBeChecked()

    // Pool dropdown should be visible with IPv6 pool preselected
    const poolDropdown = page.getByLabel('Pool')
    await expect(poolDropdown).toBeVisible()
    await expect(poolDropdown).toContainText('ip-pool-2')

    // Open dropdown to verify available options (only v6 pools should be available)
    await poolDropdown.click()
    await expect(page.getByRole('option', { name: 'ip-pool-2' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'ip-pool-4' })).toBeVisible()
    // IPv4 pools should not be available in this silo
    await expect(page.getByRole('option', { name: 'ip-pool-1' })).toBeHidden()
    await expect(page.getByRole('option', { name: 'ip-pool-3' })).toBeHidden()
  })

  test('floating IP create form shows IPv6 default pool preselected', async ({
    browser,
  }) => {
    const page = await getPageAsUser(browser, 'Elizabeth Anscombe')
    await page.goto('/projects/anscombe-project/floating-ips-new')

    // Pool dropdown should show IPv6 default pool
    const poolDropdown = page.getByLabel('Pool')
    await expect(poolDropdown).toContainText('ip-pool-2')
  })
})

test.describe('IP pool configuration: pelerines silo (no defaults)', () => {
  test('instance create form handles missing default pool gracefully', async ({
    browser,
  }) => {
    const page = await getPageAsUser(browser, 'Theodor Adorno')
    await page.goto('/projects/adorno-project/instances-new')

    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('test-instance')

    // Select a silo image for boot disk
    await page.getByRole('tab', { name: 'Silo images' }).click()
    await page.getByPlaceholder('Select a silo image', { exact: true }).click()
    await page.getByRole('option', { name: 'ubuntu-22-04' }).click()

    // Open networking accordion
    await page.getByRole('button', { name: 'Networking' }).click()

    // Verify ephemeral IP checkbox is checked by default
    const ephemeralCheckbox = page.getByRole('checkbox', {
      name: 'Allocate and attach an ephemeral IP address',
    })
    await expect(ephemeralCheckbox).toBeChecked()

    // Pool dropdown should be visible and user should be able to select a pool
    // (even without a default, pools are still available)
    const poolDropdown = page.getByLabel('Pool')
    await expect(poolDropdown).toBeVisible()

    // Open dropdown to verify available options
    await poolDropdown.click()
    // Both pools are linked to this silo but neither is default
    await expect(page.getByRole('option', { name: 'ip-pool-1' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'ip-pool-2' })).toBeVisible()
  })

  test('floating IP create form handles missing default pool gracefully', async ({
    browser,
  }) => {
    const page = await getPageAsUser(browser, 'Theodor Adorno')
    await page.goto('/projects/adorno-project/floating-ips-new')

    // User should be able to select from available pools
    const poolDropdown = page.getByLabel('Pool')
    await poolDropdown.click()
    await expect(page.getByRole('option', { name: 'ip-pool-1' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'ip-pool-2' })).toBeVisible()
  })
})
