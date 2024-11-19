/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { expectObscured, stopInstance } from './utils'

test('Dropdown content in SidebarModal shows on screen', async ({ page }) => {
  // go to an instance’s Network Interfaces page
  await page.goto('/projects/mock-project/instances/db1/networking')

  await stopInstance(page)

  // open the add network interface side modal
  await page.getByRole('button', { name: 'Add network interface' }).click()

  // fill out the form
  await page.getByLabel('Name').fill('alt-nic')

  // select the VPC and subnet via the dropdowns. The fact that the options are
  // clickable means they are not obscured due to having a too-low z-index
  await page.getByLabel('VPC', { exact: true }).click()
  await page.getByRole('option', { name: 'mock-vpc' }).click()
  await page.getByRole('button', { name: 'Subnet' }).click()
  await page.getByRole('option', { name: 'mock-subnet' }).click()

  const sidebar = page.getByRole('dialog', { name: 'Add network interface' })

  // verify that the SideModal header is positioned above the TopBar
  await expectObscured(page.getByRole('button', { name: 'User menu' }))

  // test that the form can be submitted and a new network interface is created
  await sidebar.getByRole('button', { name: 'Add network interface' }).click()
  await expect(sidebar).toBeHidden()
  await expect(page.getByText('alt-nic')).toBeVisible()
})
