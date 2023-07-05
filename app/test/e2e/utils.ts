import type { Browser, Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { MSW_USER_COOKIE } from '@oxide/api-mocks'

export * from '@playwright/test'

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

type Selector = string | Locator

const toLocator = (page: Page, selector: Selector): Locator =>
  typeof selector === 'string' ? page.locator(selector) : selector

export async function expectVisible(page: Page, selectors: Selector[]) {
  for (const selector of selectors) {
    await expect(toLocator(page, selector)).toBeVisible()
  }
}

export async function expectNotVisible(page: Page, selectors: Selector[]) {
  for (const selector of selectors) {
    await expect(toLocator(page, selector)).toBeHidden()
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

export async function stopInstance(page: Page) {
  await page.click('role=button[name="Instance actions"]')
  await page.click('role=menuitem[name="Stop"]')
  // close toast. for some reason it prevents things from happening
  await page.click('role=button[name="Dismiss notification"]')
}

/**
 * This will not work in Firefox, which only supports reading from the clipboard in extensions.
 * See [MDN: readText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText#browser_compatibility).
 */
export const clipboardText = async (page: Page) =>
  page.evaluate(() => navigator.clipboard.readText())

/** Select row by `rowText`, click the row actions button, and click `actionName` */
export async function clickRowAction(page: Page, rowText: string, actionName: string) {
  await page
    .getByRole('row', { name: rowText, exact: false })
    .getByRole('button', { name: 'Row actions' })
    .click()
  await page.getByRole('menuitem', { name: actionName }).click()
}

export async function getDevUserPage(browser: Browser): Promise<Page> {
  const browserContext = await browser.newContext()
  await browserContext.addCookies([
    { name: MSW_USER_COOKIE, value: 'Hans Jonas', domain: 'localhost', path: '/' },
  ])
  return await browserContext.newPage()
}
