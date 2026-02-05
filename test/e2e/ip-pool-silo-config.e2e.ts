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
 * - no-pools silo: no IP pools (user: Antonio Gramsci)
 */

import { floatingIp } from '@oxide/api-mocks'

import { expect, expectRowVisible, getPageAsUser, test } from './utils'

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

    // Verify ephemeral IP checkbox is not checked by default
    const ephemeralCheckbox = page.getByRole('checkbox', {
      name: 'Allocate and attach an ephemeral IP address',
    })
    await expect(ephemeralCheckbox).not.toBeChecked()

    // Pool dropdown should not be shown unless ephemeral IP is enabled.
    const poolDropdown = page.getByLabel('Pool')
    await expect(poolDropdown).toBeHidden()

    // Enabling ephemeral IP should allow selecting from available pools.
    await ephemeralCheckbox.click()
    await expect(ephemeralCheckbox).toBeChecked()
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

test.describe('IP pool configuration: no-pools silo (no IP pools)', () => {
  test('instance create form disables ephemeral IP when no pools exist', async ({
    browser,
  }) => {
    const page = await getPageAsUser(browser, 'Antonio Gramsci')
    await page.goto('/projects/mock-project/instances-new')

    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('no-default-pool')

    await page.getByRole('tab', { name: 'Silo images' }).click()
    await page.getByPlaceholder('Select a silo image', { exact: true }).click()
    await page.getByRole('option', { name: 'ubuntu-22-04' }).click()

    await page.getByRole('button', { name: 'Networking' }).click()

    const defaultRadio = page.getByRole('radio', { name: 'Default' })
    await expect(defaultRadio).toBeChecked()

    const ephemeralCheckbox = page.getByRole('checkbox', {
      name: 'Allocate and attach an ephemeral IP address',
    })
    await expect(ephemeralCheckbox).not.toBeChecked()
    await expect(ephemeralCheckbox).toBeDisabled()

    await ephemeralCheckbox.hover()
    await expect(
      page.getByRole('tooltip').filter({ hasText: /No compatible IP pools available/ })
    ).toBeVisible()

    const poolDropdown = page.getByLabel('Pool')
    await expect(poolDropdown).toBeHidden()

    const attachFloatingIpButton = page.getByRole('button', { name: 'Attach floating IP' })
    const dialog = page.getByRole('dialog')
    const selectFloatingIpButton = dialog.getByRole('button', { name: 'Floating IP' })
    const rootbeerFloatOption = page.getByRole('option', { name: floatingIp.name })
    const attachButton = dialog.getByRole('button', { name: 'Attach', exact: true })

    await attachFloatingIpButton.click()
    await selectFloatingIpButton.click()
    await rootbeerFloatOption.click()
    await attachButton.click()
    await expectRowVisible(page.getByRole('table', { name: 'Floating IPs' }), {
      Name: floatingIp.name,
      IP: floatingIp.ip,
    })

    await page.getByRole('button', { name: 'Create instance' }).click()
    await expect(
      page.getByText('Not found: default IP pool for current silo')
    ).toBeVisible()
    await expectRowVisible(page.getByRole('table', { name: 'Floating IPs' }), {
      Name: floatingIp.name,
      IP: floatingIp.ip,
    })
  })
})
