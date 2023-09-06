/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

test('Dropdown content can scroll off page and doesn’t hide TopBar', async ({ page }) => {
  // load the page
  await page.goto('/utilization')
  await expect(page.getByText('Capacity & Utilization')).toBeVisible()

  // click on the 'All projects' dropdown
  page.locator('text=All projects').click()
  // verify that the options are visible
  await expect(page.getByText('mock-project')).toBeVisible()
  await expect(page.getByText('other-project')).toBeVisible()

  // scroll the page down by 275px
  await page.mouse.wheel(0, 275)

  // the 'All projects' button (just above the list) should not be on the screen
  await expect(page.getByRole('button', { name: 'All projects' })).not.toBeInViewport()

  // the 'other-project' option (last option on the list) should still be visible
  await expect(page.getByText('other-project')).toBeVisible()
})

test('Dropdown content in SidebarModal shows on screen', async ({ page }) => {
  // go to an instance’s Network Interfaces page
  await page.goto('/projects/mock-project/instances/db1/network-interfaces')

  // stop the instance
  await page.getByRole('button', { name: 'Instance actions' }).click()
  await page.getByRole('menuitem', { name: 'Stop' }).click()

  // open the add network interface side modal
  await page.getByRole('button', { name: 'Add network interface' }).click()

  const sidebar = page.getByRole('dialog', { name: 'Add network interface' })

  // fill out the form
  await sidebar.getByLabel('Name').fill('alt-nic')

  // select the VPC and subnet via the dropdowns
  await sidebar.getByLabel('VPC').click()
  // dropdowns are rendered in a portal, so get component from the `page`, rather than the `sidebar`
  await page.getByRole('option', { name: 'mock-vpc' }).click()
  await sidebar.getByLabel('Subnet').click()
  await page.getByRole('option', { name: 'mock-subnet' }).click()

  /*
    A curious Playwright falsifiabilty problem here: even when the z-index values
    are shuffled in a way that should cause the test to fail, the tests still pass.
    I suspect it has to do with Playwright being able to “see” grid-positioned
    elements even when they are behind other elements?
  */

  // verify that the SideModal header is positioned above the TopBar
  await expect(
    sidebar.getByRole('heading', { name: 'Add network interface' })
  ).toBeVisible()
  await expect(sidebar.getByRole('button', { name: 'Close' })).toBeVisible()

  /*
    Similarly, Playwright can still see the UserMenu, even when manual testing shows that a user can’t
  */
  // await expect(page.getByRole('button', { name: 'User menu' })).toBeHidden()
  /* end of problematic tests */

  // test that the form can be submitted and a new network interface is created
  await sidebar.getByRole('button', { name: 'Add network interface' }).click()
  await expect(sidebar).toBeHidden()
  await expect(page.getByText('alt-nic')).toBeVisible()
})
