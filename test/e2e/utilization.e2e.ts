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
    await expect(page.getByText('Provisioned384.84 GiB')).toBeVisible()

    await expect(page.getByText('Provisioned / Quota')).toBeVisible()

    const table = page.getByRole('table')
    await expectRowVisible(table, {
      CPU: '20',
      Storage: '3.57 TiB',
      Memory: '72.24 GiB',
      Silo: 'maze-war',
    })
    await expectRowVisible(table, {
      CPU: '26',
      Storage: '6.61 TiB',
      Memory: '349.49 GiB',
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
      Memory: '0 KiB',
      Storage: '0 KiB',
    })
  })
})

test.describe('Silo utilization', () => {
  test('works for fleet viewer', async ({ page }) => {
    await page.goto('/utilization')
    await expect(page.getByRole('heading', { name: 'Utilization' })).toBeVisible()
    // Capacity bars are showing up
    await expect(page.getByText('Provisioned234.31 GiB')).toBeVisible()
  })

  test('works for dev user', async ({ browser }) => {
    const page = await getPageAsUser(browser, 'Hans Jonas')
    await page.goto('/utilization')
    await expect(page.getByRole('heading', { name: 'Utilization' })).toBeVisible()
    // Capacity bars are showing up
    await expect(page.getByText('Provisioned234.31 GiB')).toBeVisible()
  })
})

test('Utilization shows correct units for CPU, memory, and storage', async ({ page }) => {
  await page.goto('/system/utilization')

  // Verify the original values for the Memory tile
  await expect(page.getByText('Memory(GIB)')).toBeVisible()
  await expect(page.getByText('Provisioned384.84 GiB')).toBeVisible()
  await expect(page.getByText('Quota (Total)806.57 GiB')).toBeVisible()

  // Navigate to the quotas tab
  await page.goto('system/silos/maze-war?tab=quotas')

  // Verify that there's a row for memory with the correct units
  const table = page.getByRole('table')
  await expectRowVisible(table, { Provisioned: '234.31 GiB', Quota: '306.55 GiB' })
  await expect(page.getByText('2.93 TiB')).toBeHidden()

  // Edit the quota and verify the new value
  await page.getByRole('button', { name: 'Edit quotas' }).click()
  await page.getByRole('textbox', { name: 'Memory (GiB)' }).fill('3000')
  await page.getByRole('button', { name: 'Update quotas' }).click()
  // Verify that the table has been updated
  await expectRowVisible(table, { Provisioned: '0.23 TiB', Quota: '2.93 TiB' })
  await expect(page.getByText('306.55 GiB')).toBeHidden()

  // Navigate back to the utilization page without refreshing
  await page.getByRole('link', { name: 'Utilization' }).click()
  await expect(page.getByRole('heading', { name: 'Utilization' })).toBeVisible()

  // Verify the updated values for the Memory tile
  await expect(page.getByText('Memory(TiB)')).toBeVisible()
  await expect(page.getByText('Provisioned0.38 TiB')).toBeVisible()
  await expect(page.getByText('Quota (Total)3.42 TiB')).toBeVisible()
})

// TODO: it would be nice to test that actual data shows up in the graphs and
// the date range picker works as expected, but it's hard to do asserts about
// the graphs because they're big SVGs, the data coming from MSW is randomized,
// and the time ranges move with the current time. Will think about it.
