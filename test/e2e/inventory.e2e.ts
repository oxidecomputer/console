/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { physicalDisks, sleds } from '@oxide/api-mocks'

import { expect, expectRowVisible, expectVisible, test } from './utils'

test('Sled inventory page', async ({ page }) => {
  await page.goto('/system/inventory/sleds')

  await expectVisible(page, ['role=heading[name*="Inventory"]'])

  const sledsTab = page.getByRole('tab', { name: 'Sleds' })
  await expect(sledsTab).toBeVisible()
  await expect(sledsTab).toHaveClass(/is-selected/)

  const sledsTable = page.getByRole('table')
  await expectRowVisible(sledsTable, {
    id: sleds[0].id,
    'serial number': sleds[0].baseboard.serial,
    policy: 'In serviceProvisionable',
    state: 'active',
  })
  await expectRowVisible(sledsTable, {
    id: sleds[1].id,
    'serial number': sleds[1].baseboard.serial,
    policy: 'In serviceNot provisionable',
    state: 'active',
  })
  await expectRowVisible(sledsTable, {
    id: sleds[2].id,
    'serial number': sleds[2].baseboard.serial,
    policy: 'Expunged',
    state: 'active',
  })
  await expectRowVisible(sledsTable, {
    id: sleds[3].id,
    'serial number': sleds[3].baseboard.serial,
    policy: 'Expunged',
    state: 'decommissioned',
  })

  // Visit the sled detail page of the first sled
  await sledsTable.getByRole('link').first().click()

  await expectVisible(page, ['role=heading[name*="Sled"]'])

  const instancesTab = page.getByRole('tab', { name: 'Instances' })
  await expect(instancesTab).toBeVisible()
  await expect(instancesTab).toHaveClass(/is-selected/)

  const instancesTable = page.getByRole('table')
  await expectRowVisible(instancesTable, {
    name: 'maze-war / mock-projectdb1',
  })
})

test('Disk inventory page', async ({ page }) => {
  await page.goto('/system/inventory/disks')

  await expectVisible(page, ['role=heading[name*="Inventory"]'])

  const disksTab = page.getByRole('tab', { name: 'Disks' })
  await expect(disksTab).toBeVisible()
  await expect(disksTab).toHaveClass(/is-selected/)

  const table = page.getByRole('table')
  await expectRowVisible(table, { id: physicalDisks[0].id, 'Form factor': 'U.2' })
  await expectRowVisible(table, {
    id: physicalDisks[3].id,
    'Form factor': 'M.2',
    policy: 'in service',
    state: 'active',
  })
  await expectRowVisible(table, {
    id: physicalDisks[4].id,
    'Form factor': 'M.2',
    policy: 'expunged',
    state: 'active',
  })
  await expectRowVisible(table, {
    id: physicalDisks[5].id,
    'Form factor': 'M.2',
    policy: 'expunged',
    state: 'decommissioned',
  })
})
