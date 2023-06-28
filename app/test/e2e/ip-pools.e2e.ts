import { expect, test } from '@playwright/test'

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
