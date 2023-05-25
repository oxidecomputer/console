import { images } from '@oxide/api-mocks'

import { expect, expectVisible, test } from './utils'

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
    'role=spinbutton[name="Disk size (GiB)"]',
    'role=radiogroup[name="Network interface"]',
    'role=textbox[name="Hostname"]',
    'role=button[name="Create instance"]',
  ])

  const instanceName = 'my-instance'
  await page.fill('input[name=name]', instanceName)
  await page.fill('input[name=description]', 'An instance... from space!')
  await page.locator('.ox-radio-card').nth(3).click()

  await page.fill('input[name=bootDiskName]', 'my-boot-disk')
  await page.fill('input[name=bootDiskSize]', '20')

  // pick a project image just to show we can
  await page.getByRole('tab', { name: 'Project images' }).click()
  await page.getByRole('button', { name: 'Image' }).click()
  await page.getByRole('option', { name: images[2].name }).click()

  await page.getByRole('button', { name: 'Create instance' }).click()

  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)

  await expectVisible(page, [
    `h1:has-text("${instanceName}")`,
    'text=16 vCPUs',
    'text=64 GiB',
    'text=from space',
  ])

  // trying to create another instance with the same name produces a visible
  // error
  await page.goto('/projects/mock-project/instances')
  await page.locator('text="New Instance"').click()
  await page.fill('input[name=name]', instanceName)
  await page.locator('button:has-text("Create instance")').click()
  await page.getByText('Instance name already exists')
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
  await page.fill('input[name=description]', 'An instance... from space!')

  // Click the other tabs to make sure the custom input works
  // even when something has been previously selected
  await page.getByRole('tab', { name: 'High CPU' }).click()
  await page.getByRole('tab', { name: 'High Memory' }).click()
  await page.getByText('64 GiB RAM').click()

  // Fill in custom specs
  await page.getByRole('tab', { name: 'Custom' }).click()
  await page.fill('input[name=ncpus]', '29')
  await page.fill('input[name=memory]', '53')

  await page.fill('input[name=bootDiskName]', 'my-boot-disk')
  await page.fill('input[name=bootDiskSize]', '20')

  // pick a project image just to show we can
  await page.getByRole('tab', { name: 'Project images' }).click()
  await page.getByRole('button', { name: 'Image' }).click()
  await page.getByRole('option', { name: images[2].name }).click()

  await page.getByRole('button', { name: 'Create instance' }).click()

  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)

  await expectVisible(page, [
    `h1:has-text("${instanceName}")`,
    'text=29 vCPUs',
    'text=53 GiB',
    'text=from space',
  ])
})

test('with disk name already taken', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')
  await page.fill('input[name=name]', 'my-instance')
  await page.fill('input[name=bootDiskName]', 'disk-1')

  await page.getByRole('button', { name: 'Create instance' }).click()
  await expectVisible(page, ['text=Disk name already exists'])
})
