/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from '@playwright/test'

// load the page, wait for something to be visible that indicates the page is
// loaded, and expect screenshot

test.describe('visual snapshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2025-01-23T10:44:12'))
  })

  test.afterEach(async ({ page }) => {
    await expect(page).toHaveScreenshot({ fullPage: true })
  })

  test('projects', async ({ page }) => {
    await page.goto('/projects')
    await expect(page.getByRole('cell', { name: 'mock-project' })).toBeVisible()
  })

  test('instances', async ({ page }) => {
    await page.goto('/projects/mock-project/instances')
    await expect(page.getByRole('cell', { name: 'db1' })).toBeVisible()
  })

  test('instance create', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1600 }) // tall page!
    await page.goto('/projects/mock-project/instances-new')
    await expect(page.getByRole('heading', { name: 'Create instance' })).toBeVisible()
  })

  test('firewall rules', async ({ page }) => {
    await page.goto('/projects/mock-project/vpcs/mock-vpc/firewall-rules')
    await expect(page.getByRole('cell', { name: 'allow-ssh' })).toBeVisible()
  })
})
