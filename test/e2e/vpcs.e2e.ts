/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

test('can nav to VpcPage from /', async ({ page }) => {
  await page.goto('/')
  await page.click('table :text("mock-project")')
  await page.click('a:has-text("VPCs")')
  await page.click('a:has-text("mock-vpc")')
  await expect(page.locator('text=mork-subnet')).toBeVisible()
  expect(await page.title()).toEqual('mock-vpc / VPCs / mock-project / Oxide Console')
})

test('can create and delete subnet', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')
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
