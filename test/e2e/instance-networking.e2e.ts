/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import {
  clickRowAction,
  clickRowActions,
  expectRowVisible,
  expectVisible,
  stopInstance,
  type Page,
} from './utils'

const selectASiloImage = async (page: Page, name: string) => {
  await page.getByRole('tab', { name: 'Silo images' }).click()
  await page.getByPlaceholder('Select a silo image', { exact: true }).click()
  await page.getByRole('option', { name }).click()
}

test('Instance networking tab — NIC table', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  // links to VPC and external IPs appear in table
  await expect(page.getByRole('link', { name: 'mock-vpc' })).toBeVisible()
  await expect(page.getByRole('link', { name: '123.4.56.0' })).toBeVisible()

  // Instance networking tab
  await page.getByRole('tab', { name: 'Networking' }).click()

  const nicTable = page.getByRole('table', { name: 'Network interfaces' })

  await expectRowVisible(nicTable, { name: 'my-nicprimary' })

  // check VPC link in table points to the right page
  await expect(nicTable.getByRole('link', { name: 'mock-vpc' })).toHaveAttribute(
    'href',
    '/projects/mock-project/vpcs/mock-vpc/firewall-rules'
  )

  const addNicButton = page.getByRole('button', { name: 'Add network interface' })

  // Ensure that the 'Add network interface' button is disabled when the instance is running
  await expect(addNicButton).toBeDisabled()

  // Have to stop instance to edit NICs
  await stopInstance(page)

  await expect(addNicButton).toBeEnabled()
  await addNicButton.click()

  // Add network interface
  // TODO: modal title is not getting hooked up, IDs are wrong
  await expectVisible(page, [
    'role=heading[name="Add network interface"]',
    'role=textbox[name="Description"]',
    'role=textbox[name="IPv4 Address"]',
    'role=textbox[name="IPv6 Address"]',
  ])

  await page.getByRole('textbox', { name: 'Name' }).fill('nic-2')
  await page.getByLabel('VPC', { exact: true }).click()
  await page.getByRole('option', { name: 'mock-vpc' }).click()
  await page.getByLabel('Subnet').click()
  await page.getByRole('option', { name: 'mock-subnet' }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Add network interface' })
    .click()
  await expect(page.getByRole('cell', { name: 'nic-2' })).toBeVisible()

  // Make this interface primary
  await clickRowAction(page, 'nic-2', 'Make primary')
  await expectRowVisible(nicTable, { name: 'my-nic' })
  await expectRowVisible(nicTable, { name: 'nic-2primary' })

  // Make an edit to the network interface
  await clickRowAction(page, 'nic-2', 'Edit')
  await page.getByRole('textbox', { name: 'Name' }).fill('nic-3')
  await page.getByRole('button', { name: 'Update network interface' }).click()
  await expect(page.getByRole('cell', { name: 'nic-2' })).toBeHidden()
  const nic3 = page.getByRole('cell', { name: 'nic-3' })
  await expect(nic3).toBeVisible()

  // See that the primary NIC cannot be deleted when other NICs exist
  await clickRowActions(page, 'nic-3')
  const deleteButton = page.getByRole('menuitem', { name: 'Delete' })
  await expect(deleteButton).toBeDisabled()
  await deleteButton.hover()
  await expect(page.getByText('The primary interface can’t')).toBeVisible()

  // close the menu for nic-3, without the next line fails in FF and Safari (but not Chrome)
  await clickRowActions(page, 'nic-3')

  // Delete the non-primary NIC
  await clickRowAction(page, 'my-nic', 'Delete')
  await expect(page.getByText('Are you sure you want to delete my-nic?')).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByRole('cell', { name: 'my-nic' })).toBeHidden()

  // Now the primary NIC is deletable
  await clickRowAction(page, 'nic-3', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(nic3).toBeHidden()
})

test('Instance networking tab — Detach / Attach Ephemeral IPs', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/networking')

  const attachEphemeralIpButton = page.getByRole('button', { name: 'Attach ephemeral IP' })
  const externalIpTable = page.getByRole('table', { name: 'External IPs' })
  const ephemeralCell = externalIpTable.getByRole('cell', { name: 'ephemeral' })

  // We start out with an ephemeral IP attached
  await expect(ephemeralCell).toBeVisible()

  // The 'Attach ephemeral IP' button should be hidden when there is still an existing ephemeral IP
  await expect(attachEphemeralIpButton).toBeHidden()

  // Detach the existing ephemeral IP
  await clickRowAction(page, 'ephemeral', 'Detach')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(ephemeralCell).toBeHidden()

  // The 'Attach ephemeral IP' button should be visible and enabled now that the existing ephemeral IP has been detached
  await expect(attachEphemeralIpButton).toBeEnabled()

  // Attach a new ephemeral IP using the default pool (don't select a pool)
  await attachEphemeralIpButton.click()
  let modal = page.getByRole('dialog', { name: 'Attach ephemeral IP' })
  await expect(modal).toBeVisible()
  // Click Attach without selecting a pool - should use default pool
  await page.getByRole('button', { name: 'Attach', exact: true }).click()
  await expect(modal).toBeHidden()
  await expect(ephemeralCell).toBeVisible()

  // The 'Attach ephemeral IP' button should be hidden after attaching an ephemeral IP
  await expect(attachEphemeralIpButton).toBeHidden()

  // Detach and test with explicit pool selection
  await clickRowAction(page, 'ephemeral', 'Detach')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(ephemeralCell).toBeHidden()

  await attachEphemeralIpButton.click()
  modal = page.getByRole('dialog', { name: 'Attach ephemeral IP' })
  await expect(modal).toBeVisible()
  // Pool dropdown should be visible
  const poolDropdown = page.getByLabel('Pool')
  await expect(poolDropdown).toBeVisible()
  // Select a different pool
  await poolDropdown.click()
  await page.getByRole('option', { name: 'ip-pool-2' }).click()
  await page.getByRole('button', { name: 'Attach', exact: true }).click()
  await expect(modal).toBeHidden()
  await expect(ephemeralCell).toBeVisible()

  // The 'Attach ephemeral IP' button should be hidden after attaching an ephemeral IP
  await expect(attachEphemeralIpButton).toBeHidden()
})

test('Instance networking tab — floating IPs', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/networking')
  const externalIpTable = page.getByRole('table', { name: 'External IPs' })
  const attachFloatingIpButton = page.getByRole('button', { name: 'Attach floating IP' })

  // See list of external IPs
  await expectRowVisible(externalIpTable, { ip: '123.4.56.0', Kind: 'ephemeral' })
  await expectRowVisible(externalIpTable, { ip: '123.4.56.5', Kind: 'floating' })
  await expectRowVisible(externalIpTable, { ip: '123.4.56.100–16383', Kind: 'snat' })

  await expect(page.getByText('external IPs123.4.56.5/123.4.56.0')).toBeVisible()

  // The list of IPs at the top of the page should not show the SNAT IP
  await expect(page.getByText('external IPs123.4.56.5/123.4.56.0')).toBeVisible()
  await expect(page.getByText('external IPs123.4.56.5/123.4.56.0/')).toBeHidden()

  // Attach a new external IP
  await attachFloatingIpButton.click()
  await expectVisible(page, ['role=heading[name="Attach floating IP"]'])

  // Select the 'rootbeer-float' option
  const dialog = page.getByRole('dialog')
  // TODO: this "select the option" syntax is awkward; it's working, but I suspect there's a better way
  await dialog.getByLabel('Floating IP').click()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  // await dialog.getByRole('button', { name: 'rootbeer-float' }).click()
  // await dialog.getByRole('button', { name: 'rootbeer-float123.4.56.4/A classic.' }).click()
  await dialog.getByRole('button', { name: 'Attach' }).click()

  // Confirm the modal is gone and the new row is showing on the page
  await expect(page.getByRole('dialog')).toBeHidden()
  await expectRowVisible(externalIpTable, { name: 'rootbeer-float' })

  // Button should still be enabled because there's an IPv6 floating IP available
  await expect(attachFloatingIpButton).toBeEnabled()

  // Attach the IPv6 floating IP as well
  await attachFloatingIpButton.click()
  await expectVisible(page, ['role=heading[name="Attach floating IP"]'])
  await dialog.getByLabel('Floating IP').click()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await dialog.getByRole('button', { name: 'Attach' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expectRowVisible(externalIpTable, { name: 'ipv6-float' })

  // Now the button should be disabled, since all available floating IPs are attached
  await expect(attachFloatingIpButton).toBeDisabled()

  // Verify that the External IPs table row has an ellipsis link in it
  await expect(page.getByText('123.4.56.5/…')).toBeVisible()

  // Detach one of the external IPs
  await clickRowAction(page, 'cola-float', 'Detach')
  await page.getByRole('button', { name: 'Confirm' }).click()

  // Since we detached it, we don't expect to see the row any longer
  await expect(externalIpTable.getByRole('cell', { name: 'cola-float' })).toBeHidden()

  // And that button should be enabled again (cola-float is now available to attach)
  await expect(attachFloatingIpButton).toBeEnabled()
})

test('Instance networking tab — SNAT IPs', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/networking')
  const externalIpTable = page.getByRole('table', { name: 'External IPs' })
  const snatRow = externalIpTable.locator('tr').filter({ hasText: 'snat' })
  await expect(snatRow).toBeVisible()

  // expect the SNAT IP to have a port range badge
  await expect(snatRow).toContainText('0–16383')

  const actionsButton = snatRow.getByRole('button', { name: 'Row actions' })
  await actionsButton.click()

  // Should have "Copy IP address" action, just for consistency with other IP rows
  await expect(page.getByRole('menuitem', { name: 'Copy IP address' })).toBeVisible()

  // Should have a disabled "Detach" action
  await expect(page.getByRole('menuitem', { name: 'Detach' })).toBeDisabled()
})

test('Edit network interface - Transit IPs', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/networking')

  // Stop the instance to enable editing
  await stopInstance(page)

  await clickRowAction(page, 'my-nic', 'Edit')

  const modal = page.getByRole('dialog', { name: 'Edit network interface' })
  const transitIpField = modal.getByRole('textbox', { name: 'Transit IPs' })
  const addTransitIpButton = modal.getByRole('button', { name: 'Add Transit IP' })
  const clearButton = modal.getByRole('button', { name: 'Clear' })
  const errorMessage = modal.getByText(
    'Must contain an IP address and a width, separated by a /'
  )
  const transitIpsTable = modal.getByRole('table', { name: 'Transit IPs' })

  // Type invalid value
  await transitIpField.fill('invalid-ip')
  await expect(errorMessage).toBeHidden()

  // Hit add transit IP button
  await addTransitIpButton.click()
  await expect(errorMessage).toBeVisible()

  // Clear the value and error
  await clearButton.click()
  await expect(errorMessage).toBeHidden()
  await expect(transitIpField).toHaveValue('')

  // Type bad value again
  await transitIpField.fill('invalid-ip')
  await expect(errorMessage).toBeHidden()

  // Hit add again to get the error
  await addTransitIpButton.click()
  await expect(errorMessage).toBeVisible()

  // Change to valid IP network
  await transitIpField.fill('192.168.0.0/16')
  await expect(errorMessage).toBeHidden()

  // Submit and assert it's in the table
  await addTransitIpButton.click()
  await expect(transitIpField).toHaveValue('')
  await expectRowVisible(transitIpsTable, { 'Transit IPs': '192.168.0.0/16' })

  const dupeError = modal.getByText('Transit IP already in list')

  // try to add the same one again to see the dupe message
  await transitIpField.fill('192.168.0.0/16')
  await expect(dupeError).toBeHidden()
  await addTransitIpButton.click()
  await expect(dupeError).toBeVisible()

  // Submit the form
  await modal.getByRole('button', { name: 'Update network interface' }).click()

  // Assert the transit IP is in the NICs table
  // The NIC now has 3 transit IPs: 172.30.0.0/22 (v4), 192.168.0.0/16 (v4), and ::/64 (v6)
  const nicTable = page.getByRole('table', { name: 'Network interfaces' })
  await expectRowVisible(nicTable, { 'Transit IPs': '172.30.0.0/22+2' })

  await page.getByText('+2').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Other transit IPs 192.168.0.0/16 ::/64' })
  ).toBeVisible()
})

test('IPv4-only instance cannot attach IPv6 ephemeral IP', async ({ page }) => {
  // Create an IPv4-only instance
  await page.goto('/projects/mock-project/instances-new')
  const instanceName = 'ipv4-only-test'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectASiloImage(page, 'ubuntu-22-04')

  // Open networking accordion and select IPv4-only
  await page.getByRole('button', { name: 'Networking' }).click()
  await page.getByRole('radio', { name: 'Default IPv4', exact: true }).click()

  // Don't attach ephemeral IP at creation
  await page
    .getByRole('checkbox', { name: 'Allocate and attach an ephemeral IP address' })
    .uncheck()

  // Create instance
  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL(/\/instances\/ipv4-only-test/)

  // Navigate to networking tab
  await page.getByRole('tab', { name: 'Networking' }).click()

  // Try to attach ephemeral IP
  const attachButton = page.getByRole('button', { name: 'Attach ephemeral IP' })
  await expect(attachButton).toBeEnabled()
  await attachButton.click()

  const modal = page.getByRole('dialog', { name: 'Attach ephemeral IP' })
  await expect(modal).toBeVisible()

  // Pool dropdown should be visible
  const poolDropdown = page.getByLabel('Pool')
  await expect(poolDropdown).toBeVisible()

  // IPv4 default pool should be selected by default
  await expect(poolDropdown).toContainText('ip-pool-1')

  // Check pool options - IPv6 pools should be filtered out
  await poolDropdown.click()

  // ip-pool-2 is IPv6, should not appear
  await expect(page.getByRole('option', { name: 'ip-pool-2' })).toBeHidden()

  // ip-pool-1 is IPv4, should appear
  await expect(page.getByRole('option', { name: 'ip-pool-1' })).toBeVisible()
})

test('IPv6-only instance cannot attach IPv4 ephemeral IP', async ({ page }) => {
  // Create an IPv6-only instance
  await page.goto('/projects/mock-project/instances-new')
  const instanceName = 'ipv6-only-test'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectASiloImage(page, 'ubuntu-22-04')

  // Open networking accordion and select IPv6-only
  await page.getByRole('button', { name: 'Networking' }).click()
  await page.getByRole('radio', { name: 'Default IPv6', exact: true }).click()

  // Don't attach ephemeral IP at creation
  await page
    .getByRole('checkbox', { name: 'Allocate and attach an ephemeral IP address' })
    .uncheck()

  // Create instance
  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL(/\/instances\/ipv6-only-test/)

  // Navigate to networking tab
  await page.getByRole('tab', { name: 'Networking' }).click()

  // Try to attach ephemeral IP
  const attachButton = page.getByRole('button', { name: 'Attach ephemeral IP' })
  await expect(attachButton).toBeEnabled()
  await attachButton.click()

  const modal = page.getByRole('dialog', { name: 'Attach ephemeral IP' })
  await expect(modal).toBeVisible()

  // Pool dropdown should be visible
  const poolDropdown = page.getByLabel('Pool')
  await expect(poolDropdown).toBeVisible()

  // IPv6 default pool should be selected by default
  await expect(poolDropdown).toContainText('ip-pool-2')

  // Check pool options - IPv4 pools should be filtered out
  await poolDropdown.click()

  // ip-pool-1 is IPv4, should not appear
  await expect(page.getByRole('option', { name: 'ip-pool-1' })).toBeHidden()

  // ip-pool-2 is IPv6, should appear
  await expect(page.getByRole('option', { name: 'ip-pool-2' })).toBeVisible()
})

test('IPv4-only instance can attach IPv4 ephemeral IP', async ({ page }) => {
  // Create an IPv4-only instance
  await page.goto('/projects/mock-project/instances-new')
  const instanceName = 'ipv4-success-test'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectASiloImage(page, 'ubuntu-22-04')

  // Open networking accordion and select IPv4-only
  await page.getByRole('button', { name: 'Networking' }).click()
  await page.getByRole('radio', { name: 'Default IPv4', exact: true }).click()

  // Don't attach ephemeral IP at creation
  await page
    .getByRole('checkbox', { name: 'Allocate and attach an ephemeral IP address' })
    .uncheck()

  // Create instance
  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL(/\/instances\/ipv4-success-test/)

  // Navigate to networking tab
  await page.getByRole('tab', { name: 'Networking' }).click()

  // Attach IPv4 ephemeral IP (using default pool)
  const attachButton = page.getByRole('button', { name: 'Attach ephemeral IP' })
  await expect(attachButton).toBeEnabled()
  await attachButton.click()

  const modal = page.getByRole('dialog', { name: 'Attach ephemeral IP' })
  await expect(modal).toBeVisible()

  // Use default IPv4 pool
  await page.getByRole('button', { name: 'Attach', exact: true }).click()

  // Modal should close and IP should be attached
  await expect(modal).toBeHidden()

  // Verify ephemeral IP appears in table
  const externalIpTable = page.getByRole('table', { name: 'External IPs' })
  await expect(externalIpTable.getByRole('cell', { name: 'ephemeral' })).toBeVisible()
})

test('IPv6-only instance can attach IPv6 ephemeral IP', async ({ page }) => {
  // Create an IPv6-only instance
  await page.goto('/projects/mock-project/instances-new')
  const instanceName = 'ipv6-success-test'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectASiloImage(page, 'ubuntu-22-04')

  // Open networking accordion and select IPv6-only
  await page.getByRole('button', { name: 'Networking' }).click()
  await page.getByRole('radio', { name: 'Default IPv6', exact: true }).click()

  // Don't attach ephemeral IP at creation
  await page
    .getByRole('checkbox', { name: 'Allocate and attach an ephemeral IP address' })
    .uncheck()

  // Create instance
  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL(/\/instances\/ipv6-success-test/)

  // Navigate to networking tab
  await page.getByRole('tab', { name: 'Networking' }).click()

  // Attach IPv6 ephemeral IP
  const attachButton = page.getByRole('button', { name: 'Attach ephemeral IP' })
  await expect(attachButton).toBeEnabled()
  await attachButton.click()

  const modal = page.getByRole('dialog', { name: 'Attach ephemeral IP' })
  await expect(modal).toBeVisible()

  // Pool dropdown should be visible
  const poolDropdown = page.getByLabel('Pool')
  await expect(poolDropdown).toBeVisible()

  // Select IPv6 pool (ip-pool-2)
  await poolDropdown.click()
  await page.getByRole('option', { name: 'ip-pool-2' }).click()

  await page.getByRole('button', { name: 'Attach', exact: true }).click()

  // Modal should close and IP should be attached
  await expect(modal).toBeHidden()

  // Verify ephemeral IP appears in table
  const externalIpTable = page.getByRole('table', { name: 'External IPs' })
  await expect(externalIpTable.getByRole('cell', { name: 'ephemeral' })).toBeVisible()
})
