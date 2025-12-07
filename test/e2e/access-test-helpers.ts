/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Page } from '@playwright/test'

import { expect, expectNotVisible, expectRowVisible, expectVisible } from './utils'

/**
 * Shared test helper for verifying user addition and tab navigation
 * Tests adding a user on the All tab, then verifying they appear correctly
 * on Users tab but not Groups tab
 */
export async function testAddUserOnAllTabAndVerifyOnUsersTabs(
  page: Page,
  config: {
    /** Base URL path (e.g., '/access/all' or '/projects/mock-project/access/all') */
    baseUrl: string
    /** Role prefix (e.g., 'silo' or 'project') */
    rolePrefix: 'silo' | 'project'
  }
) {
  await page.goto(config.baseUrl)

  // Start on the All tab
  await expectVisible(page, ['role=tab[name="All"][selected]'])

  const allTable = page.locator('table')

  // Add Hans Jonas as viewer
  await page.click('role=button[name="Add user or group"]')
  await expectVisible(page, ['role=heading[name*="Add user or group"]'])

  await page.click('role=button[name*="User or group"]')
  await page.click('role=option[name="Hans Jonas"]')
  await page.getByRole('radio', { name: /^Viewer / }).click()
  await page.click('role=button[name="Assign role"]')

  // User shows up in the All tab table
  await expectRowVisible(allTable, {
    Name: 'Hans Jonas',
    Type: 'User',
    Role: `${config.rolePrefix}.viewer`,
  })

  // Navigate to Users tab
  await page.click('role=tab[name="Users"]')
  await expectVisible(page, ['role=tab[name="Users"][selected]'])

  // Verify the URL changed to /users
  await expect(page).toHaveURL(/\/access\/users$/)

  const usersTable = page.locator('table')

  // User should still be visible on Users tab
  await expectRowVisible(usersTable, {
    Name: 'Hans Jonas',
    Role: `${config.rolePrefix}.viewer`,
  })

  // Type column should not be present on Users tab (since all are users)
  await expectNotVisible(page, ['role=columnheader[name="Type"]'])

  // Navigate to Groups tab
  await page.click('role=tab[name="Groups"]')
  await expectVisible(page, ['role=tab[name="Groups"][selected]'])

  // Hans Jonas should NOT be visible on Groups tab
  await expectNotVisible(page, ['role=cell[name="Hans Jonas"]'])

  // Type column should not be present on Groups tab either
  await expectNotVisible(page, ['role=columnheader[name="Type"]'])

  // Go back to All tab and verify Hans Jonas is still there
  await page.click('role=tab[name="All"]')
  await expectVisible(page, ['role=tab[name="All"][selected]'])
  await expectRowVisible(allTable, {
    Name: 'Hans Jonas',
    Type: 'User',
    Role: `${config.rolePrefix}.viewer`,
  })
}
