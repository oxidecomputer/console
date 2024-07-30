/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { expectRowVisible } from './utils'

test('can nav to VpcPage from /', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('table').getByRole('link', { name: 'mock-project' }).click()
  await page.getByRole('link', { name: 'VPCs' }).click()

  await expectRowVisible(page.getByRole('table'), {
    name: 'mock-vpc',
    'DNS name': 'mock-vpc',
    description: 'a fake vpc',
    'Firewall Rules': '3',
  })

  // click the vpc name cell to go there
  await page.getByRole('link', { name: 'mock-vpc' }).click()

  await expect(page.getByRole('heading', { name: 'mock-vpc' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Firewall rules' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'allow-icmp' })).toBeVisible()
  await expect(page).toHaveURL('/projects/mock-project/vpcs/mock-vpc/firewall-rules')
  await expect(page).toHaveTitle(
    'Firewall Rules / mock-vpc / VPCs / mock-project / Oxide Console'
  )

  // we can also click the firewall rules cell to get to the VPC detail
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'mock-vpc' })).toBeHidden()
  await expect(page.getByRole('cell', { name: 'allow-icmp' })).toBeHidden()
  await page.getByRole('link', { name: '3' }).click()
  await expect(page.getByRole('heading', { name: 'mock-vpc' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'allow-icmp' })).toBeVisible()
})

test('can create and delete subnet', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')
  await page.getByRole('tab', { name: 'Subnets' }).click()
  // only one row in table, the default mock-subnet
  const rows = page.locator('tbody >> tr')
  await expect(rows).toHaveCount(1)
  await expect(rows.nth(0).locator('text="mock-subnet"')).toBeVisible()

  // open modal, fill out form, submit
  await page.click('text=New subnet')
  await page.fill('input[name=ipv4Block]', '10.1.1.2/24')
  await page.fill('input[name=name]', 'mock-subnet-2')
  await page.click('button:has-text("Create subnet")')

  await expect(rows).toHaveCount(2)

  await expect(rows.nth(0).locator('text="mock-subnet"')).toBeVisible()
  await expect(rows.nth(0).locator('text="10.1.1.1/24"')).toBeVisible()

  await expect(rows.nth(1).locator('text="mock-subnet-2"')).toBeVisible()
  await expect(rows.nth(1).locator('text="10.1.1.2/24"')).toBeVisible()

  // click more button on row to get menu, then click Delete
  await page
    .locator('role=row', { hasText: 'mock-subnet-2' })
    .locator('role=button[name="Row actions"]')
    .click()

  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(rows).toHaveCount(1)
})
