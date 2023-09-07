/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { expectNotVisible, expectVisible } from './utils'

test('Create and edit VPC', async ({ page }) => {
  await page.goto('/projects/mock-project')

  await page.click('role=link[name*="Networking"]')
  await expectVisible(page, [
    'role=heading[name*="VPCs"]',
    'role=cell[name="mock-vpc"] >> nth=0',
  ])

  // New VPC form
  await page.click('role=link[name="New Vpc"]')
  await expectVisible(page, [
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=textbox[name="DNS name"]',
    'role=textbox[name="IPV6 prefix"]',
    'role=button[name="Create VPC"]',
  ])
  await page.goBack()

  // Edit VPC form
  await expectVisible(page, ['role=link[name="mock-vpc"]'])
  await page
    .locator('role=row', { hasText: 'mock-vpc' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Edit"]')
  await expectVisible(page, [
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=textbox[name="DNS name"]',
    'role=button[name="Save changes"]',
  ])
  await page.fill('role=textbox[name="Name"]', 'new-vpc')
  await page.click('role=button[name="Save changes"]')

  // Close toast, it holds up the test for some reason
  await page.click('role=button[name="Dismiss notification"]')

  await expect(page.getByRole('link', { name: 'new-vpc' })).toBeVisible()
})

test('Create and edit subnet', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')

  // VPC detail, subnets tab
  await expectVisible(page, [
    'role=heading[name*="mock-vpc"]',
    'role=tab[name="Subnets"]',
    // 'role=tab[name="System Routes"]',
    // 'role=tab[name="Routers"]',
    'role=tab[name="Firewall Rules"]',
    'role=cell[name="mock-subnet"]',
    // TODO: assert minitable contents
  ])

  // Create subnet
  await page.click('role=button[name="New subnet"]')
  await expectVisible(page, [
    'role=heading[name="Create subnet"]',
    'role=button[name="Create subnet"]',
  ])
  await page.fill('role=textbox[name="Name"]', 'new-subnet')
  await page.fill('role=textbox[name="IPv4 block"]', '10.1.1.1/24')
  await page.click('role=button[name="Create subnet"]')

  // Edit subnet
  await expectVisible(page, ['role=cell[name="new-subnet"]'])
  await page
    .locator('role=row', { hasText: 'new-subnet' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Edit"]')

  await expectVisible(page, [
    'role=heading[name="Edit subnet"]',
    'role=button[name="Update subnet"]',
  ])
  await page.fill('role=textbox[name="Name"]', 'edited-subnet')
  await page.fill('role=textbox[name="Description"]', 'behold')
  await page.click('role=button[name="Update subnet"]')

  await expectNotVisible(page, ['role=cell[name="new-subnet"]'])
  await expectVisible(page, ['role=cell[name="edited-subnet"]'])

  // Firewall rules
  await page.click('role=tab[name="Firewall Rules"]')
  await expectVisible(page, [
    'role=cell[name="allow-icmp"]',
    'role=cell[name="allow-internal-inbound"]',
    'role=cell[name="allow-rdp"]',
    'role=cell[name="allow-ssh"]',
  ])
})
