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
  closeToast,
  expectNotVisible,
  expectRowVisible,
  expectVisible,
} from './utils'

test('Create and edit VPC', async ({ page }) => {
  await page.goto('/projects/mock-project')

  await page.getByRole('link', { name: 'VPCs' }).click()
  await expect(page.getByRole('heading', { name: 'VPCs' })).toBeVisible()

  const table = page.getByRole('table')
  await expectRowVisible(table, {
    name: 'mock-vpc',
    'DNS name': 'mock-vpc',
    description: 'a fake vpc',
    'Firewall Rules': '3',
  })
  await expect(table.getByRole('row')).toHaveCount(2) // header plus row

  // New VPC form
  await page.getByRole('link', { name: 'New Vpc' }).click()
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('another-vpc')
  await page.getByRole('textbox', { name: 'DNS name' }).fill('another-vpc')
  await page.getByRole('button', { name: 'Create VPC' }).click()

  // now we're on the VPC detail, on the firewall rules tab
  await expect(page.getByRole('heading', { name: 'another-vpc' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Firewall Rules' })).toBeVisible()

  // we have the three default rules
  await expect(table.getByRole('row')).toHaveCount(4) // header plus three rows
  for (const name of ['allow-icmp', 'allow-internal-inbound', 'allow-ssh']) {
    await expect(page.getByRole('cell', { name })).toBeVisible()
  }

  // now go back up a level to vpcs table
  const breadcrumbs = page.getByRole('navigation', { name: 'Breadcrumbs' })
  await breadcrumbs.getByRole('link', { name: 'VPCs' }).click()
  await expect(table.getByRole('row')).toHaveCount(3) // header plus two rows
  await expectRowVisible(table, {
    name: 'another-vpc',
    'DNS name': 'another-vpc',
    description: '—',
    'Firewall Rules': '3',
  })

  // Edit VPC form
  await clickRowAction(page, 'mock-vpc', 'Edit')
  await expectVisible(page, [
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=textbox[name="DNS name"]',
    'role=button[name="Update VPC"]',
  ])
  await page.fill('role=textbox[name="Name"]', 'new-vpc')
  await page.click('role=button[name="Update VPC"]')

  // Close toast, it holds up the test for some reason
  await closeToast(page)

  await expect(page.getByRole('link', { name: 'new-vpc' })).toBeVisible()
})

test('Create and edit subnet', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')

  // VPC detail, subnets tab
  await expectVisible(page, [
    'role=heading[name*="mock-vpc"]',
    'role=tab[name="Firewall Rules"]',
    'role=cell[name="allow-icmp"]',
  ])

  await page.getByRole('tab', { name: 'Subnets' }).click()

  // Create subnet
  await page.click('role=link[name="New subnet"]')
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
    'role=cell[name="allow-ssh"]',
  ])
})
