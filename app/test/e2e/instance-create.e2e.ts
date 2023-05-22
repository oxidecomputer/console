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

  await page.locator('button:has-text("Create instance")').click()

  await expect(page).toHaveURL(`/projects/mock-project/instances/${instanceName}/storage`)

  await expectVisible(page, [
    `h1:has-text("${instanceName}")`,
    'text=6 vCPUs',
    'text=24 GiB',
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
