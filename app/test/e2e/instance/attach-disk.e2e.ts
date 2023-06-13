import { test } from '@playwright/test'

import { expectNotVisible, expectVisible, stopInstance } from '../utils'

test('Attach disk', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')

  // Have to stop instance to edit disks
  await stopInstance(page)

  // New disk form
  await page.click('role=button[name="Create new disk"]')
  await expectVisible(page, [
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=radiogroup[name="Block size (Bytes)"]',
    'role=spinbutton[name="Size (GiB)"]',
    'role=button[name="Create Disk"]',
  ])
  await page.click('role=button[name="Cancel"]')

  // Attach existing disk form
  await page.click('role=button[name="Attach existing disk"]')

  // Disk is required
  await expectNotVisible(page, ['text="Disk name is required"'])
  await page.getByRole('button', { name: 'Attach disk' }).click()
  await expectVisible(page, ['role=dialog >> text="Disk name is required"'])

  await page.click('role=button[name*="Disk name"]')
  await expectVisible(page, ['role=option[name="disk-3"]', 'role=option[name="disk-4"]'])
  await page.click('role=option[name="disk-3"]')

  await page.click('role=button[name="Attach Disk"]')
  await expectVisible(page, ['role=table[name="Disks"] >> role=cell[name="disk-3"]'])
})
