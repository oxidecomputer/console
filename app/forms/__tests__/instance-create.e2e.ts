import { test, expect } from '@playwright/test'

test.describe('Instance Create Form', () => {
  test('can invoke instance create form from instances page', async ({ page }) => {
    await page.goto('/orgs/maze-war/projects/mock-project/instances')
    await page.locator('text="New Instance"').click()
    await expect(page.locator('h1:has-text("Create instance")')).toBeVisible()

    await page.fill('input[name=name]', 'mock-instance')
    await page.locator('.ox-radio-card').nth(0).click()

    await page.locator('input[value=ubuntu] ~ .ox-radio-card').click()

    await page.locator('button:has-text("Create instance")').click()

    await page.waitForNavigation()

    expect(page.url()).toContain(
      '/orgs/maze-war/projects/mock-project/instances/mock-instance'
    )

    await expect(page.locator('h1:has-text("mock-instance")')).toBeVisible()
  })
})
