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

  await expect(page).toHaveTitle('IP pools / Oxide Console')

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
  await expect(page).toHaveTitle('ip-pool-1 / IP pools / Oxide Console')

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
  await expect(page.getByRole('dialog', { name: 'Confirm unlink' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()
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

test('IP range validation and add', async ({ page }) => {
  await page.goto('/system/networking/ip-pools/ip-pool-1/ranges-add')

  const dialog = page.getByRole('dialog', { name: 'Add IP range' })
  const first = dialog.getByRole('textbox', { name: 'First' })
  const last = dialog.getByRole('textbox', { name: 'Last' })
  const submit = dialog.getByRole('button', { name: 'Add IP range' })
  const invalidMsg = dialog.getByText('Not a valid IP address')
  // exact to differentiate from same text in help message at the top of the form
  const sameVersionMsg = dialog.getByText('First and last must be the same version', {
    exact: true,
  })

  const v6Addr = '2001:db8::1234:5678'

  await expect(dialog).toBeVisible()

  await first.fill('abc')
  // last is empty
  await submit.click()

  await expect(invalidMsg).toHaveCount(2)

  // fix last
  await last.fill('123.4.56.7')

  // first is still bad
  await expect(invalidMsg).toHaveCount(1)

  // change first to a valid ipv6
  await first.fill(v6Addr)

  // now we get the error about the same version on first because it has had
  // an error, so it is now validating onChange, but it doesn't show up on last
  // until we try to submit
  await expect(sameVersionMsg).toHaveCount(1)
  await expect(invalidMsg).toBeHidden()

  await submit.click()
  await expect(sameVersionMsg).toHaveCount(2)

  // now make last also a v6 and we're good
  await last.fill(v6Addr)

  // actually first's error doesn't disappear until we blur it or submit
  await expect(sameVersionMsg).toHaveCount(1)
  await expect(invalidMsg).toBeHidden()

  await submit.click()
  await expect(dialog).toBeHidden()

  await expectRowVisible(page.getByRole('table'), { First: v6Addr, Last: v6Addr })
})

test('remove range', async ({ page }) => {
  await page.goto('/system/networking/ip-pools/ip-pool-1')

  const table = page.getByRole('table')
  await expectRowVisible(table, { First: '10.0.0.20', Last: '10.0.0.22' })
  await expect(table.getByRole('row')).toHaveCount(3) // header + 2 rows

  await clickRowAction(page, '10.0.0.20', 'Remove')

  const confirmModal = page.getByRole('dialog', { name: 'Confirm remove range' })
  await expect(confirmModal.getByText('range 10.0.0.20–10.0.0.22')).toBeVisible()

  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(confirmModal).toBeHidden()

  await clickRowAction(page, '10.0.0.20', 'Remove')
  await confirmModal.getByRole('button', { name: 'Confirm' }).click()

  await expect(table.getByRole('cell', { name: '10.0.0.20' })).toBeHidden()
  await expect(table.getByRole('row')).toHaveCount(2)
})
