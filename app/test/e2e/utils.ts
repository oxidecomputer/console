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
    /**
     * We want to pass if _at least_ one element is visible matching the given
     * selector. `expect(locator).toBeVisible()` will fail if more than one
     * element is found. To work around this, we filter by visible and then
     * select the first element. The filter is important otherwise first might
     * not actually be a visible element.
     */
    await expect(page.locator(selector).locator('visible=true').first()).toBeVisible()
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

  async function getRows() {
    // need to pull header keys every time because the whole page can change
    // while we're polling
    const headerKeys = await table.locator('thead >> role=cell').allTextContents()
    const rows = await map(table.locator('tbody >> role=row'), async (row) => {
      // accessible name would be better than cell text but it's not in yet
      // https://github.com/microsoft/playwright/issues/13517
      const textContents = await row.locator('role=cell').allTextContents()
      const rowPairs = textContents
        .map((text, i) => [headerKeys[i], text])
        // filter out empty header keys (e.g., checkbox or more button column)
        .filter(([headerKey]) => headerKey && headerKey.length > 0)
      return Object.fromEntries(rowPairs)
    })
    // console.log(rows)
    return rows
  }

  // wait up to 5s for the row to be there
  // https://playwright.dev/docs/test-assertions#polling
  await expect
    // poll slowly because getRows is slow. usually under 200ms but still
    .poll(getRows, { intervals: [500] })
    .toEqual(expect.arrayContaining([expect.objectContaining(expectedRow)]))
}

async function timeToAppear(page: Page, selector: string): Promise<number> {
  const start = Date.now()
  await page.locator(selector).waitFor()
  return Date.now() - start
}

/**
 * Assert a set of elements all appeared within a 20ms range
 */
export async function expectSimultaneous(page: Page, selectors: string[]) {
  const times = await Promise.all(selectors.map((sel) => timeToAppear(page, sel)))
  times.sort()
  expect(times[times.length - 1] - times[0]).toBeLessThan(40)
}
