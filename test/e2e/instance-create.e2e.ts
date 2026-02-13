/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { floatingIp } from '@oxide/api-mocks'

import {
  closeToast,
  expect,
  expectNotVisible,
  expectRowVisible,
  expectVisible,
  fillNumberInput,
  selectOption,
  test,
  type Page,
} from './utils'

const selectASiloImage = async (page: Page, name: string) => {
  await page.getByRole('tab', { name: 'Silo images' }).click()
  await page.getByPlaceholder('Select a silo image', { exact: true }).click()
  await page.getByRole('option', { name }).click()
}

const selectAProjectImage = async (page: Page, name: string) => {
  await page.getByRole('tab', { name: 'Project images' }).click()
  await page.getByPlaceholder('Select a project image', { exact: true }).click()
  await page.getByRole('option', { name }).click()
}

const selectAnExistingDisk = async (page: Page, name: string) => {
  await page.getByRole('tab', { name: 'Existing disks' }).click()
  await page.getByRole('combobox', { name: 'Disk' }).click()
  await page.getByRole('option', { name }).click()
}

test('can create an instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await page.locator('text="New Instance"').click()

  await expect(page.getByRole('heading', { name: /Create instance/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Hardware' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Boot disk' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Additional disks' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Networking' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Description' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Disk size (GiB)' })).toBeVisible()

  const instanceName = 'my-instance'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await page.fill('textarea[name=description]', 'An instance... from space!')
  await page.locator('.ox-radio-card').nth(3).click()

  await page.getByRole('textbox', { name: 'Disk name' }).fill('my-boot-disk')
  const diskSizeInput = page.getByRole('textbox', { name: 'Disk size (GiB)' })
  await diskSizeInput.fill('20')

  // pick a project image just to show we can
  await selectAProjectImage(page, 'image-3')

  // hostname field should not exist
  await expectNotVisible(page, ['role=textbox[name="Hostname"]'])

  const v4Checkbox = page.getByRole('checkbox', {
    name: 'Allocate and attach an ephemeral IPv4 address',
  })
  const v6Checkbox = page.getByRole('checkbox', {
    name: 'Allocate and attach an ephemeral IPv6 address',
  })

  // verify that the IPv4 ephemeral IP checkbox is checked by default
  await expect(v4Checkbox).toBeChecked()
  await expect(v6Checkbox).toBeChecked()

  // IPv4 default pool should be selected
  const v4PoolDropdown = page.getByLabel('IPv4 pool')
  await expect(v4PoolDropdown).toBeVisible()
  await expect(v4PoolDropdown).toContainText('ip-pool-1')

  // IPv6 default pool should be selected
  const v6PoolDropdown = page.getByLabel('IPv6 pool')
  await expect(v6PoolDropdown).toBeVisible()
  await expect(v6PoolDropdown).toContainText('ip-pool-2')

  await expect(page.getByRole('radiogroup', { name: 'Network interface' })).toBeVisible()
  await expect(page.getByLabel('User data')).toBeVisible()

  await page.getByRole('button', { name: 'Create instance' }).click()

  await closeToast(page)

  // instance goes from creating to starting to running as we poll
  const pollingSpinner = page.getByLabel('Spinner')
  await expect(pollingSpinner).toBeVisible()
  await expect(page.getByText('Creating')).toBeVisible()
  await expect(page.getByText('Starting')).toBeVisible()
  await expect(page.getByText('Running')).toBeVisible()
  await expect(pollingSpinner).toBeHidden()

  // do this after state checks because sometimes it takes too long and we miss 'creating'
  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)

  await expect(page.getByRole('heading', { name: instanceName })).toBeVisible()
  await expect(page.getByText('16 vCPUs')).toBeVisible()
  await expect(page.getByText('64 GiB')).toBeVisible()
  await expect(page.getByText('from space')).toBeVisible()

  // boot disk visible, no other disks attached
  await expect(
    page
      .getByRole('table', { name: 'Boot disk' })
      .getByRole('cell', { name: 'my-boot-disk' })
  ).toBeVisible()
  await expect(page.getByText('No other disk')).toBeVisible()

  // network tab works
  await page.getByRole('tab', { name: 'Networking' }).click()
  const table = page.getByRole('table', { name: 'Network interfaces' })
  await expectRowVisible(table, {
    name: 'defaultprimary',
    vpc: 'mock-vpc',
    subnet: 'mock-subnet',
  })
})

test('ephemeral pool selection tracks network interface IP version', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  const v4Checkbox = page.getByRole('checkbox', {
    name: 'Allocate and attach an ephemeral IPv4 address',
  })
  const v6Checkbox = page.getByRole('checkbox', {
    name: 'Allocate and attach an ephemeral IPv6 address',
  })

  // Default NIC is dual-stack, both checkboxes should be visible, enabled, and checked
  await expect(v4Checkbox).toBeVisible()
  await expect(v4Checkbox).toBeEnabled()
  await expect(v4Checkbox).toBeChecked()
  await expect(v6Checkbox).toBeVisible()
  await expect(v6Checkbox).toBeEnabled()
  await expect(v6Checkbox).toBeChecked()

  // Change to IPv6-only NIC - v4 checkbox should become disabled and unchecked
  await selectOption(page, page.getByRole('button', { name: 'IPv4 & IPv6' }), 'IPv6')
  await expect(v4Checkbox).toBeVisible()
  await expect(v4Checkbox).toBeDisabled()
  await expect(v4Checkbox).not.toBeChecked()
  await expect(v6Checkbox).toBeVisible()
  await expect(v6Checkbox).toBeEnabled()
  await expect(v6Checkbox).toBeChecked()

  // Verify disabled v4 checkbox shows tooltip
  await v4Checkbox.hover()
  await expect(page.getByText('Add an IPv4 network interface')).toBeVisible()
  await expect(page.getByText('to attach an ephemeral IPv4 address')).toBeVisible()

  // Change to IPv4-only NIC - v6 checkbox should become disabled and unchecked
  await selectOption(page, page.getByRole('button', { name: 'IPv6', exact: true }), 'IPv4')
  await expect(v4Checkbox).toBeVisible()
  await expect(v4Checkbox).toBeEnabled()
  await expect(v4Checkbox).toBeChecked()
  await expect(v6Checkbox).toBeVisible()
  await expect(v6Checkbox).toBeDisabled()
  await expect(v6Checkbox).not.toBeChecked()

  // Verify disabled v6 checkbox shows tooltip
  await v6Checkbox.hover()
  await expect(page.getByText('Add an IPv6 network interface')).toBeVisible()
  await expect(page.getByText('to attach an ephemeral IPv6 address')).toBeVisible()
})

test('duplicate instance name produces visible error', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')
  await page.fill('input[name=name]', 'db1')
  await selectAProjectImage(page, 'image-1')
  await page.getByRole('button', { name: 'Create instance' }).click()
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

  await expect(page.getByRole('heading', { name: instanceName })).toBeVisible()
  await expect(page.getByText('29 vCPUs')).toBeVisible()
  await expect(page.getByText('53 GiB')).toBeVisible()
  await expect(page.getByText('from space')).toBeVisible()
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
  await selectAProjectImage(page, 'image-2')
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
  await expect(page.getByText('Name is already in use').first()).toBeVisible()
})

test('can’t create a disk with a name that collides with the boot disk name', async ({
  page,
}) => {
  // Set up the instance and name the boot disk "disk-11"
  await page.goto('/projects/mock-project/instances-new')
  await page.fill('input[name=name]', 'another-instance')
  await selectAProjectImage(page, 'image-1')
  await page.fill('input[name=bootDiskName]', 'disk-11')

  // Attempt to create a disk with the same name
  await expect(page.getByText('No disks')).toBeVisible()
  await page.getByRole('button', { name: 'Create new disk' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('textbox', { name: 'name' }).fill('disk-11')
  await dialog.getByRole('button', { name: 'Create disk' }).click()
  // Expect to see an error message
  await expect(dialog.getByText('Name is already in use')).toBeVisible()
  // Change the disk name to something else
  await dialog.getByRole('textbox', { name: 'name' }).fill('disk-12')
  await dialog.getByRole('button', { name: 'Create disk' }).click()
  // The disk has been "created" (is in the list of Additional Disks)
  await expectVisible(page, ['text=disk-12'])
  await expect(page.getByText('No disks')).toBeHidden()
  // Create the instance
  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL('/projects/mock-project/instances/another-instance/storage')

  // Find the Boot Disk table and verify that disk-11 is there
  const bootDiskTable = page.getByRole('table', { name: 'Boot disk' })
  await expect(bootDiskTable.getByRole('cell', { name: 'disk-11' })).toBeVisible()

  // Find the Other Disks table and verify that disk-12 is there
  const otherDisksTable = page.getByRole('table', { name: 'Additional disks' })
  await expect(otherDisksTable.getByRole('cell', { name: 'disk-12' })).toBeVisible()
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

  const bootDisks = page.getByRole('table', { name: 'Boot disk' })
  await expectRowVisible(bootDisks, { Disk: 'disk-3' })

  await expect(page.getByText('No other disks')).toBeVisible()
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
  const arch = 'arch-2022-06-01'
  await page.goto('/projects/mock-project/instances-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  const imageSelectCombobox = page.getByRole('combobox', { name: 'Image' })
  await imageSelectCombobox.scrollIntoViewIfNeeded()
  // Filter the combobox for a particular silo image
  await imageSelectCombobox.fill('arch')
  // select the image
  await page.getByRole('option', { name: arch }).click()
  // expect to find name of the image on page
  await expect(imageSelectCombobox).toHaveValue(arch)
  // change to a different tab
  await page.getByRole('tab', { name: 'Existing disks' }).click()
  // the image should no longer be visible
  await expect(imageSelectCombobox).toBeHidden()
  // change back to the tab with the image
  await page.getByRole('tab', { name: 'Silo images' }).click()
  // arch should still be selected
  await expect(imageSelectCombobox).toHaveValue(arch)
  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)
  await expectVisible(page, [`h1:has-text("${instanceName}")`, 'text=8 GiB'])
  // when a disk name isn’t assigned, the generated one uses the name of the image,
  // so this checks to make sure that the arch-based image — with name `arch-2022-06-01` — was used
  await expectVisible(page, [`text=${instanceName}-${arch}`])
})

test('does not attach an ephemeral IP when the checkbox is unchecked', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('no-ephemeral-ip')
  await selectAProjectImage(page, 'image-1')

  // Uncheck both ephemeral IP checkboxes
  await page
    .getByRole('checkbox', { name: 'Allocate and attach an ephemeral IPv4 address' })
    .uncheck()
  await page
    .getByRole('checkbox', { name: 'Allocate and attach an ephemeral IPv6 address' })
    .uncheck()

  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL('/projects/mock-project/instances/no-ephemeral-ip/storage')
  await expect(page.getByText('External IPs—')).toBeVisible()
})

test('attaches a floating IP; disables button when no IPs available', async ({ page }) => {
  const attachFloatingIpButton = page.getByRole('button', { name: 'Attach floating IP' })
  const dialog = page.getByRole('dialog')
  const selectFloatingIpButton = dialog.getByRole('button', { name: 'Floating IP' })
  const rootbeerFloatOption = page.getByRole('option', { name: 'rootbeer-float' })
  const attachButton = dialog.getByRole('button', { name: 'Attach', exact: true })

  const instanceName = 'with-floating-ip'
  await page.goto('/projects/mock-project/instances-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectAProjectImage(page, 'image-1')

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

  // The button should still be enabled because there's still ipv6-float available
  await expect(attachFloatingIpButton).toBeEnabled()

  // Attach the IPv6 floating IP too
  await attachFloatingIpButton.click()
  await selectFloatingIpButton.click()
  await page.getByRole('option', { name: 'ipv6-float' }).click()
  await attachButton.click()

  // Now the button should be disabled because both floating IPs are attached
  await expect(attachFloatingIpButton).toBeDisabled()

  // removing one floating IP row should work, and should re-enable the "attach" button
  await page.getByRole('button', { name: 'remove floating IP rootbeer-float' }).click()
  await expect(page.getByText(floatingIp.name)).toBeHidden()
  await expect(attachFloatingIpButton).toBeEnabled()

  // Remove the IPv6 floating IP too
  await page.getByRole('button', { name: 'remove floating IP ipv6-float' }).click()

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
  const ipsTable = page.getByRole('table', { name: 'External IPs' })
  await expectRowVisible(ipsTable, {
    ip: '123.4.56.0',
    Kind: 'ephemeral',
    name: '—',
  })
  await expectRowVisible(ipsTable, {
    ip: floatingIp.ip,
    Kind: 'floating',
    name: floatingIp.name,
  })
})

test('attach a floating IP section has Empty version when no floating IPs exist on the project', async ({
  page,
}) => {
  await page.goto('/projects/other-project/instances-new')

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
  await expect(page.getByRole('option', { name: 'disk-0005' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'disk-0007' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'disk-0988' })).toBeVisible()

  // type in a string to use as a filter
  await selectADisk.fill('disk-02')
  // only disks with that substring should be shown
  await expect(page.getByRole('option', { name: 'disk-0023' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'disk-0125' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'disk-0211' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'disk-0220' })).toBeHidden()
  await expect(page.getByRole('option', { name: 'disk-1000' })).toBeHidden()

  // select one
  await page.getByRole('option', { name: 'disk-0211' }).click()

  // now options hidden and only the selected one is visible in the button/input
  await expect(page.getByRole('option')).toBeHidden()
  await expect(page.getByRole('combobox', { name: 'Disk name' })).toHaveValue('disk-0211')

  // a random string should give a disabled option
  await selectADisk.click()
  await selectADisk.fill('asdf')
  await expect(page.getByRole('option', { name: 'No items match' })).toBeVisible()
})

test('create instance with additional disks', async ({ page }) => {
  const instanceName = 'more-disks'
  await page.goto('/projects/mock-project/instances-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectAProjectImage(page, 'image-1')

  // Create a new disk
  await page.getByRole('button', { name: 'Create new disk' }).click()

  const createForm = page.getByRole('dialog', { name: 'Create disk' })
  await expect(createForm).toBeVisible() // kill time to help size field flake?

  // verify that an existing name can't be used
  await createForm.getByRole('textbox', { name: 'Name', exact: true }).fill('disk-6')

  const sizeField = createForm.getByRole('textbox', { name: 'Size (GiB)' })
  // The size field can be overwritten by late renders in the parent form.
  await fillNumberInput(sizeField, '5')

  await createForm.getByRole('button', { name: 'Create disk' }).click()
  await expect(createForm.getByText('Name is already in use')).toBeVisible()

  // rename the disk to one that's allowed
  await createForm.getByRole('textbox', { name: 'Name', exact: true }).fill('new-disk-1')
  await createForm.getByRole('button', { name: 'Create disk' }).click()

  const disksTable = page.getByRole('table', { name: 'Disks' })
  await expect(disksTable.getByText('disk-6')).toBeHidden()
  await expectRowVisible(disksTable, {
    Name: 'new-disk-1',
    Action: 'create',
    Type: 'distributed',
    Size: '5 GiB',
  })

  // Create a local disk
  await page.getByRole('button', { name: 'Create new disk' }).click()
  await createForm
    .getByRole('textbox', { name: 'Name', exact: true })
    .fill('new-disk-local')
  await createForm.getByRole('textbox', { name: 'Size (GiB)' }).fill('10')
  await createForm.getByRole('radio', { name: 'Local' }).click()
  await createForm.getByRole('button', { name: 'Create disk' }).click()

  await expectRowVisible(disksTable, {
    Name: 'new-disk-local',
    Action: 'create',
    Type: 'local',
    Size: '10 GiB',
  })

  // now that name is taken too, so disk create disallows it
  await page.getByRole('button', { name: 'Create new disk' }).click()
  await createForm.getByRole('textbox', { name: 'Name', exact: true }).fill('new-disk-1')
  await createForm.getByRole('button', { name: 'Create disk' }).click()
  await expect(createForm.getByText('Name is already in use')).toBeVisible()
  await createForm.getByRole('button', { name: 'Cancel' }).click()

  // Attach an existing disk
  await page.getByRole('button', { name: 'Attach existing disk' }).click()
  await selectOption(page, 'Disk name', 'disk-3')
  await page.getByRole('button', { name: 'Attach disk' }).click()

  await expectRowVisible(disksTable, {
    Name: 'disk-3',
    Action: 'attach',
    Type: 'distributed',
    Size: '6 GiB',
  })

  // Create the instance
  await page.getByRole('button', { name: 'Create instance' }).click()

  // Assert we're on the new instance's storage page
  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)

  // Check for the boot disk
  const bootDiskTable = page.getByRole('table', { name: 'Boot disk' })
  // name is generated so it's gnarly
  await expect(bootDiskTable.getByRole('cell', { name: /^more-disks-/ })).toBeVisible()

  // Check for the additional disks
  const otherDisksTable = page.getByRole('table', { name: 'Additional disks' })
  await expectRowVisible(otherDisksTable, { Disk: 'new-disk-1', size: '5 GiB' })
  await expectRowVisible(otherDisksTable, { Disk: 'new-disk-local', size: '10 GiB' })
  await expectRowVisible(otherDisksTable, { Disk: 'disk-3', size: '6 GiB' })
})

test('Validate CPU and RAM', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('db2')
  await selectASiloImage(page, 'ubuntu-22-04')

  await page.getByRole('tab', { name: 'Custom' }).click()

  const cpu = page.getByRole('textbox', { name: 'CPU' })
  await cpu.fill('999')

  // blur CPU
  const memory = page.getByRole('textbox', { name: 'Memory' })
  await memory.click()

  // make sure it's not clamping the value
  await expect(cpu).toHaveValue('999')

  await memory.fill('1537')

  const submitButton = page.getByRole('button', { name: 'Create instance' })

  const cpuMsg = page.getByText('Can be at most 128').first()
  const memMsg = page.getByText('Can be at most 1536 GiB').first()

  await expect(cpuMsg).toBeHidden()
  await expect(memMsg).toBeHidden()

  await submitButton.click()

  await expect(cpuMsg).toBeVisible()
  await expect(memMsg).toBeVisible()
})

test('create instance with IPv6-only networking', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  const instanceName = 'ipv6-only-instance'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectASiloImage(page, 'ubuntu-22-04')

  // Configure networking

  // Ensure "Default" network interface is selected
  const defaultRadio = page.getByRole('radio', { name: 'Default', exact: true })
  if (!(await defaultRadio.isChecked())) {
    await defaultRadio.click()
  }
  // Wait for and select from the IP version dropdown
  const ipVersionButton = page.locator('[name="defaultIpVersion"]')
  await ipVersionButton.waitFor({ state: 'visible' })
  await ipVersionButton.click()
  await page.getByRole('option', { name: 'IPv6', exact: true }).click()

  // Create instance
  await page.getByRole('button', { name: 'Create instance' }).click()

  await expect(page).toHaveURL(/\/instances\/ipv6-only-instance/)

  // Navigate to the Networking tab
  await page.getByRole('tab', { name: 'Networking' }).click()

  // Check that the network interfaces table shows up
  const nicTable = page.getByRole('table', { name: 'Network interfaces' })
  await expect(nicTable).toBeVisible()

  // Verify the Private IP column exists and contains an IPv6 address
  const privateIpCell = nicTable.getByRole('cell').filter({ hasText: /::/ })
  await expect(privateIpCell.first()).toBeVisible()

  // Verify no IPv4 address is shown (no periods in a dotted-decimal format within the Private IP)
  // We check that the cell with IPv6 doesn't also contain IPv4
  const cellText = await privateIpCell.first().textContent()
  expect(cellText).toMatch(/::/)
  expect(cellText).not.toMatch(/\d+\.\d+\.\d+\.\d+/)
})

test('create instance with IPv4-only networking', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  const instanceName = 'ipv4-only-instance'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectASiloImage(page, 'ubuntu-22-04')

  // Configure networking

  // Ensure "Default" network interface is selected
  const defaultRadio = page.getByRole('radio', { name: 'Default', exact: true })
  if (!(await defaultRadio.isChecked())) {
    await defaultRadio.click()
  }
  // Wait for and select from the IP version dropdown
  const ipVersionButton = page.locator('[name="defaultIpVersion"]')
  await ipVersionButton.waitFor({ state: 'visible' })
  await ipVersionButton.click()
  await page.getByRole('option', { name: 'IPv4', exact: true }).click()

  // Create instance
  await page.getByRole('button', { name: 'Create instance' }).click()

  await expect(page).toHaveURL(/\/instances\/ipv4-only-instance/)

  // Navigate to the Networking tab
  await page.getByRole('tab', { name: 'Networking' }).click()

  // Check that the network interfaces table shows up
  const nicTable = page.getByRole('table', { name: 'Network interfaces' })
  await expect(nicTable).toBeVisible()

  // Verify the Private IP column exists and contains an IPv4 address
  const privateIpCell = nicTable.getByRole('cell').filter({ hasText: /127\.0\.0\.1/ })
  await expect(privateIpCell.first()).toBeVisible()

  // Verify no IPv6 address is shown (no colons in IPv6 format within the Private IP)
  const cellText = await privateIpCell.first().textContent()
  expect(cellText).toMatch(/\d+\.\d+\.\d+\.\d+/)
  expect(cellText).not.toMatch(/::/)
})

test('create instance with dual-stack networking shows both IPs', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  const instanceName = 'dual-stack-instance'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectASiloImage(page, 'ubuntu-22-04')

  // Configure networking

  // Default is already "Default IPv4 & IPv6", so no need to select it

  // Create instance
  await page.getByRole('button', { name: 'Create instance' }).click()

  await expect(page).toHaveURL(/\/instances\/dual-stack-instance/)

  // Navigate to the Networking tab
  await page.getByRole('tab', { name: 'Networking' }).click()

  // Check that the network interfaces table shows up
  const nicTable = page.getByRole('table', { name: 'Network interfaces' })
  await expect(nicTable).toBeVisible()

  // Verify both IPv4 and IPv6 addresses are shown
  const privateIpCells = nicTable
    .locator('tbody tr')
    .first()
    .locator('td')
    .filter({ hasText: /127\.0\.0\.1/ })
  await expect(privateIpCells.first()).toBeVisible()

  // Check that the same cell contains IPv6
  const cellText = await privateIpCells.first().textContent()
  expect(cellText).toMatch(/127\.0\.0\.1/) // IPv4
  expect(cellText).toMatch(/::1/) // IPv6
})

test('create instance with custom IPv4-only NIC constrains ephemeral IP to IPv4', async ({
  page,
}) => {
  await page.goto('/projects/mock-project/instances-new')

  const instanceName = 'custom-ipv4-nic-test'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectASiloImage(page, 'ubuntu-22-04')

  // Configure networking

  // Select "Custom" network interface (use exact match and first to disambiguate from "custom pool")
  await page.getByRole('radio', { name: 'Custom', exact: true }).first().click()

  // Add a custom NIC with IPv4-only configuration
  await page.getByRole('button', { name: 'Add network interface' }).click()

  const modal = page.getByRole('dialog', { name: 'Add network interface' })
  await expect(modal).toBeVisible()

  await modal.getByRole('textbox', { name: 'Name' }).fill('my-ipv4-nic')
  await modal.getByLabel('VPC', { exact: true }).click()
  await page.getByRole('option', { name: 'mock-vpc' }).click()
  await modal.getByLabel('Subnet').click()
  await page.getByRole('option', { name: 'mock-subnet', exact: true }).click()

  // Select IPv4-only IP configuration
  await modal.getByRole('radio', { name: 'IPv4', exact: true }).click()

  await modal.getByRole('button', { name: 'Add network interface' }).click()
  await expect(modal).toBeHidden()

  // Verify the NIC was added
  const nicTable = page.getByRole('table', { name: 'Network Interfaces' })
  await expect(
    nicTable.getByRole('cell', { name: 'my-ipv4-nic', exact: true })
  ).toBeVisible()

  // Verify that only IPv4 ephemeral IP is enabled
  const v4Checkbox = page.getByRole('checkbox', {
    name: 'Allocate and attach an ephemeral IPv4 address',
  })
  const v6Checkbox = page.getByRole('checkbox', {
    name: 'Allocate and attach an ephemeral IPv6 address',
  })

  await expect(v4Checkbox).toBeVisible()
  await expect(v4Checkbox).toBeEnabled()
  await expect(v4Checkbox).toBeChecked()
  await expect(v6Checkbox).toBeVisible()
  await expect(v6Checkbox).toBeDisabled()

  // IPv4 pool dropdown should be visible with default selected
  const v4PoolDropdown = page.getByLabel('IPv4 pool')
  await expect(v4PoolDropdown).toBeVisible()
  await expect(v4PoolDropdown).toContainText('ip-pool-1')

  // Open dropdown to check available options - only IPv4 pools should appear
  await v4PoolDropdown.click()
  await expect(page.getByRole('option', { name: 'ip-pool-1' })).toBeVisible()
})

test('create instance with custom IPv6-only NIC constrains ephemeral IP to IPv6', async ({
  page,
}) => {
  await page.goto('/projects/mock-project/instances-new')

  const instanceName = 'custom-ipv6-nic-test'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectASiloImage(page, 'ubuntu-22-04')

  // Configure networking

  // Select "Custom" network interface (use exact match and first to disambiguate from "custom pool")
  await page.getByRole('radio', { name: 'Custom', exact: true }).first().click()

  // Add a custom NIC with IPv6-only configuration
  await page.getByRole('button', { name: 'Add network interface' }).click()

  const modal = page.getByRole('dialog', { name: 'Add network interface' })
  await expect(modal).toBeVisible()

  await modal.getByRole('textbox', { name: 'Name' }).fill('my-ipv6-nic')
  await modal.getByLabel('VPC', { exact: true }).click()
  await page.getByRole('option', { name: 'mock-vpc' }).click()
  await modal.getByLabel('Subnet').click()
  await page.getByRole('option', { name: 'mock-subnet', exact: true }).click()

  // Select IPv6-only IP configuration
  await modal.getByRole('radio', { name: 'IPv6', exact: true }).click()

  await modal.getByRole('button', { name: 'Add network interface' }).click()
  await expect(modal).toBeHidden()

  // Verify the NIC was added
  const nicTable = page.getByRole('table', { name: 'Network Interfaces' })
  await expect(
    nicTable.getByRole('cell', { name: 'my-ipv6-nic', exact: true })
  ).toBeVisible()

  // Verify that only IPv6 ephemeral IP is enabled
  const v4Checkbox = page.getByRole('checkbox', {
    name: 'Allocate and attach an ephemeral IPv4 address',
  })
  const v6Checkbox = page.getByRole('checkbox', {
    name: 'Allocate and attach an ephemeral IPv6 address',
  })

  await expect(v4Checkbox).toBeVisible()
  await expect(v4Checkbox).toBeDisabled()
  await expect(v6Checkbox).toBeVisible()
  await expect(v6Checkbox).toBeEnabled()
  await expect(v6Checkbox).toBeChecked()

  // IPv6 pool dropdown should be visible with default selected
  const v6PoolDropdown = page.getByLabel('IPv6 pool')
  await expect(v6PoolDropdown).toBeVisible()
  await expect(v6PoolDropdown).toContainText('ip-pool-2')

  // Open dropdown to check available options - only IPv6 pools should appear
  await v6PoolDropdown.click()
  await expect(page.getByRole('option', { name: 'ip-pool-2' })).toBeVisible()
})

test('create instance with custom dual-stack NIC allows both IPv4 and IPv6 ephemeral IPs', async ({
  page,
}) => {
  await page.goto('/projects/mock-project/instances-new')

  const instanceName = 'custom-dual-stack-nic-test'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectASiloImage(page, 'ubuntu-22-04')

  // Configure networking

  // Select "Custom" network interface (use exact match and first to disambiguate from "custom pool")
  await page.getByRole('radio', { name: 'Custom', exact: true }).first().click()

  // Add a custom NIC with dual-stack configuration
  await page.getByRole('button', { name: 'Add network interface' }).click()

  const modal = page.getByRole('dialog', { name: 'Add network interface' })
  await expect(modal).toBeVisible()

  await modal.getByRole('textbox', { name: 'Name' }).fill('my-dual-stack-nic')
  await modal.getByLabel('VPC', { exact: true }).click()
  await page.getByRole('option', { name: 'mock-vpc' }).click()
  await modal.getByLabel('Subnet').click()
  await page.getByRole('option', { name: 'mock-subnet', exact: true }).click()

  // Select dual-stack IP configuration (should be default)
  await modal.getByRole('radio', { name: 'IPv4 & IPv6', exact: true }).click()

  await modal.getByRole('button', { name: 'Add network interface' }).click()
  await expect(modal).toBeHidden()

  // Verify the NIC was added
  const nicTable = page.getByRole('table', { name: 'Network Interfaces' })
  await expect(
    nicTable.getByRole('cell', { name: 'my-dual-stack-nic', exact: true })
  ).toBeVisible()

  // Verify that both IPv4 and IPv6 ephemeral IP checkboxes are available
  const v4Checkbox = page.getByRole('checkbox', {
    name: 'Allocate and attach an ephemeral IPv4 address',
  })
  const v6Checkbox = page.getByRole('checkbox', {
    name: 'Allocate and attach an ephemeral IPv6 address',
  })

  await expect(v4Checkbox).toBeVisible()
  await expect(v4Checkbox).toBeChecked()
  await expect(v6Checkbox).toBeVisible()
  await expect(v6Checkbox).toBeChecked()

  // Both pool dropdowns should be visible with defaults selected
  const v4PoolDropdown = page.getByLabel('IPv4 pool')
  const v6PoolDropdown = page.getByLabel('IPv6 pool')
  await expect(v4PoolDropdown).toBeVisible()
  await expect(v4PoolDropdown).toContainText('ip-pool-1')
  await expect(v6PoolDropdown).toBeVisible()
  await expect(v6PoolDropdown).toContainText('ip-pool-2')

  // Create the instance
  await page.getByRole('button', { name: 'Create instance' }).click()

  // Should navigate to instance page
  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)

  // Navigate to networking tab
  await page.getByRole('tab', { name: 'Networking' }).click()

  // Verify two ephemeral IP rows exist in the external IPs table
  const externalIpsTable = page.getByRole('table', { name: /external ips/i })
  const ephemeralRows = externalIpsTable.getByRole('row').filter({ hasText: 'ephemeral' })

  await expect(ephemeralRows).toHaveCount(2)

  // Verify one is IPv4 and one is IPv6
  await expect(externalIpsTable.getByText('v4')).toBeVisible()
  await expect(externalIpsTable.getByText('v6')).toBeVisible()
})

test('ephemeral IP checkbox disabled when no NICs configured', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  const instanceName = 'ephemeral-ip-nic-test'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectASiloImage(page, 'ubuntu-22-04')

  // Configure networking

  const v4Checkbox = page.getByRole('checkbox', {
    name: 'Allocate and attach an ephemeral IPv4 address',
  })
  const v6Checkbox = page.getByRole('checkbox', {
    name: 'Allocate and attach an ephemeral IPv6 address',
  })
  const defaultRadio = page.getByRole('radio', {
    name: 'Default',
    exact: true,
  })
  const noneRadio = page.getByRole('radio', { name: 'None', exact: true })
  const customRadio = page.getByRole('radio', { name: 'Custom', exact: true }).first()

  // Verify default state: "Default" is checked and both ephemeral IP checkboxes are visible, enabled, and checked
  await expect(defaultRadio).toBeChecked()
  await expect(v4Checkbox).toBeVisible()
  await expect(v4Checkbox).toBeEnabled()
  await expect(v4Checkbox).toBeChecked()
  await expect(v6Checkbox).toBeVisible()
  await expect(v6Checkbox).toBeEnabled()
  await expect(v6Checkbox).toBeChecked()

  // Select "None" radio → verify ephemeral IP checkboxes are disabled and unchecked
  await noneRadio.click()
  await expect(v4Checkbox).toBeVisible()
  await expect(v4Checkbox).toBeDisabled()
  await expect(v4Checkbox).not.toBeChecked()
  await expect(v6Checkbox).toBeVisible()
  await expect(v6Checkbox).toBeDisabled()
  await expect(v6Checkbox).not.toBeChecked()

  // Verify tooltip shows disabled reason for IPv4
  await v4Checkbox.hover()
  await expect(page.getByText('Add an IPv4 network interface')).toBeVisible()
  await expect(page.getByText('to attach an ephemeral IPv4 address')).toBeVisible()

  // Verify tooltip shows disabled reason for IPv6
  await v6Checkbox.hover()
  await expect(page.getByText('Add an IPv6 network interface')).toBeVisible()
  await expect(page.getByText('to attach an ephemeral IPv6 address')).toBeVisible()

  // Select "Custom" radio → verify ephemeral IP checkboxes are still disabled and unchecked
  await customRadio.click()
  await expect(v4Checkbox).toBeVisible()
  await expect(v4Checkbox).toBeDisabled()
  await expect(v4Checkbox).not.toBeChecked()
  await expect(v6Checkbox).toBeVisible()
  await expect(v6Checkbox).toBeDisabled()
  await expect(v6Checkbox).not.toBeChecked()

  // Verify tooltip still shows disabled reason when in Custom mode with no NICs
  await v4Checkbox.hover()
  await expect(page.getByText('Add an IPv4 network interface')).toBeVisible()
  await expect(page.getByText('to attach an ephemeral IPv4 address')).toBeVisible()

  // Click "Add network interface" button to open modal
  await page.getByRole('button', { name: 'Add network interface' }).click()

  const modal = page.getByRole('dialog', { name: 'Add network interface' })
  await expect(modal).toBeVisible()

  // Create an IPv4 NIC named "new-v4-nic"
  await modal.getByRole('textbox', { name: 'Name' }).fill('new-v4-nic')
  await modal.getByLabel('VPC', { exact: true }).click()
  await page.getByRole('option', { name: 'mock-vpc' }).click()
  await modal.getByLabel('Subnet').click()
  await page.getByRole('option', { name: 'mock-subnet', exact: true }).click()

  // Select IPv4 IP configuration
  await modal.getByRole('radio', { name: 'IPv4', exact: true }).click()

  // Submit the modal
  await modal.getByRole('button', { name: 'Add network interface' }).click()
  await expect(modal).toBeHidden()

  // Verify the NIC was added to the table
  const nicTable = page.getByRole('table', { name: 'Network Interfaces' })
  await expect(
    nicTable.getByRole('cell', { name: 'new-v4-nic', exact: true })
  ).toBeVisible()

  // Verify IPv4 ephemeral IP checkbox is now enabled and checked (auto-enabled when NIC added)
  await expect(v4Checkbox).toBeVisible()
  await expect(v4Checkbox).toBeEnabled()
  await expect(v4Checkbox).toBeChecked()
  await expect(v6Checkbox).toBeVisible()
  await expect(v6Checkbox).toBeDisabled()

  // Delete the NIC using the remove button
  await page.getByRole('button', { name: 'remove network interface new-v4-nic' }).click()

  // Verify the NIC is no longer in the table
  await expect(nicTable.getByRole('cell', { name: 'new-v4-nic', exact: true })).toBeHidden()

  // Verify ephemeral IP checkboxes are disabled and unchecked again
  await expect(v4Checkbox).toBeVisible()
  await expect(v4Checkbox).toBeDisabled()
  await expect(v4Checkbox).not.toBeChecked()
  await expect(v6Checkbox).toBeVisible()
  await expect(v6Checkbox).toBeDisabled()
  await expect(v6Checkbox).not.toBeChecked()
})

test('network interface options disabled when no VPCs exist', async ({ page }) => {
  // Use project-no-vpcs which has no VPCs by design for testing this scenario
  await page.goto('/projects/project-no-vpcs/instances-new')

  const instanceName = 'test-no-vpc-instance'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)
  await selectASiloImage(page, 'ubuntu-22-04')

  // Configure networking

  // Get radio button elements
  const defaultRadio = page.getByRole('radio', { name: 'Default', exact: true })
  const noneRadio = page.getByRole('radio', { name: 'None', exact: true })
  const customRadio = page.getByRole('radio', { name: 'Custom', exact: true })

  // Verify the message is visible (indicating no VPCs)
  await expect(page.getByText('A VPC is required to add network interfaces.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Create a VPC' })).toBeVisible()

  // Verify Default and Custom are disabled
  await expect(defaultRadio).toBeDisabled()
  await expect(customRadio).toBeDisabled()

  // Verify "None" is enabled and checked
  await expect(noneRadio).toBeEnabled()
  await expect(noneRadio).toBeChecked()
})

test('floating IPs are filtered by NIC IP version', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  // Configure networking

  // Select IPv4-only networking
  const defaultRadio = page.getByRole('radio', { name: 'Default', exact: true })
  if (!(await defaultRadio.isChecked())) {
    await defaultRadio.click()
  }
  // Wait for and select from the IP version dropdown
  const ipVersionButton = page.locator('[name="defaultIpVersion"]')
  await ipVersionButton.waitFor({ state: 'visible' })
  await ipVersionButton.click()
  await page.getByRole('option', { name: 'IPv4', exact: true }).click()

  // Open the floating IP modal
  await page.getByRole('button', { name: 'Attach floating IP' }).click()

  // Wait for modal to open
  await expect(page.getByRole('dialog', { name: 'Attach floating IP' })).toBeVisible()

  // Get the listbox and open it
  const listbox = page.getByRole('button', { name: 'Floating IP', exact: true })
  await listbox.click()

  // Verify only IPv4 floating IP is available (rootbeer-float with IP 123.4.56.4)
  await expect(page.getByRole('option', { name: 'rootbeer-float' })).toBeVisible()
  // IPv6 floating IP should not be in the list
  await expect(page.getByRole('option', { name: 'ipv6-float' })).not.toBeVisible()

  // Close the listbox dropdown first by pressing Escape
  await page.keyboard.press('Escape')

  // Close the modal
  const dialog = page.getByRole('dialog', { name: 'Attach floating IP' })
  await dialog.getByRole('button', { name: 'Cancel' }).click()

  // Switch to IPv6-only networking
  await ipVersionButton.click()
  await page.getByRole('option', { name: 'IPv6', exact: true }).click()

  // Open the floating IP modal again
  await page.getByRole('button', { name: 'Attach floating IP' }).click()

  // Wait for modal to open
  await expect(dialog).toBeVisible()

  // Get the listbox and open it
  await listbox.click()

  // Verify only IPv6 floating IP is available (ipv6-float)
  await expect(page.getByRole('option', { name: 'ipv6-float' })).toBeVisible()
  // IPv4 floating IP should not be in the list
  await expect(page.getByRole('option', { name: 'rootbeer-float' })).not.toBeVisible()

  // Close the listbox dropdown first by pressing Escape
  await page.keyboard.press('Escape')

  // Close the modal
  await dialog.getByRole('button', { name: 'Cancel' }).click()

  // Switch to dual-stack networking
  await ipVersionButton.click()
  await page.getByRole('option', { name: 'IPv4 & IPv6', exact: true }).click()

  // Open the floating IP modal again
  await page.getByRole('button', { name: 'Attach floating IP' }).click()

  // Wait for modal to open
  await expect(dialog).toBeVisible()

  // Get the listbox and open it
  await listbox.click()

  // Verify both IPv4 and IPv6 floating IPs are available
  await expect(page.getByRole('option', { name: 'rootbeer-float' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'ipv6-float' })).toBeVisible()

  // Close the listbox dropdown first by pressing Escape
  await page.keyboard.press('Escape')

  // Close the modal
  await dialog.getByRole('button', { name: 'Cancel' }).click()

  // Switch to "None" networking
  await page.getByRole('radio', { name: 'None' }).click()

  // Verify the "Attach floating IP" button is disabled when no NICs are configured
  const attachFloatingIpButton = page.getByRole('button', { name: 'Attach floating IP' })
  await expect(attachFloatingIpButton).toBeDisabled()

  // Verify the disabled reason tooltip
  await attachFloatingIpButton.hover()
  await expect(page.getByText('A network interface is required')).toBeVisible()
  await expect(page.getByText('to attach a floating IP')).toBeVisible()
})

// Read-only disk creation disabled pending propolis fix
// https://github.com/oxidecomputer/console/issues/3071
test.skip('can create instance with read-only boot disk', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  const instanceName = 'readonly-boot-instance'
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(instanceName)

  // Select a silo image
  await selectASiloImage(page, 'ubuntu-22-04')

  // Check the read-only checkbox
  await page.getByRole('checkbox', { name: 'Make disk read-only' }).check()

  await page.getByRole('button', { name: 'Create instance' }).click()
  await closeToast(page)

  // Wait for navigation to storage tab
  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)

  // Verify boot disk shows read-only badge
  const bootDiskTable = page.getByRole('table', { name: 'Boot disk' })
  await expect(bootDiskTable.getByText('read only')).toBeVisible()
})
