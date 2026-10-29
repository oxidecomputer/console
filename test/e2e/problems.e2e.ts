/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from '@playwright/test'

import { expectRowVisible, getPageAsUser } from './utils'

test('problem list tabs', async ({ page }) => {
  await page.goto('/system/problems')
  await expect(page).toHaveTitle('Problems / Oxide Console')
  await expect(page.getByRole('heading', { name: 'Problems' })).toBeVisible()

  const table = page.getByRole('table')
  await expectRowVisible(table, {
    Summary: 'Not a Real Problem',
    Class: 'system',
    Code: '0',
  })
  await expect(table.getByRole('columnheader', { name: 'Resolved' })).toBeHidden()

  await page.getByRole('tab', { name: 'Resolved' }).click()
  await expect(page).toHaveURL(/tab=resolved/)
  await expect(table.getByRole('columnheader', { name: 'Resolved' })).toBeVisible()
  await expectRowVisible(table, { Summary: 'Not a Real Problem' })
  await expect(page.getByText('Something went wrong')).toBeHidden()
})

test('problem detail with nothing attached', async ({ page }) => {
  await page.goto('/system/problems')
  await page.getByRole('link', { name: 'Not a Real Problem' }).click()

  await expect(page.getByRole('heading', { name: 'Not a Real Problem' })).toBeVisible()
  await expect(page.getByText('If you encounter this problem in real life')).toBeVisible()

  // Nexus doesn't record any of these yet
  for (const empty of [
    'No impacted resources',
    'No related problems',
    'No alerts',
    'No support bundles',
  ]) {
    await expect(page.getByText(empty)).toBeVisible()
  }
})

test('problem list with made-up problems', async ({ page }) => {
  await page.goto('/system/problems')
  const table = page.getByRole('table')
  await expect(table.getByRole('row')).toHaveCount(7) // header + 6 active
  await expectRowVisible(table, {
    Summary: 'Physical disk faulted',
    Class: 'hardware.disk',
    Code: '12',
  })
  await expect(table.getByRole('cell', { name: 'Sled unavailable' })).toBeHidden()

  await page.getByRole('tab', { name: 'Resolved' }).click()
  await expect(table.getByRole('row')).toHaveCount(5) // header + 4 resolved
  await expectRowVisible(table, { Summary: 'Sled unavailable', Class: 'hardware.sled' })
})

test('problem detail', async ({ page }) => {
  await page.goto('/system/problems')
  await page.getByRole('link', { name: 'Reduced power redundancy' }).click()

  await expect(
    page.getByRole('heading', { name: 'Reduced power redundancy' })
  ).toBeVisible()
  await expect(page.getByText('Action required')).toBeVisible()

  // the cause is shown by summary, fetched separately from the relation
  const related = page.getByRole('table', { name: 'Related problems' })
  await expectRowVisible(related, {
    Problem: expect.stringContaining('Power supply removed'),
    Relation: 'Cause',
  })

  // no impacts: power shelves aren't API resources
  await expect(page.getByText('No impacted resources')).toBeVisible()

  // follow the relation to the cause, which lists the underlying hardware alert
  // alongside its own lifecycle alerts
  await related.getByRole('link', { name: 'Power supply removed' }).click()
  await expect(page.getByRole('heading', { name: 'Power supply removed' })).toBeVisible()
  const alerts = page.getByRole('table', { name: 'Alerts' })
  await expect(alerts.getByRole('row')).toHaveCount(4) // header + 3
  await expectRowVisible(alerts, { Class: 'hardware.power_shelf.psu.remove' })
  await expectRowVisible(alerts, {
    Class: 'active_problem.updated.hardware.power_shelf',
    Revision: '2',
  })
})

test('problem impacts link to hardware', async ({ page }) => {
  await page.goto('/system/problems')
  await page.getByRole('link', { name: 'Physical disk faulted' }).click()

  const impacts = page.getByRole('table', { name: 'Impacted resources' })
  await expect(impacts.getByRole('row')).toHaveCount(3) // header + 2
  await expectRowVisible(impacts, { Type: 'physical disk' })
  await impacts.getByRole('link').click()
  await expect(page).toHaveURL(/\/system\/inventory\/sleds\/.+\/instances/)
})

test('problem alerts appear in the alert list', async ({ page }) => {
  await page.goto('/system/alerting/alerts?subscription=active_problem.**')
  const table = page.getByRole('table')
  await expectRowVisible(table, { Class: 'active_problem.detected.hardware.disk' })
})

test('dev user gets 404 on problems page', async ({ browser }) => {
  const page = await getPageAsUser(browser, 'Hans Jonas')
  await page.goto('/system/problems')
  await expect(page.getByText('Page not found')).toBeVisible()
})
