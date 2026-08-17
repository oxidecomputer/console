/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import {
  expect,
  expectComboboxOptions,
  expectRowVisible,
  selectOption,
  test,
  type Page,
} from './utils'

async function openAttachDiskModal(page: Page) {
  await page.goto('/projects/mock-project/instances/db-stopped')
  await page.getByRole('button', { name: 'Attach existing disk' }).click()
  return page.getByRole('dialog', { name: 'Attach disk' })
}

test('non-arbitrary combobox submit uses committed selection when edit is uncommitted', async ({
  page,
}) => {
  const dialog = await openAttachDiskModal(page)
  const combobox = dialog.getByRole('combobox', { name: 'Disk name' })

  await combobox.click()
  await page.getByRole('option', { name: 'disk-3' }).click()
  await expect(combobox).toHaveValue('disk-3')

  await combobox.click()
  await combobox.press('End')
  await combobox.pressSequentially('zzz')
  await expect(combobox).toHaveValue('disk-3zzz')

  await dialog.getByRole('button', { name: 'Attach disk' }).click()
  await expect(page.getByRole('cell', { name: 'disk-3' })).toBeVisible()
})

test('non-arbitrary combobox clears committed selection when input is emptied', async ({
  page,
}) => {
  const dialog = await openAttachDiskModal(page)
  const combobox = dialog.getByRole('combobox', { name: 'Disk name' })
  const requiredError = dialog.getByText('Disk name is required')

  await combobox.click()
  await page.getByRole('option', { name: 'disk-3' }).click()
  await expect(combobox).toHaveValue('disk-3')

  await combobox.fill('')
  await expect(combobox).toHaveValue('')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('option')).toBeHidden()

  await expect(requiredError).toBeHidden()
  await dialog.getByRole('button', { name: 'Attach disk' }).click()
  await expect(requiredError).toBeVisible()
})

test('arbitrary-values combobox keeps typed values and resets submitted fields', async ({
  page,
}) => {
  await page.goto('/projects/mock-project/vpcs/default/firewall-rules-new')

  const vpcInput = page.getByRole('combobox', { name: 'VPC name' }).first()
  await vpcInput.focus()
  await expectComboboxOptions(page, ['default'])

  // 'z' matches no VPC, so only the arbitrary-value option shows
  await vpcInput.fill('z')
  await expectComboboxOptions(page, ['Custom: z'])

  await vpcInput.blur()
  await page.getByRole('button', { name: 'Add target' }).click()
  await expect(vpcInput).toHaveValue('')

  await vpcInput.focus()
  await expectComboboxOptions(page, ['default'])

  await selectOption(page, 'Target type', 'Instance')
  const instanceInput = page.getByRole('combobox', { name: 'Instance name' })

  await instanceInput.focus()
  await expectComboboxOptions(page, [
    'db1',
    'you-fail',
    'not-there-yet',
    'instance-update-error',
    'db2',
    'db-stopped',
    'db3',
    'sentinel-metrics-flat',
    'sentinel-metrics-slope',
  ])

  await instanceInput.fill('d')
  await expectComboboxOptions(page, [
    'db1',
    'instance-update-error',
    'db2',
    'db-stopped',
    'db3',
    'Custom: d',
  ])

  await instanceInput.blur()
  await expect(page.getByRole('option')).toBeHidden()

  await expect(instanceInput).toHaveValue('d')
  await instanceInput.focus()

  await expectComboboxOptions(page, [
    'db1',
    'instance-update-error',
    'db2',
    'db-stopped',
    'db3',
    'Custom: d',
  ])

  await selectOption(page, 'Protocol filters', 'ICMPv4')
  await page.getByRole('combobox', { name: 'ICMPv4 type' }).pressSequentially('abc')
  const error = page
    .getByRole('dialog')
    .getByText('ICMP type must be a number between 0 and 255')
  await expect(error).toBeHidden()
  await page.getByRole('button', { name: 'Add protocol filter' }).click()
  await expect(error).toBeVisible()

  await selectOption(page, 'Protocol filters', 'ICMPv6')
  await expect(page.getByRole('combobox', { name: 'ICMPv6 type' })).toHaveValue('')
  await expect(error).toBeHidden()
})

test('combobox Enter selects highlighted item, not raw query', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/default/firewall-rules-new')

  const targets = page.getByRole('table', { name: 'Targets' })
  const vpcInput = page.getByRole('combobox', { name: 'VPC name' }).first()

  // 'def' matches the default VPC as well as producing an arbitrary-value option
  await vpcInput.fill('def')
  await expect(page.getByRole('option', { name: 'default' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'Custom: def' })).toBeVisible()

  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')

  await expect(vpcInput).toHaveValue('default')
  await page.getByRole('button', { name: 'Add target' }).click()
  await expectRowVisible(targets, { Type: 'vpc', Value: 'default' })
})

test("Escape in combobox doesn't close the parent form", async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/default/firewall-rules-new')

  await page.getByRole('textbox', { name: 'Name' }).fill('a')

  const confirmModal = page.getByRole('dialog', { name: 'Confirm navigation' })
  await expect(confirmModal).toBeHidden()
  await page.keyboard.press('Escape')
  await expect(confirmModal).toBeVisible()
  await confirmModal.getByRole('button', { name: 'Keep editing' }).click()
  await expect(confirmModal).toBeHidden()

  const formModal = page.getByRole('dialog', { name: 'Add firewall rule' })
  await expect(formModal).toBeVisible()

  const input = page.getByRole('combobox', { name: 'VPC name' }).first()
  await input.focus()

  await expect(page.getByRole('option').first()).toBeVisible()
  await expectComboboxOptions(page, ['default'])

  await page.keyboard.press('Escape')
  await expect(confirmModal).toBeHidden()
  await expect(page.getByRole('option')).toBeHidden()
  await expect(formModal).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(confirmModal).toBeVisible()
})

test('image combobox preserves selection when editing without committing', async ({
  page,
}) => {
  const instanceName = 'test-instance'

  await page.goto('/projects/mock-project/instances-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)

  const imageCombobox = page.getByRole('combobox', { name: 'Image' })
  await imageCombobox.scrollIntoViewIfNeeded()
  await imageCombobox.click()
  await expect(page.getByRole('option', { name: 'ubuntu-22-04' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'ubuntu-20-04' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'arch-2022-06-01' })).toBeVisible()

  await imageCombobox.fill('ubuntu')
  await expect(page.getByRole('option', { name: 'ubuntu-22-04' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'ubuntu-20-04' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'arch-2022-06-01' })).toBeHidden()

  await page.getByRole('option', { name: 'ubuntu-22-04' }).click()
  await expect(imageCombobox).toHaveValue('ubuntu-22-04')

  await imageCombobox.press('Backspace')
  await imageCombobox.press('Backspace')
  await imageCombobox.press('Backspace')
  await imageCombobox.press('Backspace')
  await expect(imageCombobox).toHaveValue('ubuntu-2')
  await expect(page.getByRole('option', { name: 'ubuntu-22-04' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'ubuntu-20-04' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'arch-2022-06-01' })).toBeHidden()

  await page.getByRole('textbox', { name: 'Name', exact: true }).click()
  await expect(imageCombobox).toHaveValue('ubuntu-22-04')

  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)
})
