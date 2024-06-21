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
  const instanceName = 'db1'
  await page.goto(`/projects/mock-project/instances/${instanceName}`)

  // links to VPC and external IPs appear in table
  await expect(page.getByRole('link', { name: 'mock-vpc' })).toBeVisible()
  await expect(page.getByRole('link', { name: '123.4.56.0' })).toBeVisible()

  // Instance networking tab
  await page.click('role=tab[name="Networking"]')

  const nicTable = page.getByRole('table', { name: 'Network interfaces' })

  await expectRowVisible(nicTable, { name: 'my-nicprimary' })

  // check VPC link in table points to the right page
  await expect(page.locator('role=cell >> role=link[name="mock-vpc"]')).toHaveAttribute(
    'href',
    '/projects/mock-project/vpcs/mock-vpc'
  )

  const addNicButton = page.getByRole('button', { name: 'Add network interface' })

  // Ensure that the 'Add network interface' button is disabled when the instance is running
  await expect(addNicButton).toBeDisabled()

  // Have to stop instance to edit NICs
  await stopInstance(page, instanceName)

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

test('Instance networking tab — External IPs', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/network-interfaces')
  const externalIpTable = page.getByRole('table', { name: 'External IPs' })

  // See list of external IPs
  await expectRowVisible(externalIpTable, { ip: '123.4.56.0', Kind: 'ephemeral' })
  await expectRowVisible(externalIpTable, { ip: '123.4.56.5', Kind: 'floating' })

  // Attach a new external IP
  await page.click('role=button[name="Attach floating IP"]')
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
  await expect(page.getByRole('button', { name: 'Attach floating IP' })).toBeDisabled()

  // Detach one of the external IPs
  await clickRowAction(page, 'cola-float', 'Detach')
  await page.getByRole('button', { name: 'Confirm' }).click()

  // Since we detached it, we don't expect to see db1 any longer
  await expect(externalIpTable.getByRole('cell', { name: 'cola-float' })).toBeHidden()

  // And that button shouldbe enabled again
  await expect(page.getByRole('button', { name: 'Attach floating IP' })).toBeEnabled()
})
