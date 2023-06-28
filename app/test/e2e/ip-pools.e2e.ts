import { expect, test } from '@playwright/test'

import { clickRowAction, expectNotVisible, expectVisible } from './utils'

test('Create IP pool', async ({ page }) => {
  await page.goto('/system/ip-pools')
  await expect(page.getByRole('heading', { name: 'IP Pools' })).toBeVisible()

  await page.getByRole('link', { name: 'New IP pool' }).click()

  await expect(page.getByRole('heading', { name: 'Create IP Pool' })).toBeVisible()

  await page.getByRole('textbox', { name: 'Name' }).fill('another-ip-pool')
  await page.getByRole('textbox', { name: 'Description' }).fill('too deep')
  await page.getByRole('button', { name: 'Create IP pool' }).click()

  await expect(page.getByRole('cell', { name: 'another-ip-pool' })).toBeVisible()
})

test('Delete IP pool', async ({ page }) => {
  await page.goto('/system/ip-pools')
  await expectVisible(page, ['role=cell[name="mock-ip-pool"]'])

  await clickRowAction(page, 'mock-ip-pool', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()

  // Check deletion was successful
  await expectVisible(page, ['text="mock-ip-pool has been deleted"'])
  await expectNotVisible(page, ['role=cell[name="mock-ip-pool"]'])
})
