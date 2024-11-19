/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  clickRowAction,
  expect,
  expectRowVisible,
  openRowActions,
  test,
  type Page,
} from './utils'

const expectInstanceState = async (page: Page, instance: string, state: string) => {
  await expectRowVisible(page.getByRole('table'), {
    name: instance,
    state: expect.stringContaining(state),
  })
}

test('can delete a failed instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')

  await expect(page).toHaveTitle('Instances / mock-project / Projects / Oxide Console')

  const cell = page.getByRole('cell', { name: 'you-fail' })
  await expect(cell).toBeVisible() // just to match hidden check at the end
  expectInstanceState(page, 'you-fail', 'failed')

  await clickRowAction(page, 'you-fail', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(cell).toBeHidden() // bye
})

test('can start a failed instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')

  // check the start button disabled message on a running instance
  await openRowActions(page, 'db1')
  await page.getByRole('menuitem', { name: 'Start' }).hover()
  await expect(
    page.getByText('Only stopped or failed instances can be started')
  ).toBeVisible()
  await page.keyboard.press('Escape') // get out of the menu

  // now start the failed one
  await expectInstanceState(page, 'you-fail', 'failed')
  await clickRowAction(page, 'you-fail', 'Start')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectInstanceState(page, 'you-fail', 'starting')
})

test('can stop a failed instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await expect(page).toHaveTitle('Instances / mock-project / Projects / Oxide Console')
  await expectInstanceState(page, 'you-fail', 'failed')
  await clickRowAction(page, 'you-fail', 'Stop')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectInstanceState(page, 'you-fail', 'stopping')
  await expectInstanceState(page, 'you-fail', 'stopped')
})

test('can stop and delete a running instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')

  await expectInstanceState(page, 'db1', 'running')
  const row = page.getByRole('row', { name: 'db1', exact: false })

  // can't delete, can stop
  await row.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeDisabled()
  await page.getByRole('menuitem', { name: 'Stop' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()

  // polling makes it go stopping and then stopped
  await expectInstanceState(page, 'db1', 'stopping')
  await expectInstanceState(page, 'db1', 'stopped')

  // now delete
  await clickRowAction(page, 'db1', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(row).toBeHidden() // bye
})

test('can stop a starting instance, then start it again', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await expect(page).toHaveTitle('Instances / mock-project / Projects / Oxide Console')

  await expectInstanceState(page, 'not-there-yet', 'starting')
  await clickRowAction(page, 'not-there-yet', 'Stop')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectInstanceState(page, 'not-there-yet', 'stopping')
  await expectInstanceState(page, 'not-there-yet', 'stopped')

  await clickRowAction(page, 'not-there-yet', 'Start')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectInstanceState(page, 'not-there-yet', 'starting')
  await expectInstanceState(page, 'not-there-yet', 'running')
})

test('can reboot a running instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await expect(page).toHaveTitle('Instances / mock-project / Projects / Oxide Console')

  await expectInstanceState(page, 'db1', 'running')
  await clickRowAction(page, 'db1', 'Reboot')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectInstanceState(page, 'db1', 'rebooting')
  await expectInstanceState(page, 'db1', 'running')
})

test('cannot reboot a failed instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await expectInstanceState(page, 'you-fail', 'failed')
  await openRowActions(page, 'you-fail')
  await expect(page.getByRole('menuitem', { name: 'Reboot' })).toBeDisabled()
})

test('cannot reboot a starting instance, or a stopped instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await expectInstanceState(page, 'not-there-yet', 'starting')
  await openRowActions(page, 'not-there-yet')
  await expect(page.getByRole('menuitem', { name: 'Reboot' })).toBeDisabled()
  // hit escape to close the menu so clickRowAction succeeds
  await page.keyboard.press('Escape')

  // stop it so we can try rebooting a stopped instance
  await clickRowAction(page, 'not-there-yet', 'Stop')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectInstanceState(page, 'not-there-yet', 'stopping')
  await expectInstanceState(page, 'not-there-yet', 'stopped')
  // reboot is still disabled for a stopped instance
  await openRowActions(page, 'not-there-yet')
  await expect(page.getByRole('menuitem', { name: 'Reboot' })).toBeDisabled()
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
