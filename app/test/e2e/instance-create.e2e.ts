/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { images } from '@oxide/api-mocks'

import { expect, expectNotVisible, expectRowVisible, expectVisible, test } from './utils'

test('can create an instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await page.locator('text="New Instance"').click()

  await expectVisible(page, [
    'role=heading[name*="Create instance"]',
    'role=heading[name="Hardware"]',
    'role=heading[name="Boot disk"]',
    'role=heading[name="Additional disks"]',
    'role=heading[name="Networking"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=textbox[name="Disk name"]',
    'role=textbox[name="Disk size (GiB)"]',
    'role=button[name="Create instance"]',
  ])

  const instanceName = 'my-instance'
  await page.fill('input[name=name]', instanceName)
  await page.fill('textarea[name=description]', 'An instance... from space!')
  await page.locator('.ox-radio-card').nth(3).click()

  await page.getByRole('textbox', { name: 'Disk name' }).fill('my-boot-disk')
  const diskSizeInput = page.getByRole('textbox', { name: 'Disk size (GiB)' })
  await diskSizeInput.fill('20')

  // pick a project image just to show we can
  await page.getByRole('tab', { name: 'Project images' }).click()
  await page.getByRole('button', { name: 'Image' }).click()
  await page.getByRole('option', { name: images[2].name }).click()

  // should be hidden in accordion
  await expectNotVisible(page, [
    'role=radiogroup[name="Network interface"]',
    'role=textbox[name="Hostname"]',
    'text="User Data"',
  ])

  // open networking and config accordions
  await page.getByRole('button', { name: 'Networking' }).click()
  await page.getByRole('button', { name: 'Configuration' }).click()

  // should be visible in accordion
  await expectVisible(page, [
    'role=radiogroup[name="Network interface"]',
    'role=textbox[name="Hostname"]',
    'text="User Data"',
  ])

  await page.getByRole('button', { name: 'Create instance' }).click()

  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)

  await expectVisible(page, [
    `h1:has-text("${instanceName}")`,
    'text=16 vCPUs',
    'text=64 GiB',
    'text=from space',
  ])

  // network tab works
  await page.getByRole('tab', { name: 'Network Interfaces' }).click()
  const table = page.getByRole('table')
  await expectRowVisible(table, { name: 'default', vpc: 'mock-vpc', subnet: 'mock-subnet' })
})

test('duplicate instance name produces visible error', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')
  await page.fill('input[name=name]', 'db1')
  await page.locator('button:has-text("Create instance")').click()
  await expect(page.getByText('Instance name already exists')).toBeVisible()
})

test('first preset is auto-selected in each tab', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  await expect(page.getByRole('radio', { name: '2 CPU 8 gibibytes RAM' })).toBeChecked()
  await page.getByRole('tab', { name: 'High CPU' }).click()
  await expect(page.getByRole('radio', { name: '2 CPU 4 gibibytes RAM' })).toBeChecked()
  await page.getByRole('tab', { name: 'High Memory' }).click()
  await expect(page.getByRole('radio', { name: '2 CPU 16 gibibytes RAM' })).toBeChecked()
  await page.getByRole('tab', { name: 'General Purpose' }).click()
  await expect(page.getByRole('radio', { name: '2 CPU 8 gibibytes RAM' })).toBeChecked()
})

test('can create an instance with custom hardware', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  const instanceName = 'my-custom-instance'
  await page.fill('input[name=name]', instanceName)
  await page.fill('textarea[name=description]', 'An instance... from space!')

  // Click the other tabs to make sure the custom input works
  // even when something has been previously selected
  await page.getByRole('tab', { name: 'High CPU' }).click()
  await page.getByRole('tab', { name: 'High Memory' }).click()
  await page.getByText('64 GiB RAM').click()

  // Fill in custom specs
  await page.getByRole('tab', { name: 'Custom' }).click()
  await page.getByRole('textbox', { name: 'cpus' }).fill('29')
  await page.getByRole('textbox', { name: 'memory' }).fill('53')

  await page.getByRole('textbox', { name: 'Disk name' }).fill('my-boot-disk')
  const diskSizeInput = page.getByRole('textbox', { name: 'Disk size (GiB)' })
  await diskSizeInput.fill('20')

  // pick a project image just to show we can
  await page.getByRole('tab', { name: 'Project images' }).click()
  await page.getByRole('button', { name: 'Image' }).click()
  await page.getByRole('option', { name: images[2].name }).click()

  // test disk size validation against image size
  await diskSizeInput.fill('5')

  const submitButton = page.getByRole('button', { name: 'Create instance' })
  await submitButton.click() // submit to trigger validation

  await expectVisible(page, [
    'main >> text=Must be as large as selected image (min. 6 GiB)',
  ])
  await diskSizeInput.fill('10')

  await submitButton.click()

  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)

  await expectVisible(page, [
    `h1:has-text("${instanceName}")`,
    'text=29 vCPUs',
    'text=53 GiB',
    'text=from space',
  ])
})

test('automatically updates disk size when larger image selected', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  const instanceName = 'my-new-instance'
  await page.fill('input[name=name]', instanceName)

  // set the disk size larger than it needs to be, to verify it doesn't get reduced
  const diskSizeInput = page.getByRole('textbox', { name: 'Disk size (GiB)' })
  await diskSizeInput.fill('5')

  // pick a disk image that's smaller than 5GiB (the first project image works [4GiB])
  await page.getByRole('tab', { name: 'Project images' }).click()
  await page.getByRole('button', { name: 'Image' }).click()
  await page.getByRole('option', { name: images[0].name }).click()

  // test that it still says 5, as that's larger than the given image
  await expect(diskSizeInput).toHaveValue('5')

  // pick a disk image that's larger than 5GiB (the third project image works [6GiB])
  await page.getByRole('button', { name: 'Image' }).click()
  await page.getByRole('option', { name: images[2].name }).click()

  // test that it has been automatically increased to next-largest incremement of 10
  await expect(diskSizeInput).toHaveValue('10')

  // pick another image, just to verify that the diskSizeInput stays as it was
  await page.getByRole('button', { name: 'Image' }).click()
  await page.getByRole('option', { name: images[1].name }).click()
  await expect(diskSizeInput).toHaveValue('10')

  const submitButton = page.getByRole('button', { name: 'Create instance' })
  await submitButton.click()

  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)
  await expectVisible(page, [`h1:has-text("${instanceName}")`, 'text=10 GiB'])
})

test('with disk name already taken', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')
  await page.fill('input[name=name]', 'my-instance')
  await page.fill('input[name=bootDiskName]', 'disk-1')

  await page.getByRole('button', { name: 'Create instance' }).click()
  await expectVisible(page, ['text=Disk name already exists'])
})
