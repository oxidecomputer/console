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
  expectNotVisible,
  expectRowVisible,
  expectVisible,
  stopInstance,
} from './utils'

test('Instance networking tab — NIC table', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  // links to VPC and external IPs appear in table
  await expect(page.getByRole('link', { name: 'mock-vpc' })).toBeVisible()
  await expect(page.getByRole('link', { name: '123.4.56.0' })).toBeVisible()

  // Instance networking tab
  await page.click('role=tab[name="Networking"]')

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
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=button[name*="VPC"]', // listbox
    'role=button[name*="Subnet"]', // listbox
    'role=textbox[name="IP Address"]',
  ])

  await page.fill('role=textbox[name="Name"]', 'nic-2')
  await page.click('role=button[name*="VPC"]')
  await page.click('role=option[name="mock-vpc"]')
  await page.click('role=button[name*="Subnet"]')
  await page.click('role=option[name="mock-subnet"]')
  await page.click('role=dialog >> role=button[name="Add network interface"]')
  await expectVisible(page, ['role=cell[name="nic-2"]'])

  // Make this interface primary
  await clickRowAction(page, 'nic-2', 'Make primary')
  await expectRowVisible(nicTable, { name: 'my-nic' })
  await expectRowVisible(nicTable, { name: 'nic-2primary' })

  // Make an edit to the network interface
  await clickRowAction(page, 'nic-2', 'Edit')
  await page.fill('role=textbox[name="Name"]', 'nic-3')
  await page.click('role=button[name="Update network interface"]')
  await expectNotVisible(page, ['role=cell[name="nic-2"]'])
  const nic3 = page.getByRole('cell', { name: 'nic-3' })
  await expect(nic3).toBeVisible()

  // Delete just-added network interface
  await clickRowAction(page, 'nic-3', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(nic3).toBeHidden()
})

test('Instance networking tab — Detach / Attach Ephemeral IPs', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/network-interfaces')

  const attachEphemeralIpButton = page.getByRole('button', { name: 'Attach ephemeral IP' })
  const externalIpTable = page.getByRole('table', { name: 'External IPs' })
  const ephemeralCell = externalIpTable.getByRole('cell', { name: 'ephemeral' })

  // We start out with an ephemeral IP attached
  await expect(ephemeralCell).toBeVisible()

  // The 'Attach ephemeral IP' button should be disabled when there is still an existing ephemeral IP
  await expect(attachEphemeralIpButton).toBeDisabled()
  await attachEphemeralIpButton.hover()
  await expect(
    page.getByRole('tooltip', { name: 'Ephemeral IP already attached' })
  ).toBeVisible()

  // Detach the existing ephemeral IP
  await clickRowAction(page, 'ephemeral', 'Detach')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(ephemeralCell).toBeHidden()

  // The 'Attach ephemeral IP' button should be enabled now that the existing ephemeral IP has been detached
  await expect(attachEphemeralIpButton).toBeEnabled()

  // Attach a new ephemeral IP
  await attachEphemeralIpButton.click()
  await expectVisible(page, ['role=heading[name="Attach ephemeral IP"]'])
  await page.click('role=button[name*="Ephemeral IP"]')
  await page.click('role=option[name="ip-pool-2"]')
  await page.click('role=button[name="Attach"]')
  await expectNotVisible(page, ['role=heading[name="Attach ephemeral IP"]'])
  await expect(ephemeralCell).toBeVisible()

  // The 'Attach ephemeral IP' button should be disabled after attaching an ephemeral IP
  await expect(attachEphemeralIpButton).toBeDisabled()
})

test('Instance networking tab — Attach ephemeral IP tooltip copy', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/network-interfaces')

  const attachEphemeralIpButton = page.getByRole('button', { name: 'Attach ephemeral IP' })
  const externalIpTable = page.getByRole('table', { name: 'External IPs' })
  const ephemeralCell = externalIpTable.getByRole('cell', { name: 'ephemeral' })

  // We start out with an ephemeral IP attached
  await expect(ephemeralCell).toBeVisible()

  // The 'Attach ephemeral IP' button should be disabled when there is still an existing ephemeral IP
  // and the tooltip should tell us that it's already attached
  await expect(attachEphemeralIpButton).toBeDisabled()
  await attachEphemeralIpButton.hover()
  await expect(
    page.getByRole('tooltip', { name: 'Ephemeral IP already attached' })
  ).toBeVisible()

  // We'll detach the existing ephemeral IP
  await clickRowAction(page, 'ephemeral', 'Detach')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(ephemeralCell).toBeHidden()

  // The button should now be enabled
  await expect(attachEphemeralIpButton).toBeEnabled()

  // If there are no network interfaces, the button should be disabled

  // Stop the instance to edit NICs
  await stopInstance(page)

  // Delete the existing NIC
  await clickRowAction(page, 'my-nic', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()

  // The 'Attach ephemeral IP' button should be disabled when there are no network interfaces
  await expect(attachEphemeralIpButton).toBeDisabled()

  // The tooltip should now tell us that a NIC is needed
  await attachEphemeralIpButton.hover()
  await expect(
    page.getByRole('tooltip', { name: 'A network interface is required' })
  ).toBeVisible()
})

test('Instance networking tab — External IPs', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/network-interfaces')
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
  await dialog.getByRole('button', { name: 'Select floating IP' }).click()
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
