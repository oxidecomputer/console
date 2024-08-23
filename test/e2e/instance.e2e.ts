/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { clickRowAction, expect, expectRowVisible, test } from './utils'

test('can delete a failed instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')

  await expect(page).toHaveTitle('Instances / mock-project / Oxide Console')

  const row = page.getByRole('row', { name: 'you-fail', exact: false })
  await expect(row).toBeVisible()
  await expect(row.getByRole('cell', { name: /failed/ })).toBeVisible()

  await row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(row).toBeHidden() // bye
})

test('can stop and delete a running instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')

  const table = page.getByRole('table')
  await expectRowVisible(table, {
    name: 'db1',
    status: expect.stringContaining('running'),
  })
  const row = page.getByRole('row', { name: 'db1', exact: false })

  // can't delete, can stop
  await row.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeDisabled()
  await page.getByRole('menuitem', { name: 'Stop' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()

  // polling makes it go stopping and then stopped
  await expectRowVisible(table, {
    name: 'db1',
    status: expect.stringContaining('stopping'),
  })
  await expectRowVisible(table, {
    name: 'db1',
    status: expect.stringContaining('stopped'),
  })

  // now delete
  await clickRowAction(page, 'db1', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(row).toBeHidden() // bye
})

test('can stop a starting instance, then start it again', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')

  const table = page.getByRole('table')
  await expectRowVisible(table, {
    name: 'not-there-yet',
    status: expect.stringContaining('starting'),
  })

  await clickRowAction(page, 'not-there-yet', 'Stop')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expectRowVisible(table, {
    name: 'not-there-yet',
    status: expect.stringContaining('stopping'),
  })
  await expectRowVisible(table, {
    name: 'not-there-yet',
    status: expect.stringContaining('stopped'),
  })

  await clickRowAction(page, 'not-there-yet', 'Stop')
  await expectRowVisible(table, {
    name: 'not-there-yet',
    status: expect.stringContaining('starting'),
  })
  await expectRowVisible(table, {
    name: 'not-there-yet',
    status: expect.stringContaining('running'),
  })
})

test('delete from instance detail', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/you-fail')

  await page.getByRole('button', { name: 'Instance actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(page).toHaveURL('/projects/mock-project/instances')
  await expect(page.getByRole('cell', { name: 'db1' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'you-fail' })).toBeHidden()
})

test('instance table', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')

  const table = page.getByRole('table')
  await expectRowVisible(table, {
    name: 'db1',
    CPU: '2 vCPU',
    Memory: '4 GiB',
    status: expect.stringMatching(/^running\d+s$/),
  })
  await expectRowVisible(table, {
    name: 'you-fail',
    CPU: '4 vCPU',
    Memory: '6 GiB',
    status: expect.stringMatching(/^failed\d+s$/),
  })
  await expectRowVisible(table, {
    name: 'not-there-yet',
    CPU: '2 vCPU',
    Memory: '8 GiB',
    status: expect.stringMatching(/^starting\d+s$/),
  })
})
