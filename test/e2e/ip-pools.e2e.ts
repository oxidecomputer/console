/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from '@playwright/test'

import { clickRowAction, expectRowVisible, expectToast } from './utils'

test('IP pool list', async ({ page }) => {
  await page.goto('/system/networking/ip-pools')

  await expect(page).toHaveTitle('IP Pools / Oxide Console')

  await expect(page.getByRole('heading', { name: 'IP Pools' })).toBeVisible()

  const table = page.getByRole('table')

  await expect(table.getByRole('row')).toHaveCount(7) // header + 6 rows (includes multicast pools)

  await expectRowVisible(table, {
    name: 'ip-pool-1',
    'IPs REMAINING': '16 / 24',
  })
  await expectRowVisible(table, {
    name: 'ip-pool-2',
    'IPs REMAINING': '31 / 32', // floatingIp3 uses one IP from this pool
  })
  await expectRowVisible(table, {
    name: 'ip-pool-3',
    'IPs REMAINING': '0 / 0',
  })
  await expectRowVisible(table, {
    name: 'ip-pool-4',
    'IPs REMAINING': '18.4e18 / 18.4e18',
  })
  await expectRowVisible(table, {
    name: 'ip-pool-5-multicast-v4',
    'IPs REMAINING': '32 / 32',
  })
  await expectRowVisible(table, {
    name: 'ip-pool-6-multicast-v6',
    'IPs REMAINING': '18.4e18 / 18.4e18',
  })
})

test.describe('german locale', () => {
  test.use({ locale: 'de-DE' })

  test('IP pools list renders bignum with correct locale', async ({ page }) => {
    await page.goto('/system/networking/ip-pools')
    const table = page.getByRole('table')
    await expectRowVisible(table, {
      name: 'ip-pool-4',
      'IPs REMAINING': '18,4e18 / 18,4e18',
    })
  })

  test('IP pool properties table renders bignum with correct locale', async ({ page }) => {
    await page.goto('/system/networking/ip-pools/ip-pool-4')
    await expect(page.getByText('18,4e18 / 18,4e18')).toBeVisible()
  })
})

test('IP pool silo list', async ({ page }) => {
  await page.goto('/system/networking/ip-pools')

  await page.getByRole('link', { name: 'ip-pool-1' }).click()
  await expect(page).toHaveTitle('ip-pool-1 / IP Pools / Oxide Console')

  await page.getByRole('tab', { name: 'Linked silos' }).click()
  // this is here because waiting for the `tab` query param to show up avoids
  // flake after the goBack bit below
  await expect(page).toHaveURL('/system/networking/ip-pools/ip-pool-1?tab=silos')

  const table = page.getByRole('table')
  await expectRowVisible(table, { Silo: 'maze-war', 'Silo default': 'default' })

  // clicking silo takes you to silo page
  const siloLink = page.getByRole('link', { name: 'maze-war' })
  await siloLink.click()
  await expect(page).toHaveURL('/system/silos/maze-war/ip-pools')
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
  await expectRowVisible(table, { Silo: 'maze-war', 'Silo default': 'default' })
  await expect(table.getByRole('row')).toHaveCount(4) // header + maze-war, myriad, pelerines

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

  // select silo in combobox and click link (thrax is not yet linked to ip-pool-1)
  await page.getByPlaceholder('Select a silo').fill('t')
  await page.getByRole('option', { name: 'thrax' }).click()
  await modal.getByRole('button', { name: 'Link' }).click()

  // modal closes and we see the thing in the table
  await expect(modal).toBeHidden()
  await expectRowVisible(table, { Silo: 'thrax', 'Silo default': '' })
})

test('IP pool silo make default (no existing default)', async ({ page }) => {
  // pelerines has ip-pool-1 linked but not as default, and has no v4 unicast default
  await page.goto('/system/networking/ip-pools/ip-pool-1?tab=silos')

  const table = page.getByRole('table')
  await expectRowVisible(table, { Silo: 'pelerines', 'Silo default': '' })

  await clickRowAction(page, 'pelerines', 'Make default')

  const dialog = page.getByRole('dialog', { name: 'Confirm make default' })
  await expect(
    dialog.getByText(
      'Are you sure you want to make ip-pool-1 the default pool for silo pelerines?'
    )
  ).toBeVisible()

  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(table, { Silo: 'pelerines', 'Silo default': 'default' })
})

test('IP pool silo make default (with existing default)', async ({ page }) => {
  // ip-pool-3 is linked to myriad but not as default; ip-pool-1 is the v4 unicast default for myriad
  await page.goto('/system/networking/ip-pools/ip-pool-3?tab=silos')

  const table = page.getByRole('table')
  await expectRowVisible(table, { Silo: 'myriad', 'Silo default': '' })

  await clickRowAction(page, 'myriad', 'Make default')

  const dialog = page.getByRole('dialog', { name: 'Confirm change default' })
  await expect(
    dialog.getByText('The current default pool for silo myriad is ip-pool-1.')
  ).toBeVisible()

  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(table, { Silo: 'myriad', 'Silo default': 'default' })
})

test('IP pool silo clear default', async ({ page }) => {
  await page.goto('/system/networking/ip-pools/ip-pool-1?tab=silos')

  const table = page.getByRole('table')
  await expectRowVisible(table, { Silo: 'maze-war', 'Silo default': 'default' })

  await clickRowAction(page, 'maze-war', 'Clear default')

  const dialog = page.getByRole('dialog', { name: 'Confirm clear default' })
  await expect(
    dialog.getByText(
      'Are you sure you want ip-pool-1 to stop being the default pool for silo maze-war?'
    )
  ).toBeVisible()

  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(table, { Silo: 'maze-war', 'Silo default': '' })
})

test('IP pool delete from IP Pools list page', async ({ page }) => {
  await page.goto('/system/networking/ip-pools')

  // can't delete a pool containing ranges
  await clickRowAction(page, 'ip-pool-1', 'Delete')
  await expect(page.getByRole('dialog', { name: 'Confirm delete' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expectToast(
    page,
    'Could not delete resourceIP pool cannot be deleted while it contains IP ranges'
  )

  await expect(page.getByRole('cell', { name: 'ip-pool-3' })).toBeVisible()

  // can delete a pool with no ranges
  await clickRowAction(page, 'ip-pool-3', 'Delete')
  await expect(page.getByRole('dialog', { name: 'Confirm delete' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(page.getByRole('cell', { name: 'ip-pool-3' })).toBeHidden()
})

test('IP pool delete from IP Pool view page', async ({ page }) => {
  // can't delete a pool containing ranges
  await page.goto('/system/networking/ip-pools/ip-pool-1')
  await page.getByRole('button', { name: 'IP pool actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeDisabled()

  // can delete a pool with no ranges
  await page.goto('/system/networking/ip-pools/ip-pool-3')
  await page.getByRole('button', { name: 'IP pool actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await expect(page.getByRole('dialog', { name: 'Confirm delete' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()

  // get redirected back to the list after successful delete
  await expect(page).toHaveURL('/system/networking/ip-pools')
  await expect(page.getByRole('cell', { name: 'ip-pool-3' })).toBeHidden()
})

test('IP pool create v4', async ({ page }) => {
  await page.goto('/system/networking/ip-pools')
  await expect(page.getByRole('cell', { name: 'another-pool' })).toBeHidden()

  const modal = page.getByRole('dialog', { name: 'Create IP pool' })
  await expect(modal).toBeHidden()

  await page.getByRole('link', { name: 'New IP pool' }).click()

  await expect(modal).toBeVisible()

  await page.getByRole('textbox', { name: 'Name' }).fill('another-pool')
  await page.getByRole('textbox', { name: 'Description' }).fill('whatever')

  // Select multicast pool type
  await page.getByRole('radio', { name: 'Multicast' }).click()

  await page.getByRole('button', { name: 'Create IP pool' }).click()

  await expect(modal).toBeHidden()
  await expectRowVisible(page.getByRole('table'), {
    name: 'another-pool',
    description: 'whatever',
    Type: 'multicast',
    'IPs REMAINING': '0 / 0',
  })
})

test('IP pool edit', async ({ page }) => {
  await page.goto('/system/networking/ip-pools/ip-pool-3')
  await page.getByRole('button', { name: 'IP pool actions' }).click()
  await page.getByRole('menuitem', { name: 'Edit' }).click()

  const modal = page.getByRole('dialog', { name: 'Edit IP pool' })
  await expect(modal).toBeVisible()

  await page.getByRole('textbox', { name: 'Name' }).fill('updated-pool')
  await page.getByRole('textbox', { name: 'Description' }).fill('an updated description')
  await page.getByRole('button', { name: 'Update IP pool' }).click()

  await expect(modal).toBeHidden()
  await expect(page).toHaveURL('/system/networking/ip-pools/updated-pool')
  await expect(page.getByRole('heading', { name: 'updated-pool' })).toBeVisible()
})

// TODO: update this to reflect that a given pool is now v4 or v6 only
test('IP range validation and add', async ({ page }) => {
  await page.goto('/system/networking/ip-pools/ip-pool-3')

  await page.getByRole('link', { name: 'Add range' }).first().click()

  const dialog = page.getByRole('dialog', { name: 'Add IP range' })
  const first = dialog.getByRole('textbox', { name: 'First' })
  const last = dialog.getByRole('textbox', { name: 'Last' })
  const submit = dialog.getByRole('button', { name: 'Add IP range' })
  const invalidMsg = dialog.getByText('Not a valid IP address')
  // ip-pool-3 is an IPv4 pool, so IPv6 addresses should be rejected
  const ipv6Msg = dialog.getByText('IPv6 address not allowed in IPv4 pool')

  const v4Addr = '192.1.2.3'
  const v6Addr = '2001:db8::1234:5678'

  await expect(dialog).toBeVisible()

  await first.fill('abc')
  // last is empty
  await submit.click()

  await expect(invalidMsg).toHaveCount(2)

  // change last to v6, not allowed in IPv4 pool
  await last.fill(v6Addr)
  await expect(invalidMsg).toHaveCount(1)
  await expect(ipv6Msg).toHaveCount(1)

  // change first to v6, still not allowed in IPv4 pool
  await first.fill(v6Addr)
  await expect(ipv6Msg).toHaveCount(2)
  await expect(invalidMsg).toBeHidden()

  // now make first v4, then last
  await first.fill(v4Addr)
  await expect(ipv6Msg).toHaveCount(1)
  await last.fill(v4Addr)
  await expect(ipv6Msg).toBeHidden()

  await submit.click()
  await expect(dialog).toBeHidden()

  const table = page.getByRole('table')
  await expectRowVisible(table, { First: v4Addr, Last: v4Addr })

  // now the properties table shows the single IP added
  await expect(page.getByText('1 / 1')).toBeVisible()

  // go back to the pool and verify the remaining/capacity columns changed
  // use the sidebar nav to get there
  const sidebar = page.getByRole('navigation', { name: 'Sidebar navigation' })
  await sidebar.getByRole('link', { name: 'IP Pools' }).click()
  await expectRowVisible(table, {
    name: 'ip-pool-3',
    'IPs REMAINING': '1 / 1',
  })
})

test('IPv4 addresses cannot be added to IPv6 pool', async ({ page }) => {
  // ip-pool-4 is an IPv6 pool
  await page.goto('/system/networking/ip-pools/ip-pool-4')

  await page.getByRole('link', { name: 'Add range' }).first().click()

  const dialog = page.getByRole('dialog', { name: 'Add IP range' })
  const first = dialog.getByRole('textbox', { name: 'First' })
  const last = dialog.getByRole('textbox', { name: 'Last' })
  const submit = dialog.getByRole('button', { name: 'Add IP range' })
  // ip-pool-4 is an IPv6 pool, so IPv4 addresses should be rejected
  const ipv4Msg = dialog.getByText('IPv4 address not allowed in IPv6 pool')

  const v4Addr = '192.168.1.1'
  const v6Addr = 'fd12:3456:789a:1::1'

  await expect(dialog).toBeVisible()

  // Try to add IPv4 address - should be rejected
  await first.fill(v4Addr)
  await last.fill(v4Addr)
  await submit.click() // trigger validation
  await expect(ipv4Msg).toHaveCount(2)

  // Change first to v6
  await first.fill(v6Addr)
  await expect(ipv4Msg).toHaveCount(1)

  // Change last to v6 - should now be valid
  await last.fill(v6Addr)
  await expect(ipv4Msg).toBeHidden()

  // Submit successfully
  await submit.click()
  await expect(dialog).toBeHidden()

  const table = page.getByRole('table')
  await expectRowVisible(table, { First: v6Addr, Last: v6Addr })
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

  // utilization updates in properties table
  await expect(page.getByText('13 / 21')).toBeVisible()

  // go back to the pool and verify the remaining/capacity columns changed
  // use the topbar breadcrumb to get there
  const breadcrumbs = page.getByRole('navigation', { name: 'Breadcrumbs' })
  await breadcrumbs.getByRole('link', { name: 'IP Pools' }).click()
  await expectRowVisible(table, {
    name: 'ip-pool-1',
    'IPs REMAINING': '13 / 21',
  })
})

test('deleting floating IP decrements utilization', async ({ page }) => {
  await page.goto('/system/networking/ip-pools')
  const table = page.getByRole('table')
  await expectRowVisible(table, {
    name: 'ip-pool-1',
    'IPs REMAINING': '16 / 24',
  })

  // go delete a floating IP
  await page.getByLabel('Switch between system and silo').click()
  await page.getByRole('menuitem', { name: 'Silo' }).click()
  await page.getByRole('link', { name: 'mock-project' }).click()
  await page.getByRole('link', { name: 'Floating IPs' }).click()
  await clickRowAction(page, 'rootbeer-float', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()

  // now go back and remaining increased by 1
  await page.getByLabel('Switch between system and silo').click()
  await page.getByRole('menuitem', { name: 'System' }).click()
  await page.getByRole('link', { name: 'IP Pools' }).click()
  await expectRowVisible(table, {
    name: 'ip-pool-1',
    'IPs REMAINING': '17 / 24',
  })
})

test('IPs remaining in properties table', async ({ page }) => {
  // pool with no ranges shows 0 / 0
  await page.goto('/system/networking/ip-pools/ip-pool-3')
  await expect(page.getByText('0 / 0')).toBeVisible()

  // pool with ranges shows remaining / capacity
  await page.goto('/system/networking/ip-pools/ip-pool-1')
  await expect(page.getByText('16 / 24')).toBeVisible()

  // large IPv6 pool shows abbreviated bignum
  await page.goto('/system/networking/ip-pools/ip-pool-4')
  await expect(page.getByText('18.4e18 / 18.4e18')).toBeVisible()
})
