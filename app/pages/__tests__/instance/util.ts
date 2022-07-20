import type { Page } from '@playwright/test'

export async function stopInstance(page: Page) {
  await page.click('role=button[name="Instance actions"]')
  await page.click('role=menuitem[name="Stop"]')
  // Close toast, it holds up the test for some reason
  await page.click('role=button[name="Dismiss notification"]')
}
