import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function forEach(loc: Locator, fn: (loc0: Locator, i: number) => void) {
  const count = await loc.count()
  for (let i = 0; i < count; i++) {
    await fn(loc.nth(i), i)
  }
}

export async function map<T>(
  loc: Locator,
  fn: (loc0: Locator, i: number) => Promise<T>
): Promise<T[]> {
  const result: T[] = []
  await forEach(loc, async (loc0, i) => {
    result.push(await fn(loc0, i))
  })
  return result
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
 * Assert that a row matching `expectedRow` is present in `table`. The match
 * uses `objectContaining`, so `expectedRow` does not need to contain every
 * cell. Works by converting `table` to a list of objects where the keys are
 * header cell text and the values are row cell text.
 */
export async function expectRowVisible(
  table: Locator,
  expectedRow: Record<string, string>
) {
  // wait for header and rows to avoid flake town
  const headerLoc = table.locator('thead >> role=cell')
  await headerLoc.locator('nth=0').waitFor() // nth=0 bc error if there's more than 1

  const rowLoc = table.locator('tbody >> role=row')
  await rowLoc.locator('nth=0').waitFor()

  const headerKeys = await map(
    table.locator('thead >> role=cell'),
    async (cell) => await cell.textContent()
  )

  const getRows = async () =>
    await map(table.locator('tbody >> role=row'), async (row) => {
      const rowPairs = await map(row.locator('role=cell'), async (cell, i) => [
        headerKeys[i],
        // accessible name would be better but it's not in yet
        // https://github.com/microsoft/playwright/issues/13517
        await cell.textContent(),
      ])
      return Object.fromEntries(rowPairs.filter(([k]) => k && k.length > 0))
    })

  // wait up to 5s for the row to be there
  // https://playwright.dev/docs/test-assertions#polling
  await expect
    .poll(getRows)
    .toEqual(expect.arrayContaining([expect.objectContaining(expectedRow)]))
}
