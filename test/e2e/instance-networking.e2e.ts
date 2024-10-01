/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { clickRowAction, expectRowVisible, expectVisible, stopInstance } from './utils'

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
    'role=textbox[name="IP Address"]',
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

  // Delete just-added network interface
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

  // Attach a new ephemeral IP
  await attachEphemeralIpButton.click()
  const modal = page.getByRole('dialog', { name: 'Attach ephemeral IP' })
  await expect(modal).toBeVisible()
  await page.getByRole('button', { name: 'IP pool' }).click()
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

  // Attach a new external IP
  await attachFloatingIpButton.click()
  await expectVisible(page, ['role=heading[name="Attach floating IP"]'])

  // Select the 'rootbeer-float' option
  const dialog = page.getByRole('dialog')
  // TODO: this "select the option" syntax is awkward; it's working, but I suspect there's a better way
  await dialog.getByRole('button', { name: 'Select a floating IP' }).click()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  // await dialog.getByRole('button', { name: 'rootbeer-float' }).click()
  // await dialog.getByRole('button', { name: 'rootbeer-float123.4.56.4/A classic.' }).click()
  await dialog.getByRole('button', { name: 'Attach' }).click()

  // Confirm the modal is gone and the new row is showing on the page
  await expect(page.getByRole('dialog')).toBeHidden()
  await expectRowVisible(externalIpTable, { name: 'rootbeer-float' })

  // Verify that the "Attach floating IP" button is disabled, since there shouldn't be any more IPs to attach
  await expect(attachFloatingIpButton).toBeDisabled()

  // Detach one of the external IPs
  await clickRowAction(page, 'cola-float', 'Detach')
  await page.getByRole('button', { name: 'Confirm' }).click()

  // Since we detached it, we don't expect to see the row any longer
  await expect(externalIpTable.getByRole('cell', { name: 'cola-float' })).toBeHidden()

  // And that button should be enabled again
  await expect(attachFloatingIpButton).toBeEnabled()
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
  const nicTable = page.getByRole('table', { name: 'Network interfaces' })
  await expectRowVisible(nicTable, { 'Transit IPs': '172.30.0.0/22+1' })

  await page.getByText('+1').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Other transit IPs 192.168.0.0/16' })
  ).toBeVisible()
})
