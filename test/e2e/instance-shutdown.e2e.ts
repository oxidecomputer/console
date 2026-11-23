/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  clickRowActions,
  expect,
  expectRowVisible,
  expectToast,
  fillNumberInput,
  test,
  type Page,
} from './utils'

const shutdownCard = (page: Page) => page.getByRole('form', { name: 'Shutdown' })

async function selectShutdownMethod(page: Page, method: string) {
  await shutdownCard(page).getByRole('button', { name: 'Shutdown method' }).click()
  await page.getByRole('option', { name: method }).click()
}

const expectInstanceState = async (page: Page, instance: string, state: string) => {
  await expectRowVisible(page.getByRole('table'), {
    name: instance,
    state: expect.stringMatching(new RegExp(`^${state}\\d+s$`)),
  })
}

test('set and clear a power button shutdown policy', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/settings')

  const card = shutdownCard(page)
  const save = card.getByRole('button', { name: 'Save' })
  const method = card.getByRole('button', { name: 'Shutdown method' })
  const timeout = card.getByRole('textbox', { name: 'Shutdown timeout' })

  await expect(method).toContainText('Hard power off')
  await expect(timeout).toBeHidden()
  await expect(save).toBeDisabled()

  await selectShutdownMethod(page, 'Power button')
  await expect(timeout).toHaveValue('60')
  await fillNumberInput(timeout, '120')
  await save.click()

  await expectToast(page, 'Instance shutdown policy updated')
  await expect(save).toBeDisabled()

  // remount the card from the refetched instance to show it persisted
  await page.getByRole('tab', { name: 'Storage' }).click()
  await page.getByRole('tab', { name: 'Settings' }).click()
  await expect(method).toContainText('Power button')
  await expect(timeout).toHaveValue('120')

  await selectShutdownMethod(page, 'Hard power off')
  await expect(timeout).toBeHidden()
  await save.click()
  await expectToast(page, 'Instance shutdown policy updated')
  await expect(method).toContainText('Hard power off')
})

test('shutdown timeout is bounded', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/settings')
  await selectShutdownMethod(page, 'Power button')

  const card = shutdownCard(page)
  const timeout = card.getByRole('textbox', { name: 'Shutdown timeout' })
  const save = card.getByRole('button', { name: 'Save' })

  await fillNumberInput(timeout, '901')
  await expect(card.getByText('Can be at most 900 seconds')).toBeVisible()
  await expect(save).toBeDisabled()

  await fillNumberInput(timeout, '0')
  await expect(card.getByText('Must be at least 1 seconds')).toBeVisible()
  await expect(save).toBeDisabled()

  await fillNumberInput(timeout, '900')
  await expect(save).toBeEnabled()
})

test('saving auto-restart keeps the shutdown policy', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/settings')
  await selectShutdownMethod(page, 'Power button')
  await fillNumberInput(
    shutdownCard(page).getByRole('textbox', { name: 'Shutdown timeout' }),
    '30'
  )
  await shutdownCard(page).getByRole('button', { name: 'Save' }).click()
  await expectToast(page, 'Instance shutdown policy updated')

  const autoRestart = page.getByRole('form', { name: 'Auto-restart' })
  await autoRestart.getByRole('button', { name: 'Policy' }).click()
  await page.getByRole('option', { name: 'Never' }).click()
  await autoRestart.getByRole('button', { name: 'Save' }).click()
  await expectToast(page, 'Instance auto-restart policy updated')

  await page.getByRole('tab', { name: 'Storage' }).click()
  await page.getByRole('tab', { name: 'Settings' }).click()
  await expect(
    shutdownCard(page).getByRole('button', { name: 'Shutdown method' })
  ).toContainText('Power button')
  await expect(
    shutdownCard(page).getByRole('textbox', { name: 'Shutdown timeout' })
  ).toHaveValue('30')
})

test('resizing keeps the shutdown policy', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db-stopped/settings')
  await selectShutdownMethod(page, 'Power button')
  await fillNumberInput(
    shutdownCard(page).getByRole('textbox', { name: 'Shutdown timeout' }),
    '45'
  )
  await shutdownCard(page).getByRole('button', { name: 'Save' }).click()
  await expectToast(page, 'Instance shutdown policy updated')

  await page.getByRole('button', { name: 'Instance actions' }).click()
  await page.getByRole('menuitem', { name: 'Resize' }).click()
  const resizeModal = page.getByRole('dialog', { name: 'Resize instance' })
  await fillNumberInput(resizeModal.getByRole('textbox', { name: 'vCPUs' }), '6')
  await resizeModal.getByRole('button', { name: 'Resize' }).click()
  await expect(resizeModal).toBeHidden()
  await expect(page.getByText('6 vCPUs')).toBeVisible()

  await page.getByRole('tab', { name: 'Storage' }).click()
  await page.getByRole('tab', { name: 'Settings' }).click()
  await expect(
    shutdownCard(page).getByRole('button', { name: 'Shutdown method' })
  ).toContainText('Power button')
  await expect(
    shutdownCard(page).getByRole('textbox', { name: 'Shutdown timeout' })
  ).toHaveValue('45')
})

test('force stop a power button instance while it is stopping', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await expectInstanceState(page, 'db2', 'running')

  await clickRowActions(page, 'db2')
  await page.getByRole('menuitem', { name: 'Stop', exact: true }).click()
  const modal = page.getByRole('dialog', { name: 'Stop instance' })
  await expect(modal).toContainText('power button signal')
  await expect(modal).toContainText('after 300 seconds')
  await modal.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Stopping instance db2')

  // the power button shutdown leaves the instance stopping for a while, and
  // force stop is still available to cut it short
  await expectInstanceState(page, 'db2', 'stopping')
  await clickRowActions(page, 'db2')
  await page.getByRole('menuitem', { name: 'Force stop' }).click()
  const forceModal = page.getByRole('dialog', { name: 'Force stop instance' })
  await expect(forceModal).toContainText('powered off immediately')
  await forceModal.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Force stopping instance db2')

  // the mock stops a forced instance in 3s, well under the 10s power button
  // delay, so seeing stopped within the default timeout shows force applied
  await expectInstanceState(page, 'db2', 'stopped')
})

test('force reboot a power button instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await expectInstanceState(page, 'db2', 'running')

  await clickRowActions(page, 'db2')
  await page.getByRole('menuitem', { name: 'Force reboot' }).click()
  await page
    .getByRole('dialog', { name: 'Force reboot instance' })
    .getByRole('button', { name: 'Confirm' })
    .click()
  await expectToast(page, 'Force rebooting instance db2')
  await expectInstanceState(page, 'db2', 'rebooting')
  await expectInstanceState(page, 'db2', 'running')
})

test('hard off instances do not offer force actions', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await expectInstanceState(page, 'db1', 'running')

  await clickRowActions(page, 'db1')
  await expect(page.getByRole('menuitem', { name: 'Stop', exact: true })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Force stop' })).toBeHidden()
  await expect(page.getByRole('menuitem', { name: 'Force reboot' })).toBeHidden()
  await page.keyboard.press('Escape')

  // and the stop confirmation doesn't mention the power button
  await clickRowActions(page, 'db1')
  await page.getByRole('menuitem', { name: 'Stop', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Stop instance' })).not.toContainText(
    'power button'
  )
})

test('create an instance with a power button shutdown policy', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  const instanceName = 'graceful-instance'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await page.getByRole('textbox', { name: 'Disk name' }).fill('graceful-boot')
  await page.getByRole('tab', { name: 'Project images' }).click()
  await page.getByPlaceholder('Select a project image', { exact: true }).click()
  await page.getByRole('option', { name: 'image-3' }).click()

  await page.getByRole('button', { name: 'Shutdown method' }).click()
  await page.getByRole('option', { name: 'Power button' }).click()
  await fillNumberInput(page.getByRole('textbox', { name: 'Shutdown timeout' }), '90')

  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)

  await page.getByRole('tab', { name: 'Settings' }).click()
  await expect(
    shutdownCard(page).getByRole('button', { name: 'Shutdown method' })
  ).toContainText('Power button')
  await expect(
    shutdownCard(page).getByRole('textbox', { name: 'Shutdown timeout' })
  ).toHaveValue('90')
})
