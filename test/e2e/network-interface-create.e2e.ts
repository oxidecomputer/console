/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { test } from '@playwright/test'

import { expect, expectRowVisible, stopInstance } from './utils'

test('can create a NIC with a specified IP address', async ({ page }) => {
  // go to an instance's Network Interfaces page
  await page.goto('/projects/mock-project/instances/db1/networking')

  await stopInstance(page)

  // open the add network interface side modal
  await page.getByRole('button', { name: 'Add network interface' }).click()

  // fill out the form
  await page.getByLabel('Name').fill('nic-1')
  await page.getByLabel('VPC', { exact: true }).click()
  await page.getByRole('option', { name: 'mock-vpc' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Subnet' }).click()
  await page.getByRole('option', { name: 'mock-subnet', exact: true }).click()

  // Select IPv4 only
  await page.getByRole('radio', { name: 'IPv4', exact: true }).click()
  await page.getByLabel('IPv4 Address').fill('1.2.3.4')

  const sidebar = page.getByRole('dialog', { name: 'Add network interface' })

  // test that the form can be submitted and a new network interface is created
  await sidebar.getByRole('button', { name: 'Add network interface' }).click()
  await expect(sidebar).toBeHidden()

  const table = page.getByRole('table', { name: 'Network interfaces' })
  await expectRowVisible(table, { name: 'nic-1', 'Private IP': 'v41.2.3.4' })
})

test('can create a NIC with a blank IP address', async ({ page }) => {
  // go to an instance's Network Interfaces page
  await page.goto('/projects/mock-project/instances/db1/networking')

  await stopInstance(page)

  // open the add network interface side modal
  await page.getByRole('button', { name: 'Add network interface' }).click()

  // fill out the form
  await page.getByLabel('Name').fill('nic-2')
  await page.getByLabel('VPC', { exact: true }).click()
  await page.getByRole('option', { name: 'mock-vpc' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Subnet' }).click()
  await page.getByRole('option', { name: 'mock-subnet', exact: true }).click()

  // Dual-stack is selected by default, so both fields should be visible
  // make sure the IPv4 address field has a non-conforming bit of text in it
  await page.getByLabel('IPv4 Address').fill('x')

  // try to submit it
  const sidebar = page.getByRole('dialog', { name: 'Add network interface' })
  await sidebar.getByRole('button', { name: 'Add network interface' }).click()

  // it should error out
  await expect(sidebar.getByText('Zod error for body')).toBeVisible()

  // make sure both IP address fields have spaces in them
  await page.getByLabel('IPv4 Address').fill('    ')
  await page.getByLabel('IPv6 Address').fill('    ')

  // test that the form can be submitted and a new network interface is created
  await sidebar.getByRole('button', { name: 'Add network interface' }).click()
  await expect(sidebar).toBeHidden()

  // ip address is auto-assigned (dual-stack by default)
  const table = page.getByRole('table', { name: 'Network interfaces' })
  await expectRowVisible(table, {
    name: 'nic-2',
    'Private IP': expect.stringMatching(/v4123\.45\.68\.8\s*v6fd12:3456::/),
  })
})

test('can create a NIC with IPv6 only', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/networking')

  await stopInstance(page)

  await page.getByRole('button', { name: 'Add network interface' }).click()

  await page.getByLabel('Name').fill('nic-3')
  await page.getByLabel('VPC', { exact: true }).click()
  await page.getByRole('option', { name: 'mock-vpc' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Subnet' }).click()
  await page.getByRole('option', { name: 'mock-subnet', exact: true }).click()

  // Select IPv6 only
  await page.getByRole('radio', { name: 'IPv6', exact: true }).click()
  await page.getByLabel('IPv6 Address').fill('::1')

  const sidebar = page.getByRole('dialog', { name: 'Add network interface' })
  await sidebar.getByRole('button', { name: 'Add network interface' }).click()
  await expect(sidebar).toBeHidden()

  const table = page.getByRole('table', { name: 'Network interfaces' })
  await expectRowVisible(table, { name: 'nic-3', 'Private IP': 'v6::1' })
})

test('can create a NIC with dual-stack and explicit IPs', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/networking')

  await stopInstance(page)

  await page.getByRole('button', { name: 'Add network interface' }).click()

  await page.getByLabel('Name').fill('nic-4')
  await page.getByLabel('VPC', { exact: true }).click()
  await page.getByRole('option', { name: 'mock-vpc' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Subnet' }).click()
  await page.getByRole('option', { name: 'mock-subnet', exact: true }).click()

  // Dual-stack is selected by default
  await page.getByLabel('IPv4 Address').fill('10.0.0.5')
  await page.getByLabel('IPv6 Address').fill('fd00::5')

  const sidebar = page.getByRole('dialog', { name: 'Add network interface' })
  await sidebar.getByRole('button', { name: 'Add network interface' }).click()
  await expect(sidebar).toBeHidden()

  const table = page.getByRole('table', { name: 'Network interfaces' })
  await expectRowVisible(table, {
    name: 'nic-4',
    'Private IP': expect.stringMatching(/v410\.0\.0\.5\s*v6fd00::5/),
  })
})
