import { expect, test } from '@playwright/test'

import { expectVisible } from 'app/util/e2e'

test.describe('Instance Create Form', () => {
  test('can invoke instance create form from instances page', async ({ page }) => {
    await page.goto('/orgs/maze-war/projects/mock-project/instances')
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
      'role=button[name="Create instance"][disabled]',
    ])

    await page.fill('input[name=name]', 'mock-instance')
    await page.locator('.ox-radio-card').nth(0).click()

    await page.fill('input[name=bootDiskName]', 'my-boot-disk')
    await page.fill('input[name=bootDiskSize]', '20')

    await page.locator('input[value=ubuntu-1] ~ .ox-radio-card').click()

    await page.locator('button:has-text("Create instance")').click()

    await page.waitForNavigation()

    expect(page).toHaveURL('/orgs/maze-war/projects/mock-project/instances/mock-instance')

    await expect(page.locator('h1:has-text("mock-instance")')).toBeVisible()
  })
})
