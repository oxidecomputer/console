/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  expect,
  expectNotVisible,
  expectRowVisible,
  expectVisible,
  getPageAsUser,
  test,
} from './utils'

// not trying to get elaborate here. just make sure the pages load, which
// exercises the loader prefetches and invariant checks

test.describe('System utilization', () => {
  test('works for fleet viewer', async ({ page }) => {
    await page.goto('/system/utilization')
    await expectVisible(page, [
      page.getByRole('heading', { name: 'Utilization' }),
      page.getByText('Disk utilization'),
      page.getByText('CPU utilization'),
      page.getByText('Memory utilization'),
      // stats under the graph which require capacity info
      page.getByText('In-use').first(),
    ])
  })

  test('Table view', async ({ page }) => {
    await page.goto('/system/utilization')
    await page.getByRole('tab', { name: 'Summary' }).click()

    const statCells = {
      CPU: expect.stringMatching(/^\d+$/),
      Disk: expect.stringMatching(/^\d+.\d+TiB$/),
      Memory: expect.stringMatching(/^\d+.\d+GiB$/),
    }

    const table = page.getByRole('table')
    await expectRowVisible(table, { Silo: 'maze-war', ...statCells })
    await expectRowVisible(table, { Silo: 'myriad', ...statCells })
  })

  test('does not appear for dev user', async ({ browser }) => {
    const page = await getPageAsUser(browser, 'Hans Jonas')
    await page.goto('/system/utilization')
    await expect(page.getByText('Page not found')).toBeVisible()
  })
})

test.describe('Silo utilization', () => {
  test('works for fleet viewer', async ({ page }) => {
    await page.goto('/utilization')
    await expectVisible(page, [page.getByRole('heading', { name: 'Utilization' })])
    await expectNotVisible(page, [
      page.getByText('Disk utilization'),
      page.getByText('CPU utilization'),
      page.getByText('Memory utilization'),
      // stats under the graph which require capacity info
      page.getByText('In-use'),
    ])
  })

  test('works for dev user', async ({ browser }) => {
    const page = await getPageAsUser(browser, 'Hans Jonas')
    await page.goto('/utilization')
    await expectVisible(page, [page.getByRole('heading', { name: 'Utilization' })])
    await expectNotVisible(page, [
      page.getByText('Disk utilization'),
      page.getByText('CPU utilization'),
      page.getByText('Memory utilization'),
      // stats under the graph which require capacity info
      page.getByText('In-use'),
    ])
  })
})

// TODO: it would be nice to test that actual data shows up in the graphs and
// the date range picker works as expected, but it's hard to do asserts about
// the graphs because they're big SVGs, the data coming from MSW is randomized,
// and the time ranges move with the current time. Will think about it.
