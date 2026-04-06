/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from '@playwright/test'

import {
  clickRowAction,
  expectRowVisible,
  expectToast,
  fillNumberInput,
  getPageAsUser,
  selectOption,
} from './utils'

test('Subnet pool list', async ({ page }) => {
  await page.goto('/system/networking/subnet-pools')
  await expect(page).toHaveTitle('Subnet Pools / Oxide Console')
  await expect(page.getByRole('heading', { name: 'Subnet Pools' })).toBeVisible()

  const table = page.getByRole('table')
  await expect(table.getByRole('row')).toHaveCount(5) // header + 4 pools

  await expectRowVisible(table, {
    name: 'default-v4-subnet-pool',
    'Addresses remaining': '65,008 / 65,536',
  })
  await expectRowVisible(table, {
    name: 'ipv6-subnet-pool',
    'Addresses remaining': '79.2e27 / 79.2e27',
  })
  await expectRowVisible(table, {
    name: 'myriad-v4-subnet-pool',
    'Addresses remaining': '65,536 / 65,536',
  })
  await expectRowVisible(table, {
    name: 'secondary-v4-subnet-pool',
    'Addresses remaining': '65,536 / 65,536',
  })
})

test('Subnet pool create', async ({ page }) => {
  await page.goto('/system/networking/subnet-pools')

  await page.getByRole('link', { name: 'New Subnet Pool' }).click()
  await expect(page).toHaveURL('/system/networking/subnet-pools-new')

  await page.getByRole('textbox', { name: 'Name' }).fill('test-pool')
  await page.getByRole('textbox', { name: 'Description' }).fill('A test subnet pool')
  await page.getByRole('button', { name: 'Create subnet pool' }).click()

  await expectToast(page, 'Subnet pool test-pool created')

  const table = page.getByRole('table')
  await expectRowVisible(table, { name: 'test-pool' })
})

test('Subnet pool detail and members', async ({ page }) => {
  await page.goto('/system/networking/subnet-pools')

  await page.getByRole('link', { name: 'default-v4-subnet-pool' }).click()
  await expect(page).toHaveTitle('default-v4-subnet-pool / Subnet Pools / Oxide Console')

  // Check properties table
  await expect(page.getByText('Default IPv4 subnet pool')).toBeVisible()
  await expect(page.getByText('65,008 / 65,536')).toBeVisible()

  // Members tab should show existing member
  const membersTable = page.getByRole('table')
  await expectRowVisible(membersTable, { Subnet: '10.128.0.0/16' })
})

test('Addresses remaining in properties table', async ({ page }) => {
  // pool with no allocations shows full capacity
  await page.goto('/system/networking/subnet-pools/secondary-v4-subnet-pool')
  await expect(page.getByText('65,536 / 65,536')).toBeVisible()

  // pool with allocations shows remaining / capacity
  await page.goto('/system/networking/subnet-pools/default-v4-subnet-pool')
  await expect(page.getByText('65,008 / 65,536')).toBeVisible()

  // large IPv6 pool shows abbreviated bignum
  await page.goto('/system/networking/subnet-pools/ipv6-subnet-pool')
  await expect(page.getByText('79.2e27 / 79.2e27')).toBeVisible()
})

test('Subnet pool add member', async ({ page }) => {
  await page.goto('/system/networking/subnet-pools/default-v4-subnet-pool')

  await page.getByRole('link', { name: 'Add member' }).click()
  await expect(page).toHaveURL(
    '/system/networking/subnet-pools/default-v4-subnet-pool/members-add'
  )

  await page.getByRole('textbox', { name: 'Subnet' }).fill('172.16.0.0/12')
  await fillNumberInput(page.getByRole('textbox', { name: 'Min prefix length' }), '16')
  await fillNumberInput(page.getByRole('textbox', { name: 'Max prefix length' }), '24')
  await page.getByRole('dialog').getByRole('button', { name: 'Add member' }).click()

  await expectToast(page, 'Member added')

  // utilization updates: /12 adds 2^20 = 1,048,576 addresses, pushing totals over 1M
  await expect(page.getByText('1.1M / 1.1M')).toBeVisible()

  const table = page.getByRole('table')
  await expectRowVisible(table, { Subnet: '172.16.0.0/12' })
})

test('Subnet pool remove member', async ({ page }) => {
  // Use secondary pool — default pool's member has external subnets allocated from it
  await page.goto('/system/networking/subnet-pools/secondary-v4-subnet-pool')

  await clickRowAction(page, '172.20.0.0/16', 'Remove')
  await expect(page.getByRole('dialog', { name: 'Confirm remove' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()

  // The row should be gone
  await expect(page.getByRole('cell', { name: '172.20.0.0/16' })).toBeHidden()

  // utilization drops to 0 / 0 after removing only member
  await expect(page.getByText('0 / 0')).toBeVisible()
})

test('Subnet pool linked silos', async ({ page }) => {
  await page.goto('/system/networking/subnet-pools/default-v4-subnet-pool?tab=silos')

  const table = page.getByRole('table')
  await expectRowVisible(table, { Silo: 'maze-war', 'Silo default': 'default' })

  // Clicking silo link goes to silo's subnet pools tab
  const siloLink = page.getByRole('link', { name: 'maze-war' })
  await siloLink.click()
  await expect(page).toHaveURL('/system/silos/maze-war/subnet-pools')
  await page.goBack()

  // Unlink fails when silo still has external subnets allocated from the pool
  await clickRowAction(page, 'maze-war', 'Unlink')
  await expect(page.getByRole('dialog', { name: 'Confirm unlink' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Could not unlink silo')
  // Row should still be there
  await expectRowVisible(table, { Silo: 'maze-war' })
})

test('Subnet pool unlink silo succeeds when no subnets allocated', async ({ page }) => {
  // ipv6-subnet-pool is linked to maze-war but has no external subnets allocated
  await page.goto('/system/networking/subnet-pools/ipv6-subnet-pool?tab=silos')

  const table = page.getByRole('table')
  await expectRowVisible(table, { Silo: 'maze-war' })

  await clickRowAction(page, 'maze-war', 'Unlink')
  await expect(page.getByRole('dialog', { name: 'Confirm unlink' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByRole('link', { name: 'maze-war' })).toBeHidden()
})

test('Subnet pool link silo', async ({ page }) => {
  await page.goto('/system/networking/subnet-pools/secondary-v4-subnet-pool?tab=silos')

  await page.getByRole('button', { name: 'Link silo' }).first().click()
  const dialog = page.getByRole('dialog', { name: 'Link silo' })
  await expect(dialog).toBeVisible()

  await page.getByPlaceholder('Select a silo').fill('m')
  await page.getByRole('option', { name: 'myriad' }).click()
  await dialog.getByRole('button', { name: 'Link' }).click()

  const table = page.getByRole('table')
  await expectRowVisible(table, { Silo: 'myriad' })
})

test('Subnet pool silo make default (no existing default)', async ({ page }) => {
  // ipv6-subnet-pool is linked to maze-war but not as default, and maze-war has no v6 default
  await page.goto('/system/networking/subnet-pools/ipv6-subnet-pool?tab=silos')

  const table = page.getByRole('table')
  await expectRowVisible(table, { Silo: 'maze-war', 'Silo default': '' })

  await clickRowAction(page, 'maze-war', 'Make default')

  const dialog = page.getByRole('dialog', { name: 'Confirm make default' })
  await expect(
    dialog.getByText(
      'Are you sure you want to make ipv6-subnet-pool the default IPv6 subnet pool for silo maze-war?'
    )
  ).toBeVisible()

  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(table, { Silo: 'maze-war', 'Silo default': 'default' })
})

test('Subnet pool silo make default (with existing default)', async ({ page }) => {
  // secondary-v4-subnet-pool is linked to maze-war but not as default;
  // default-v4-subnet-pool is the v4 default for maze-war
  await page.goto('/system/networking/subnet-pools/secondary-v4-subnet-pool?tab=silos')

  const table = page.getByRole('table')
  await expectRowVisible(table, { Silo: 'maze-war', 'Silo default': '' })

  await clickRowAction(page, 'maze-war', 'Make default')

  const dialog = page.getByRole('dialog', { name: 'Confirm change default' })
  await expect(
    dialog.getByText(
      'Are you sure you want to change the default IPv4 subnet pool for silo maze-war from default-v4-subnet-pool to secondary-v4-subnet-pool?'
    )
  ).toBeVisible()

  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(table, { Silo: 'maze-war', 'Silo default': 'default' })
})

test('Subnet pool silo clear default', async ({ page }) => {
  await page.goto('/system/networking/subnet-pools/default-v4-subnet-pool?tab=silos')

  const table = page.getByRole('table')
  await expectRowVisible(table, { Silo: 'maze-war', 'Silo default': 'default' })

  await clickRowAction(page, 'maze-war', 'Clear default')

  const dialog = page.getByRole('dialog', { name: 'Confirm clear default' })
  await expect(
    dialog.getByText(
      'Are you sure you want default-v4-subnet-pool to stop being the default IPv4 subnet pool for silo maze-war?'
    )
  ).toBeVisible()

  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(table, { Silo: 'maze-war', 'Silo default': '' })
})

test('Subnet pool edit', async ({ page }) => {
  await page.goto('/system/networking/subnet-pools/default-v4-subnet-pool')

  await page.getByRole('button', { name: 'Subnet pool actions' }).click()
  await page.getByRole('menuitem', { name: 'Edit' }).click()

  const nameField = page.getByRole('textbox', { name: 'Name' })
  await expect(nameField).toHaveValue('default-v4-subnet-pool')
  await nameField.fill('renamed-pool')
  await page.getByRole('button', { name: 'Update subnet pool' }).click()

  await expectToast(page, 'Subnet pool renamed-pool updated')
})

test('Subnet pool delete', async ({ page }) => {
  // First remove the member so the pool can be deleted
  await page.goto('/system/networking/subnet-pools/secondary-v4-subnet-pool')
  await clickRowAction(page, '172.20.0.0/16', 'Remove')
  const removeDialog = page.getByRole('dialog', { name: 'Confirm remove' })
  await expect(removeDialog).toBeVisible()
  await removeDialog.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByRole('cell', { name: '172.20.0.0/16' })).toBeHidden()

  // Use client-side navigation to preserve MSW db state
  await page.getByLabel('Breadcrumbs').getByRole('link', { name: 'Subnet Pools' }).click()
  await clickRowAction(page, 'secondary-v4-subnet-pool', 'Delete')
  const deleteDialog = page.getByRole('dialog', { name: 'Confirm delete' })
  await expect(deleteDialog).toBeVisible()
  await deleteDialog.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByRole('cell', { name: 'secondary-v4-subnet-pool' })).toBeHidden()
})

test('Subnet pool delete disabled when pool has members', async ({ page }) => {
  await page.goto('/system/networking/subnet-pools/default-v4-subnet-pool')

  await page.getByRole('button', { name: 'Subnet pool actions' }).click()
  const deleteItem = page.getByRole('menuitem', { name: 'Delete' })
  await expect(deleteItem).toBeDisabled()
})

test('Silo subnet pools tab', async ({ page }) => {
  await page.goto('/system/silos/maze-war/subnet-pools')
  await expect(page).toHaveTitle('Subnet Pools / maze-war / Silos / Oxide Console')

  const table = page.getByRole('table')
  // name cell includes "default" badge text
  await expectRowVisible(table, {
    name: expect.stringContaining('default-v4-subnet-pool'),
  })
})

test('Subnet pool picker only shows silo-linked pools', async ({ browser }) => {
  const page = await getPageAsUser(browser, 'Aryeh Kosman')
  await page.goto('/projects/kosman-project/external-subnets-new')

  // myriad silo has default-v4-subnet-pool and myriad-v4-subnet-pool linked
  const poolButton = page.getByRole('button', { name: 'Subnet pool' })
  await poolButton.click()
  await expect(page.getByRole('option', { name: 'default-v4-subnet-pool' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'myriad-v4-subnet-pool' })).toBeVisible()

  // pools not linked to myriad should not appear
  await expect(page.getByRole('option', { name: 'secondary-v4-subnet-pool' })).toBeHidden()
  await expect(page.getByRole('option', { name: 'ipv6-subnet-pool' })).toBeHidden()
})

test('External subnet create with myriad silo pool', async ({ browser }) => {
  const page = await getPageAsUser(browser, 'Aryeh Kosman')
  await page.goto('/projects/kosman-project/external-subnets-new')

  await page.getByRole('textbox', { name: 'Name' }).fill('myriad-subnet')

  // default pool should be preselected
  await expect(page.getByRole('button', { name: 'Subnet pool' })).toContainText(
    'default-v4-subnet-pool'
  )

  // switch to the myriad-only pool
  const option = page.getByRole('option', { name: 'myriad-v4-subnet-pool' })
  await selectOption(page, 'Subnet pool', option)

  await page.getByRole('button', { name: 'Create external subnet' }).click()
  await expectToast(page, 'External subnet myriad-subnet created')

  await expectRowVisible(page.getByRole('table'), { name: 'myriad-subnet' })
})
