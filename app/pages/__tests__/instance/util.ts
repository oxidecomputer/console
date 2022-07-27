import type { Page } from '@playwright/test'

const sleep = async (ms: number) => new Promise((res) => setTimeout(res, ms))

export async function stopInstance(page: Page) {
  await page.click('role=button[name="Instance actions"]')
  await page.click('role=menuitem[name="Stop"]')
  // Close toast, it holds up the test for some reason
  await page.click('role=button[name="Dismiss notification"]')
  await sleep(110) // toast animation lol
}
