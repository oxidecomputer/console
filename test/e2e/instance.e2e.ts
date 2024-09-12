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

  const cell = page.getByRole('cell', { name: 'you-fail' })
  await expect(cell).toBeVisible() // just to match hidden check at the end

  const table = page.getByRole('table')
  await expectRowVisible(table, {
    name: 'you-fail',
    state: expect.stringContaining('failed'),
  })

  await clickRowAction(page, 'you-fail', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(cell).toBeHidden() // bye
})

test('can start a failed instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')

  // check the start button disabled message on a running instance
  await page
    .getByRole('row', { name: 'db1', exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Start' }).hover()
  await expect(
    page.getByText('Only stopped or failed instances can be started')
  ).toBeVisible()
  await page.keyboard.press('Escape') // get out of the menu

  // now start the failed one
  const table = page.getByRole('table')
  await expectRowVisible(table, {
    name: 'you-fail',
    state: expect.stringContaining('failed'),
  })

  await clickRowAction(page, 'you-fail', 'Start')

  await expectRowVisible(table, {
    name: 'you-fail',
    state: expect.stringContaining('starting'),
  })
})

test('can stop and delete a running instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')

  const table = page.getByRole('table')
  await expectRowVisible(table, {
    name: 'db1',
    state: expect.stringContaining('running'),
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
    state: expect.stringContaining('stopping'),
  })
  await expectRowVisible(table, {
    name: 'db1',
    state: expect.stringContaining('stopped'),
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
    state: expect.stringContaining('starting'),
  })

  await clickRowAction(page, 'not-there-yet', 'Stop')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expectRowVisible(table, {
    name: 'not-there-yet',
    state: expect.stringContaining('stopping'),
  })
  await expectRowVisible(table, {
    name: 'not-there-yet',
    state: expect.stringContaining('stopped'),
  })

  await clickRowAction(page, 'not-there-yet', 'Start')
  await expectRowVisible(table, {
    name: 'not-there-yet',
    state: expect.stringContaining('starting'),
  })
  await expectRowVisible(table, {
    name: 'not-there-yet',
    state: expect.stringContaining('running'),
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
    state: expect.stringMatching(/^running\d+s$/),
  })
  await expectRowVisible(table, {
    name: 'you-fail',
    CPU: '4 vCPU',
    Memory: '6 GiB',
    state: expect.stringMatching(/^failed\d+s$/),
  })
  await expectRowVisible(table, {
    name: 'not-there-yet',
    CPU: '2 vCPU',
    Memory: '8 GiB',
    state: expect.stringMatching(/^starting\d+s$/),
  })
})
