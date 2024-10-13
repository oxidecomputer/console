/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { expectObscured, stopInstance } from './utils'

test('Dropdown content can scroll off page and doesn’t hide TopBar', async ({ page }) => {
  // load the page
  await page.goto('/utilization')
  await expect(page.getByRole('heading', { name: 'Utilization' })).toBeVisible()

  const button = page.getByRole('button', { name: 'All projects' })

  // click on the 'All projects' dropdown
  await button.click()
  const options = ['All projects', 'mock-project', 'other-project']
  for (const name of options) {
    const option = page.getByRole('option', { name })
    await expect(option).toBeVisible()
    await expect(option).toBeInViewport()
  }

  // scroll the page down just enough that the button and the top item are off
  // screen, but the bottom item is not
  await page.mouse.wheel(0, 500)

  // if we don't do this, the test doesn't wait long enough for the following
  // assertions to become true
  await expect(button).not.toBeInViewport()

  // now the top the listbox option is obscured by the topbar
  await expectObscured(page.getByRole('option', { name: 'All projects' }))

  // but we can still click the bottom one
  await page.getByRole('option', { name: 'other-project' }).click()
  await expect(page.getByRole('button', { name: 'other-project' })).toBeVisible()
})

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
