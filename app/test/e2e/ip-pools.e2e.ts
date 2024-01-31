/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from '@playwright/test'

import { clickRowAction, expectRowVisible } from './utils'

test('IP pool list', async ({ page }) => {
  await page.goto('/system/networking/ip-pools')

  await expect(page.getByRole('heading', { name: 'Networking' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'IP pools' })).toBeVisible()

  const table = page.getByRole('table')

  await expect(table.getByRole('row')).toHaveCount(4) // header + 3 rows

  await expect(page.getByRole('cell', { name: 'ip-pool-1' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'ip-pool-2' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'ip-pool-3' })).toBeVisible()
})

test('IP pool silo list', async ({ page }) => {
  await page.goto('/system/networking/ip-pools')
  await page.getByRole('link', { name: 'ip-pool-1' }).click()
  await page.getByRole('tab', { name: 'Linked silos' }).click()

  const table = page.getByRole('table')
  await expectRowVisible(table, { Silo: 'maze-war', 'Pool is silo default?': 'default' })

  // clicking silo takes you to silo page
  const siloLink = page.getByRole('link', { name: 'maze-war' })
  await siloLink.click()
  await expect(page).toHaveURL('/system/silos/maze-war?tab=ip-pools')
  await page.goBack()

  // unlink silo and the row is gone
  await clickRowAction(page, 'maze-war', 'Unlink')
  await expect(siloLink).toBeHidden()
})

test('IP pool link silo', async ({ page }) => {
  await page.goto('/system/networking/ip-pools/ip-pool-1?tab=silos')

  const table = page.getByRole('table')
  await expectRowVisible(table, { Silo: 'maze-war', 'Pool is silo default?': 'default' })
  await expect(table.getByRole('row')).toHaveCount(2) // header and 1 row

  const modal = page.getByRole('dialog', { name: 'Link silo' })
  await expect(modal).toBeHidden()

  // open link modal
  await page.getByRole('button', { name: 'Link silo' }).click()
  await expect(modal).toBeVisible()

  // close modal works
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(modal).toBeHidden()

  // reopen
  await page.getByRole('button', { name: 'Link silo' }).click()
  await expect(modal).toBeVisible()

  // select silo in listbox and click link
  await page.getByRole('button', { name: 'Select silo' }).click()
  await page.getByRole('option', { name: 'myriad' }).click()
  await modal.getByRole('button', { name: 'Link' }).click()

  // modal closes and we see the thing in the table
  await expect(modal).toBeHidden()
  await expectRowVisible(table, { Silo: 'myriad', 'Pool is silo default?': '' })
})

test('IP pool delete', async ({ page }) => {
  await page.goto('/system/networking/ip-pools')

  // can't delete a pool containing ranges
  await clickRowAction(page, 'ip-pool-1', 'Delete')
  await expect(page.getByRole('dialog', { name: 'Confirm delete' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(page.getByText('Could not delete resource').first()).toBeVisible()
  await expect(
    page.getByText('IP pool cannot be deleted while it contains IP ranges').first()
  ).toBeVisible()

  await expect(page.getByRole('cell', { name: 'ip-pool-3' })).toBeVisible()

  // can delete a pool with no ranges
  await clickRowAction(page, 'ip-pool-3', 'Delete')
  await expect(page.getByRole('dialog', { name: 'Confirm delete' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(page.getByRole('cell', { name: 'ip-pool-3' })).toBeHidden()
})

test('IP pool create', async ({ page }) => {
  await page.goto('/system/networking/ip-pools')
  await expect(page.getByRole('cell', { name: 'another-pool' })).toBeHidden()

  const modal = page.getByRole('dialog', { name: 'Create IP pool' })
  await expect(modal).toBeHidden()

  await page.getByRole('link', { name: 'New IP pool' }).click()

  await expect(modal).toBeVisible()

  await page.getByRole('textbox', { name: 'Name' }).fill('another-pool')
  await page.getByRole('textbox', { name: 'Description' }).fill('whatever')
  await page.getByRole('button', { name: 'Create IP pool' }).click()

  await expect(modal).toBeHidden()
  await expectRowVisible(page.getByRole('table'), {
    name: 'another-pool',
    description: 'whatever',
  })
})
