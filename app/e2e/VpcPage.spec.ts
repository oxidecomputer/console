import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  const pageTitle = await page.textContent('header h1 span:last-child')
  expect(pageTitle).toEqual('Projects')
})

test.describe('VpcPage', () => {
  test('can create subnet', async ({ page }) => {
    // could goto page directly but clicking through is more realistic
    await page.click('table :text("mock-project")')
    await page.click('a:has-text("Networking")')
    await page.click('a:has-text("mock-vpc")')

    // only one row in table, the default mock-subnet
    let rows = await page.locator('tbody >> tr')
    await expect(rows).toHaveCount(1)
    await expect(rows.nth(0).locator('text="mock-subnet"')).toBeVisible()

    // open modal, fill out form, submit
    await page.click('text=New subnet')
    await page.fill('text=IPv4 block', '1.1.1.2/24')
    await page.fill('input[name=name]', 'mock-subnet-2')
    await page.click('button:has-text("Create subnet")')

    rows = await page.locator('tbody >> tr')
    await expect(rows).toHaveCount(2)

    await expect(rows.nth(0).locator('text="mock-subnet"')).toBeVisible()
    await expect(rows.nth(0).locator('text="1.1.1.1/24"')).toBeVisible()

    await expect(rows.nth(1).locator('text="mock-subnet-2"')).toBeVisible()
    await expect(rows.nth(1).locator('text="1.1.1.2/24"')).toBeVisible()
  })
})
