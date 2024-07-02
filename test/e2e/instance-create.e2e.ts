/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { floatingIp, images } from '@oxide/api-mocks'

import {
  expect,
  expectNotVisible,
  expectRowVisible,
  expectVisible,
  test,
  type Page,
} from './utils'

const selectASiloImage = async (page: Page, name: string) => {
  await page.getByRole('tab', { name: 'Silo images' }).click()
  await page.getByRole('button', { name: 'Select an image' }).click()
  await page.getByRole('option', { name }).click()
}

const selectAProjectImage = async (page: Page, name: string) => {
  await page.getByRole('tab', { name: 'Project images' }).click()
  await page.getByRole('button', { name: 'Select an image' }).click()
  await page.getByRole('option', { name }).click()
}

const selectAnExistingDisk = async (page: Page, name: string) => {
  await page.getByRole('tab', { name: 'Existing disks' }).click()
  await page.getByRole('button', { name: 'Select a disk' }).click()
  await page.getByRole('option', { name }).click()
}

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
  await selectAProjectImage(page, 'image-3')

  // should be hidden in accordion
  await expectNotVisible(page, [
    'role=radiogroup[name="Network interface"]',
    'role=textbox[name="Hostname"]',
    'text="User Data"',
  ])

  // open networking and config accordions
  await page.getByRole('button', { name: 'Networking' }).click()
  await page.getByRole('button', { name: 'Configuration' }).click()

  const assignEphemeralIpCheckbox = page.getByRole('checkbox', {
    name: 'Allocate and attach an ephemeral IP address',
  })
  const assignEphemeralIpButton = page.getByRole('button', {
    name: 'IP pool for ephemeral IP',
  })

  // verify that the ip pool selector is visible and default is selected
  await expect(assignEphemeralIpCheckbox).toBeChecked()
  await assignEphemeralIpButton.click()
  await expect(page.getByRole('option', { name: 'ip-pool-1' })).toBeEnabled()
  await assignEphemeralIpButton.click() // click closes the listbox so we can do more stuff

  // unchecking the box should disable the selector
  await assignEphemeralIpCheckbox.uncheck()
  await expect(assignEphemeralIpButton).toBeHidden()

  // re-checking the box should re-enable the selector, and other options should be selectable
  await assignEphemeralIpCheckbox.check()
  await assignEphemeralIpButton.click()
  await page.getByRole('option', { name: 'ip-pool-2' }).click()

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
  await page.getByRole('tab', { name: 'Networking' }).click()
  const table = page.getByRole('table', { name: 'Network interfaces' })
  await expectRowVisible(table, {
    name: 'defaultprimary',
    vpc: 'mock-vpc',
    subnet: 'mock-subnet',
  })
})

test('duplicate instance name produces visible error', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')
  await page.fill('input[name=name]', 'db1')
  await selectAProjectImage(page, 'image-1')
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
  await page.getByRole('textbox', { name: 'CPUs' }).fill('29')
  await page.getByRole('textbox', { name: 'Memory (GiB)' }).fill('53')

  await page.getByRole('textbox', { name: 'Disk name' }).fill('my-boot-disk')
  const diskSizeInput = page.getByRole('textbox', { name: 'Disk size (GiB)' })
  await diskSizeInput.fill('20')
  await page.keyboard.press('Tab')

  // pick a project image just to show we can
  await selectAProjectImage(page, 'image-3')
  // the disk size should bot have been changed from what was entered earlier
  await expect(diskSizeInput).toHaveValue('20')

  // test disk size validation against image size
  // the minimum on the number input will be the size of the image (6GiB),
  // so manually entering a number less than that will be corrected
  await diskSizeInput.fill('5')
  await page.keyboard.press('Tab')
  await expect(diskSizeInput).toHaveValue('6')

  const submitButton = page.getByRole('button', { name: 'Create instance' })
  await submitButton.click() // submit to trigger validation

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
  await page.keyboard.press('Tab')

  // pick a disk image that's smaller than 5GiB (the first project image works [4GiB])
  await selectAProjectImage(page, 'image-1')

  // test that it still says 5, as that's larger than the given image
  await expect(diskSizeInput).toHaveValue('5')

  // pick a disk image that's larger than 5GiB (the third project image works [6GiB])
  await selectAProjectImage(page, 'image-3')

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
  await selectAProjectImage(page, 'image-1')
  await page.fill('input[name=bootDiskName]', 'disk-1')

  await page.getByRole('button', { name: 'Create instance' }).click()
  await expectVisible(page, ['text=Disk name already exists'])
})

test('add ssh key from instance create form', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  await expect(page.getByRole('checkbox', { name: 'm1-macbook-pro' })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'mac-mini' })).toBeChecked()

  const newKey = 'new-key'
  const newCheckbox = page.getByRole('checkbox', { name: newKey })
  await expect(newCheckbox).toBeHidden()

  // open model, fill form, and submit
  const dialog = page.getByRole('dialog')
  await page.getByRole('button', { name: 'Add SSH Key' }).click()
  await dialog.getByRole('textbox', { name: 'Name' }).fill(newKey)
  await dialog.getByRole('textbox', { name: 'Description' }).fill('hi')
  await dialog.getByRole('textbox', { name: 'Public key' }).fill('some stuff, whatever')
  await dialog.getByRole('button', { name: 'Add SSH Key' }).click()

  await expect(newCheckbox).toBeVisible()
  await expect(newCheckbox).not.toBeChecked()

  // pop over to the real SSH keys page and see it there, why not
  await page.getByLabel('User menu').click()
  await page.getByRole('menuitem', { name: 'Settings' }).click()
  await page.getByRole('link', { name: 'SSH Keys' }).click()
  await expectRowVisible(page.getByRole('table'), { name: newKey, description: 'hi' })
})

test('shows object not found error on no default pool', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('no-default-pool')
  await selectAProjectImage(page, 'image-1')
  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page.getByText('Not found: default IP pool for current silo')).toBeVisible()
})

test('create instance with existing disk', async ({ page }) => {
  const instanceName = 'my-existing-disk-instance'
  await page.goto('/projects/mock-project/instances-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectAnExistingDisk(page, 'disk-3')
  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)
  await expectVisible(page, [`h1:has-text("${instanceName}")`, 'text=8 GiB'])
  await expectRowVisible(page.getByRole('table'), { Disk: 'disk-3' })
})

test('create instance with a silo image', async ({ page }) => {
  const instanceName = 'my-existing-disk-2'
  await page.goto('/projects/mock-project/instances-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectASiloImage(page, 'ubuntu-22-04')
  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)
  await expectVisible(page, [`h1:has-text("${instanceName}")`, 'text=10 GiB'])
})

test('start with an existing disk, but then switch to a silo image', async ({ page }) => {
  const instanceName = 'silo-image-instance'
  await page.goto('/projects/mock-project/instances-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectAnExistingDisk(page, 'disk-7')
  await selectASiloImage(page, 'ubuntu-22-04')
  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)
  await expectVisible(page, [`h1:has-text("${instanceName}")`, 'text=8 GiB'])
  await expectNotVisible(page, ['text=disk-7'])
})

test('additional disks do not list committed disks as available', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  const attachExistingDiskButton = page.getByRole('button', {
    name: 'Attach existing disk',
  })
  const selectADisk = page.getByPlaceholder('Select a disk')
  const disk2 = page.getByRole('option', { name: 'disk-2' })
  const disk3 = page.getByRole('option', { name: 'disk-3' })
  const disk4 = page.getByRole('option', { name: 'disk-4' })

  await attachExistingDiskButton.click()
  await selectADisk.click()
  // disk-2 is already attached, so should not be visible in the list
  await expect(disk2).toBeHidden()
  // disk-3, though, should be present
  await expect(disk3).toBeVisible()
  await expect(disk4).toBeVisible()

  // select disk-3 and "attach" it to the instance that will be created
  await disk3.click()
  await page.getByRole('button', { name: 'Attach disk' }).click()

  await attachExistingDiskButton.click()
  await selectADisk.click()
  // disk-2 should still be hidden
  await expect(disk2).toBeHidden()
  // now disk-3 should be hidden as well
  await expect(disk3).toBeHidden()
  await expect(disk4).toBeVisible()
})

test('maintains selected values even when changing tabs', async ({ page }) => {
  const instanceName = 'arch-based-instance'
  await page.goto('/projects/mock-project/instances-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await page.getByRole('button', { name: 'Image' }).click()
  // select the arch option
  await page.getByRole('option', { name: 'arch-2022-06-01' }).click()
  // expect to find name of the image on page
  await expect(page.getByText('arch-2022-06-01')).toBeVisible()
  // change to a different tab
  await page.getByRole('tab', { name: 'Existing disks' }).click()
  // the image should no longer be visible
  await expect(page.getByText('arch-2022-06-01')).toBeHidden()
  // change back to the tab with the image
  await page.getByRole('tab', { name: 'Silo images' }).click()
  // arch should still be selected
  await expect(page.getByText('arch-2022-06-01')).toBeVisible()
  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)
  await expectVisible(page, [`h1:has-text("${instanceName}")`, 'text=8 GiB'])
  // when a disk name isn’t assigned, the generated one uses the ID of the image,
  // so this checks to make sure that the arch-based image — with ID `bd6aa051…` — was used
  await expectVisible(page, [`text=${instanceName}-bd6aa051`])
})

test('does not attach an ephemeral IP when the checkbox is unchecked', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('no-ephemeral-ip')
  await selectAProjectImage(page, 'image-1')
  await page.getByRole('button', { name: 'Networking' }).click()
  await page
    .getByRole('checkbox', { name: 'Allocate and attach an ephemeral IP address' })
    .uncheck()
  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL('/projects/mock-project/instances/no-ephemeral-ip/storage')
  await expect(page.getByText('External IPs—')).toBeVisible()
})

test('attaches a floating IP; disables button when no IPs available', async ({ page }) => {
  const attachFloatingIpButton = page.getByRole('button', { name: 'Attach floating IP' })
  const selectFloatingIpButton = page.getByRole('button', { name: 'Select a floating ip' })
  const rootbeerFloatOption = page.getByRole('option', { name: 'rootbeer-float' })
  const attachButton = page.getByRole('button', { name: 'Attach', exact: true })

  const instanceName = 'with-floating-ip'
  await page.goto('/projects/mock-project/instances-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectAProjectImage(page, 'image-1')
  await page.getByRole('button', { name: 'Networking' }).click()

  await attachFloatingIpButton.click()
  await expect(
    page.getByText('This instance will be reachable at the selected IP')
  ).toBeVisible()
  await selectFloatingIpButton.click()
  await rootbeerFloatOption.click()
  await expect(
    page.getByText('This instance will be reachable at 123.4.56.4')
  ).toBeVisible()
  await attachButton.click()
  await expect(page.getByText('This instance will be reachable at')).toBeHidden()
  await expectRowVisible(page.getByRole('table'), {
    Name: floatingIp.name,
    IP: floatingIp.ip,
  })
  await expect(attachFloatingIpButton).toBeDisabled()

  // removing the floating IP row should work, and should re-enable the "attach" button
  await page.getByRole('button', { name: 'remove floating IP rootbeer-float' }).click()
  await expect(page.getByText(floatingIp.name)).toBeHidden()
  await expect(attachFloatingIpButton).toBeEnabled()

  // re-attach the floating IP
  await attachFloatingIpButton.click()
  await selectFloatingIpButton.click()
  await rootbeerFloatOption.click()
  await attachButton.click()

  await page.getByRole('button', { name: 'Create instance' }).click()

  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)
  await expectVisible(page, [`h1:has-text("${instanceName}")`])
  await page.getByRole('tab', { name: 'Networking' }).click()

  // ensure External IPs table has rows for the Ephemeral IP and the Floating IP
  await expectRowVisible(page.getByRole('table'), {
    ip: '123.4.56.0',
    Kind: 'ephemeral',
    name: '—',
  })
  await expectRowVisible(page.getByRole('table'), {
    ip: floatingIp.ip,
    Kind: 'floating',
    name: floatingIp.name,
  })
})

test('attach a floating IP section has Empty version when no floating IPs exist on the project', async ({
  page,
}) => {
  await page.goto('/projects/other-project/instances-new')
  await page.getByRole('button', { name: 'Networking' }).click()
  await expect(page.getByRole('button', { name: 'Attach floating IP' })).toBeHidden()
  await expect(
    page.getByText('Create a floating IP to attach it to this instance')
  ).toBeVisible()
})

test('attaching additional disks allows for combobox filtering', async ({ page }) => {
  await page.goto('/projects/other-project/instances-new')

  const attachExistingDiskButton = page.getByRole('button', {
    name: 'Attach existing disk',
  })
  const selectADisk = page.getByPlaceholder('Select a disk')

  await attachExistingDiskButton.click()
  await selectADisk.click()
  // several disks should be shown
  await expect(page.getByRole('option', { name: 'disk-0001' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'disk-0002' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'disk-1000' })).toBeVisible()

  // type in a string to use as a filter
  await selectADisk.fill('disk-010')
  // only disks with that substring should be shown
  await expect(page.getByRole('option', { name: 'disk-0100' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'disk-0101' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'disk-0102' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'disk-0001' })).toBeHidden()
  await expect(page.getByRole('option', { name: 'disk-1000' })).toBeHidden()

  // select one
  await page.getByRole('option', { name: 'disk-0102' }).click()

  // now options hidden and only the selected one is visible in the button/input
  await expect(page.getByRole('option')).toBeHidden()
  await expect(page.getByRole('button', { name: 'disk-0102' })).toBeVisible()

  // a random string should give a disabled option
  await selectADisk.click()
  await selectADisk.fill('asdf')
  await expect(page.getByRole('option', { name: 'No items match' })).toBeVisible()
})
