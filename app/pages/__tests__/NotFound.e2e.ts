import { expect, test } from '@playwright/test'

test('Shows 404 page when a resource is not found', async ({ page }) => {
  await page.goto('/nonexistent')
  await expect(page.locator('text=Page not found')).toBeVisible()

  await page.goto('/projects/nonexistent')
  await expect(page.locator('text=Page not found')).toBeVisible()
})
