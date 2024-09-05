/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  clickRowAction,
  clipboardText,
  closeToast,
  expect,
  expectRowVisible,
  getPageAsUser,
  test,
} from './utils'

// not trying to get elaborate here. just make sure the pages load, which
// exercises the loader prefetches and invariant checks

test.describe('System utilization', () => {
  test('Works for fleet viewer', async ({ page }) => {
    await page.goto('/system/utilization')

    await expect(page.getByRole('heading', { name: 'Utilization' })).toBeVisible()
    await expect(page.getByText('Provisioned384 GiB')).toBeVisible()

    await expect(page.getByText('Provisioned / Quota')).toBeVisible()

    const table = page.getByRole('table')
    await expectRowVisible(table, {
      CPU: '20',
      Storage: '2.7 TiB',
      Memory: '66 GiB',
      Silo: 'maze-war',
    })
    await expectRowVisible(table, {
      CPU: '26',
      Storage: '7 TiB',
      Memory: '350 GiB',
      Silo: 'myriad',
    })

    await page.getByRole('tab', { name: 'Metrics' }).click()
  })

  test('can copy silo ID', async ({ page, browserName }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      browserName === 'webkit',
      'navigator.clipboard.readText() works locally in Safari but not in CI.'
    )
    await page.goto('/system/utilization')
    await clickRowAction(page, 'maze-war', 'Copy silo ID')
    expect(await clipboardText(page)).toEqual('6d3a9c06-475e-4f75-b272-c0d0e3f980fa')
  })

  test('does not appear for dev user', async ({ browser }) => {
    const page = await getPageAsUser(browser, 'Hans Jonas')
    await page.goto('/system/utilization')
    await expect(page.getByText('Page not found')).toBeVisible()
  })

  test('zero over zero', async ({ page }) => {
    // easiest way to test this is to create a silo with zero quotas and delete
    // the other two silos so it's the only one shown on system utilization.
    // Otherwise we'd have to create a user in the silo to see the utilization
    // inside the silo

    await page.goto('/system/silos-new')
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('all-zeros')
    // don't need to set silo values, they're zero by default
    await page.getByRole('button', { name: 'Create silo' }).click()

    await closeToast(page)

    const confirm = page.getByRole('button', { name: 'Confirm' })

    await clickRowAction(page, 'maze-war', 'Delete')
    await confirm.click()
    await expect(page.getByRole('cell', { name: 'maze-war' })).toBeHidden()

    await clickRowAction(page, 'myriad', 'Delete')
    await confirm.click()
    await expect(page.getByRole('cell', { name: 'myriad' })).toBeHidden()

    await page.getByRole('link', { name: 'Utilization' }).click()

    // all three capacity bars are zeroed out
    await expect(page.getByText('—%')).toHaveCount(3)
    await expect(page.getByText('NaN')).toBeHidden()

    await expectRowVisible(page.getByRole('table'), {
      Silo: 'all-zeros',
      CPU: '0',
      Memory: '0 GiB',
      Storage: '0 TiB',
    })
  })
})

test.describe('Silo utilization', () => {
  test('works for fleet viewer', async ({ page }) => {
    await page.goto('/utilization')
    await expect(page.getByRole('heading', { name: 'Utilization' })).toBeVisible()
    // Capacity bars are showing up
    await expect(page.getByText('Provisioned234 GiB')).toBeVisible()
  })

  test('works for dev user', async ({ browser }) => {
    const page = await getPageAsUser(browser, 'Hans Jonas')
    await page.goto('/utilization')
    await expect(page.getByRole('heading', { name: 'Utilization' })).toBeVisible()
    // Capacity bars are showing up
    await expect(page.getByText('Provisioned234 GiB')).toBeVisible()
  })
})

// TODO: it would be nice to test that actual data shows up in the graphs and
// the date range picker works as expected, but it's hard to do asserts about
// the graphs because they're big SVGs, the data coming from MSW is randomized,
// and the time ranges move with the current time. Will think about it.
