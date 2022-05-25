import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function forEach(loc: Locator, fn: (loc0: Locator) => void) {
  const count = await loc.count()
  for (let i = 0; i < count; i++) {
    await fn(loc.nth(i))
  }
}

export async function expectVisible(page: Page, selectors: string[]) {
  await Promise.all(
    selectors.map((selector) => async () => {
      await expect(page.locator(selector)).toBeVisible()
    })
  )
}

export async function expectNotVisible(page: Page, selectors: string[]) {
  await Promise.all(
    selectors.map((selector) => async () => {
      await expect(page.locator(selector)).not.toBeVisible()
    })
  )
}
