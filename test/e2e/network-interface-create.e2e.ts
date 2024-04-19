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
  // go to an instance’s Network Interfaces page
  await page.goto('/projects/mock-project/instances/db1/network-interfaces')

  await stopInstance(page)

  // open the add network interface side modal
  await page.getByRole('button', { name: 'Add network interface' }).click()

  // fill out the form
  await page.getByLabel('Name').fill('nic-1')
  await page.getByRole('button', { name: 'VPC' }).click()
  await page.getByRole('option', { name: 'mock-vpc' }).click()
  await page.getByRole('button', { name: 'Subnet' }).click()
  await page.getByRole('option', { name: 'mock-subnet' }).click()
  await page.getByLabel('IP Address').fill('1.2.3.4')

  const sidebar = page.getByRole('dialog', { name: 'Add network interface' })

  // test that the form can be submitted and a new network interface is created
  await sidebar.getByRole('button', { name: 'Add network interface' }).click()
  await expect(sidebar).toBeHidden()

  const table = page.getByRole('table', { name: 'Network interfaces' })
  await expectRowVisible(table, { name: 'nic-1', 'Private IP': '1.2.3.4' })
})

test('can create a NIC with a blank IP address', async ({ page }) => {
  // go to an instance’s Network Interfaces page
  await page.goto('/projects/mock-project/instances/db1/network-interfaces')

  await stopInstance(page)

  // open the add network interface side modal
  await page.getByRole('button', { name: 'Add network interface' }).click()

  // fill out the form
  await page.getByLabel('Name').fill('nic-2')
  await page.getByRole('button', { name: 'VPC' }).click()
  await page.getByRole('option', { name: 'mock-vpc' }).click()
  await page.getByRole('button', { name: 'Subnet' }).click()
  await page.getByRole('option', { name: 'mock-subnet' }).click()

  // make sure the IP address field has a non-conforming bit of text in it
  await page.getByLabel('IP Address').fill('x')

  // try to submit it
  const sidebar = page.getByRole('dialog', { name: 'Add network interface' })
  await sidebar.getByRole('button', { name: 'Add network interface' }).click()

  // it should error out
  // todo: improve error message from API
  await expect(sidebar.getByText('Unknown server error')).toBeVisible()

  // make sure the IP address field has spaces in it
  await page.getByLabel('IP Address').fill('    ')

  // test that the form can be submitted and a new network interface is created
  await sidebar.getByRole('button', { name: 'Add network interface' }).click()
  await expect(sidebar).toBeHidden()

  // ip address is auto-assigned
  const table = page.getByRole('table', { name: 'Network interfaces' })
  await expectRowVisible(table, { name: 'nic-2', 'Private IP': '123.45.68.8' })
})
