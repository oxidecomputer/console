import type { Page } from '@playwright/test'

export async function stopInstance(page: Page) {
  await page.click('role=button[name="Instance actions"]')
  await page.click('role=menuitem[name="Stop"]')
  // close toast. for some reason it prevents things from happening
  await page.click('role=button[name="Dismiss notification"]')
}
