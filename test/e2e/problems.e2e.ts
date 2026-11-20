/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from '@playwright/test'

import { expectRowVisible, getPageAsUser, selectOption } from './utils'

test('problem list and state filter', async ({ page }) => {
  await page.goto('/system/problems')
  await expect(page).toHaveTitle('Problems / Oxide Console')
  await expect(page.getByRole('heading', { name: 'Problems' })).toBeVisible()

  const table = page.getByRole('table')
  const rows = table.getByRole('row')
  await expect(rows).toHaveCount(4) // header + 3 problems

  // sorted newest first
  await expect(rows.nth(1)).toContainText('Service in maintenance')
  await expect(rows.nth(1)).toContainText('active')
  await expect(rows.nth(3)).toContainText('resolved')

  await expectRowVisible(table, {
    summary: 'Unhealthy zpool',
    state: 'active',
    class: 'hardware.disk',
    code: '1',
  })

  await selectOption(page, 'Filter by state', 'Resolved')
  await expect(page).toHaveURL(/state=resolved/)
  await expect(rows).toHaveCount(2)
  await expectRowVisible(table, { summary: 'Service in maintenance', state: 'resolved' })

  await selectOption(page, 'Filter by state', 'Active')
  await expect(rows).toHaveCount(3)

  await selectOption(page, 'Filter by state', 'All states')
  await expect(page).not.toHaveURL(/state=/)
  await expect(rows).toHaveCount(4)
})

test('problem detail', async ({ page }) => {
  await page.goto('/system/problems')
  await page.getByRole('link', { name: 'Unhealthy zpool' }).click()

  await expect(page.getByRole('heading', { name: 'Unhealthy zpool' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Docs for Problem code 1' })).toHaveAttribute(
    'href',
    'https://docs.oxide.computer/guides/problems/code/0001'
  )
  await expect(page.getByText('Expunge the disk and replace it.')).toBeVisible()

  // impacts is the default tab
  await expect(page).toHaveURL(/\/impacts$/)
  const table = page.getByRole('table')
  await expect(table.getByRole('row')).toHaveCount(6) // header + 5 impacts
  await expectRowVisible(table, {
    'Resource type': 'Physical disk',
    reason: 'Disk is faulty',
    state: 'active',
  })
  await expectRowVisible(table, { 'Resource type': 'Instance', state: 'recovered' })

  await page.getByRole('tab', { name: 'Related problems' }).click()
  await expect(page).toHaveURL(/\/related-problems$/)
  await expect(page.getByText('No known causes')).toBeVisible()
  const consequences = page.getByRole('table', { name: 'Consequences' })
  await expectRowVisible(consequences, {
    reason: 'The service uses the unhealthy zpool',
    state: 'active',
  })

  await page.getByRole('tab', { name: 'Alerts' }).click()
  await expect(page).toHaveURL(/\/alerts$/)
  await expect(page.getByText('No alerts')).toBeVisible()

  await page.getByRole('tab', { name: 'Support bundles' }).click()
  await expect(page).toHaveURL(/\/support-bundles$/)
  await expectRowVisible(page.getByRole('table'), { state: 'collecting' })

  // a consequence links to the related problem, whose cause is this problem
  await page.getByRole('tab', { name: 'Related problems' }).click()
  await consequences.getByRole('link').click()
  await expect(page.getByRole('heading', { name: 'Service in maintenance' })).toBeVisible()
})

test('silo impact links to the silo by name', async ({ page }) => {
  await page.goto('/system/problems/e9f6b993-b8fb-4e26-a7d8-dbf0c4dc948d')
  const table = page.getByRole('table')

  // the silo of the second silo impact does not exist, so the cell shows the ID
  const deleted = table.getByRole('row', { name: 'Silo had disks' })
  await expect(deleted).toBeVisible()
  await expect(deleted.getByRole('link')).toBeHidden()

  await table.getByRole('link', { name: 'maze-war' }).click()
  await expect(page).toHaveURL('/system/silos/maze-war/idps')
  await expect(page.getByRole('heading', { name: 'maze-war' })).toBeVisible()
})

test('sled impact links to the sled', async ({ page }) => {
  await page.goto('/system/problems/36d8900f-ab1f-4826-a1e5-75932b90f5fe')
  await expect(page.getByRole('heading', { name: 'Service in maintenance' })).toBeVisible()

  await page.getByRole('table').getByRole('link').click()
  await expect(page).toHaveURL(
    '/system/inventory/sleds/c2519937-44a4-493b-9b38-5c337c597d08/instances'
  )

  // alerts for this problem
  await page.goBack()
  await page.getByRole('tab', { name: 'Alerts' }).click()
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(3)

  // the alert ID links to the alert on the Alerts page
  await page.getByRole('table').getByRole('link').first().click()
  await expect(page).toHaveURL(/\/system\/alerting\/alerts\/[0-9a-f-]{36}$/)
  await expect(page.getByRole('dialog', { name: 'Alert details' })).toBeVisible()
})

test('problems are not visible to a user without fleet access', async ({ browser }) => {
  const page = await getPageAsUser(browser, 'Hans Jonas')
  await page.goto('/system/problems')
  await expect(page.getByText('Page not found')).toBeVisible()
})
