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
} from '../utils'

test('Instance networking tab', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  // links to VPC and external IPs appear in table
  await expect(page.getByRole('link', { name: 'mock-vpc' })).toBeVisible()
  await expect(page.getByRole('link', { name: '123.4.56.0' })).toBeVisible()

  // Instance networking tab
  await page.click('role=tab[name="Network Interfaces"]')

  const table = page.locator('table')
  await expectRowVisible(table, { name: 'my-nicprimary' })

  // check VPC link in table points to the right page
  await expect(page.locator('role=cell >> role=link[name="mock-vpc"]')).toHaveAttribute(
    'href',
    '/projects/mock-project/vpcs/mock-vpc'
  )

  // Have to stop instance to edit NICs
  await stopInstance(page)

  await page.click('role=button[name="Add network interface"]')

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
  await expectRowVisible(table, { name: 'my-nic' })
  await expectRowVisible(table, { name: 'nic-2primary' })

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
