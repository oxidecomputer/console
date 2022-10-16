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

// const sleep = async (ms: number) => new Promise((res) => setTimeout(res, ms))
//
// export async function expectSimultaneous(page: Page, selectors: string[]) {
//   const getHandles = () => Promise.all(selectors.map((s) => page.$(s)))
//   let handles = new Array(selectors.length).fill(null)
//   while (handles.every((h) => h == null)) {
//     handles = await getHandles()
//     // console.log(handles.map((h) => h != null))
//     await sleep(20)
//   }
//   // if any of them showed up, we want to see that all of them did
//   expect(handles.every((h) => h != null)).toBe(true)
// }

async function timeToAppear(page: Page, selector: string): Promise<number> {
  const start = Date.now()
  await page.locator(selector).waitFor()
  return Date.now() - start
}

/**
 * Assert two elements appeared within 20ms of each other
 */
export async function expectSimultaneous(page: Page, selectors: [string, string]) {
  const [t1, t2] = await Promise.all(selectors.map((sel) => timeToAppear(page, sel)))
  expect(Math.abs(t1 - t2)).toBeLessThan(20)
}
