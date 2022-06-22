import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function forEach(loc: Locator, fn: (loc0: Locator) => void) {
  const count = await loc.count()
  for (let i = 0; i < count; i++) {
    await fn(loc.nth(i))
  }
}

export async function expectVisible(page: Page, selectors: string[]) {
  for (const selector of selectors) {
    await expect(page.locator(selector)).toBeVisible()
  }
}

export async function expectNotVisible(page: Page, selectors: string[]) {
  for (const selector of selectors) {
    await expect(page.locator(selector)).not.toBeVisible()
  }
}

/**
 * Assert about the values of a row, identified by `rowSelectorText`. It doesn't
 * need to be the entire row; the test will pass as long as the identified row
 * exists and the first N cells match the N values in `cellTexts`. Pass `''` for
 * a checkbox cell.
 *
 * @param rowSelectorText Text that should uniquely identify the row, like an ID
 * @param cellTexts Text to match in each cell of that row
 */
export async function expectRowVisible(
  page: Page,
  rowSelectorText: string,
  cellTexts: string[]
) {
  const row = page.locator(`tr:has-text("${rowSelectorText}")`)
  await expect(row).toBeVisible()
  for (let i = 0; i < cellTexts.length; i++) {
    await expect(row.locator(`role=cell >> nth=${i}`)).toHaveText(cellTexts[i])
  }
}
