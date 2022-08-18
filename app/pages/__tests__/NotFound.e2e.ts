import { expect, test } from 'app/test/e2e'

test('Shows 404 page when a resource is not found', async ({ page }) => {
  await page.goto('/orgs/nonexistent')
  await expect(page.locator('text=Page not found')).toBeVisible()

  await page.goto('/orgs/maze-war/projects/nonexistent')
  await expect(page.locator('text=Page not found')).toBeVisible()
})
