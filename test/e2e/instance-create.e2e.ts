/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { floatingIp } from '@oxide/api-mocks'

import {
  expect,
  expectNotVisible,
  expectRowVisible,
  expectVisible,
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

  // should be hidden in accordion
  await expectNotVisible(page, [
    'role=radiogroup[name="Network interface"]',
    'role=textbox[name="Hostname"]',
    'text="User Data"',
  ])

  // open networking and config accordions
  await page.getByRole('button', { name: 'Networking' }).click()
  await page.getByRole('button', { name: 'Configuration' }).click()

  const checkbox = page.getByRole('checkbox', {
    name: 'Allocate and attach an ephemeral IP address',
  })
  const label = page.getByLabel('IP pool for ephemeral IP')

  // verify that the ip pool selector is visible and default is selected
  await expect(checkbox).toBeChecked()
  await label.click()
  await expect(page.getByRole('option', { name: 'ip-pool-1' })).toBeEnabled()

  // unchecking the box should disable the selector
  await checkbox.uncheck()
  await expect(label).toBeHidden()

  // re-checking the box should re-enable the selector, and other options should be selectable
  await checkbox.check()
  await selectOption(page, 'IP pool for ephemeral IP', 'ip-pool-2 VPN IPs')

  // should be visible in accordion
  await expect(page.getByRole('radiogroup', { name: 'Network interface' })).toBeVisible()
  // we show the default hostname, instance name, as placeholder
  await expect(page.getByRole('textbox', { name: 'Hostname' })).toHaveAttribute(
    'placeholder',
    instanceName
  )
  await expect(page.getByLabel('User data')).toBeVisible()

  await page.getByRole('button', { name: 'Create instance' }).click()

  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)

  await expectVisible(page, [
    `h1:has-text("${instanceName}")`,
    'text=16 vCPUs',
    'text=64 GiB',
    'text=from space',
  ])

  // instance goes from creating to starting to running as we poll
  const pollingSpinner = page.getByLabel('Spinner')
  await expect(pollingSpinner).toBeVisible()
  await expect(page.getByText('Creating')).toBeVisible()
  await expect(page.getByText('Starting')).toBeVisible()
  await expect(page.getByText('Running')).toBeVisible()
  await expect(pollingSpinner).toBeHidden()

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
  // Create the instance
  await page.getByRole('button', { name: 'Create instance' }).click()
  await expect(page).toHaveURL('/projects/mock-project/instances/another-instance/storage')

  // Find the Boot Disk table and verify that disk-11 is there
  const bootDiskTable = page.getByRole('table', { name: 'Boot disk' })
  await expect(bootDiskTable.getByRole('cell', { name: 'disk-11' })).toBeVisible()

  // Find the Other Disks table and verify that disk-12 is there
  const otherDisksTable = page.getByRole('table', { name: 'Other disks' })
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
  const dialog = page.getByRole('dialog')
  const selectFloatingIpButton = dialog.getByRole('button', { name: 'Floating IP' })
  const rootbeerFloatOption = page.getByRole('option', { name: 'rootbeer-float' })
  const attachButton = dialog.getByRole('button', { name: 'Attach', exact: true })

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
  await expect(page.getByRole('combobox', { name: 'Disk name' })).toHaveValue('disk-0102')

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

  // verify that an existing name can't be used
  await createForm.getByRole('textbox', { name: 'Name', exact: true }).fill('disk-6')
  await createForm.getByRole('textbox', { name: 'Size (GiB)' }).fill('5')
  await createForm.getByRole('button', { name: 'Create disk' }).click()
  await expect(createForm.getByText('Name is already in use')).toBeVisible()

  // rename that failed disk
  await createForm.getByRole('textbox', { name: 'Name', exact: true }).fill('new-disk-1')
  await createForm.getByRole('button', { name: 'Create disk' }).click()

  const disksTable = page.getByRole('table', { name: 'Disks' })
  await expect(disksTable.getByText('disk-6')).toBeHidden()
  await expectRowVisible(disksTable, { Name: 'new-disk-1', Type: 'create', Size: '5GiB' })

  // Attach an existing disk
  await page.getByRole('button', { name: 'Attach existing disk' }).click()
  await selectOption(page, 'Disk name', 'disk-3')
  await page.getByRole('button', { name: 'Attach disk' }).click()

  await expectRowVisible(disksTable, { Name: 'disk-3', Type: 'attach', Size: '—' })

  // Create the instance
  await page.getByRole('button', { name: 'Create instance' }).click()

  // Assert we're on the new instance's storage page
  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)

  // Check for the boot disk
  const bootDiskTable = page.getByRole('table', { name: 'Boot disk' })
  // name is generated so it's gnarly
  await expect(bootDiskTable.getByRole('cell', { name: /^more-disks-/ })).toBeVisible()

  // Check for the additional disks
  const otherDisksTable = page.getByRole('table', { name: 'Other disks' })
  await expectRowVisible(otherDisksTable, { Disk: 'new-disk-1', size: '5 GiB' })
  await expectRowVisible(otherDisksTable, { Disk: 'disk-3', size: '6 GiB' })
})
