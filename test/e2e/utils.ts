/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, type Browser, type Locator, type Page } from '@playwright/test'

import { MiB } from '~/util/units'

import { MSW_USER_COOKIE } from '../../mock-api/msw/util'

export * from '@playwright/test'

export async function forEach(
  loc: Locator,
  fn: (loc0: Locator, i: number) => Promise<void>
) {
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

// Technically this has type AsymmetricMatcher, which is not exported by
// Playwright and is (surprisingly) just Record<string, any>. Rather than use
// that, I think it's smarter to do the following in case they ever make the
// type more interesting; this will still do what it's supposed to.
type StringMatcher = ReturnType<typeof expect.stringMatching>

/**
 * Assert that a row matching `expectedRow` is present in `table`. The match
 * uses `objectContaining`, so `expectedRow` does not need to contain every
 * cell. Works by converting `table` to a list of objects where the keys are
 * header cell text and the values are row cell text.
 */
export async function expectRowVisible(
  table: Locator,
  expectedRow: Record<string, string | StringMatcher>
) {
  // wait for header and rows to avoid flake town
  const headerLoc = table.locator('thead >> role=cell')
  await headerLoc.locator('nth=0').waitFor() // nth=0 bc error if there's more than 1

  const rowLoc = table.locator('tbody >> role=row')
  await rowLoc.locator('nth=0').waitFor()

  async function getRows() {
    // need to pull header keys every time because the whole page can change
    // while we're polling

    // filter out data-test-ignore is specifically for making the header cells
    // match up with the contents on the double-header utilization table
    const headerKeys = await table
      .locator('thead >> th:not([data-test-ignore])')
      .allTextContents()

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
  await page.getByRole('button', { name: 'Instance actions' }).click()
  await page.getByRole('menuitem', { name: 'Stop' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await closeToast(page)
  // don't need to manually refresh because of polling
  await expect(page.getByText('statestopped')).toBeVisible()
}

/**
 * Close toast and wait for it to fade out. For some reason it prevents things
 * from working, but only in tests as far as we can tell.
 */
export async function closeToast(page: Page) {
  await page.getByRole('button', { name: 'Dismiss notification' }).click()
  await sleep(1000)
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

/**
 * Select an option from a dropdown
 * labelLocator can either be the dropdown's label text or a more elaborate Locator
 * optionLocator can either be the dropdown's option text or a more elaborate Locator
 * */
export async function selectOption(
  page: Page,
  labelLocator: string | Locator,
  optionLocator: string | Locator
) {
  if (typeof labelLocator === 'string') {
    await page.getByLabel(labelLocator, { exact: true }).click()
  } else {
    await labelLocator.click()
  }
  if (typeof optionLocator === 'string') {
    await page.getByRole('option', { name: optionLocator, exact: true }).click()
  } else {
    await optionLocator.click()
  }
}

export async function getPageAsUser(
  browser: Browser,
  user: 'Hans Jonas' | 'Simone de Beauvoir'
): Promise<Page> {
  const browserContext = await browser.newContext()
  await browserContext.addCookies([
    { name: MSW_USER_COOKIE, value: user, domain: 'localhost', path: '/' },
  ])
  return await browserContext.newPage()
}

/**
 * Assert that the item is visible and in the viewport but obscured by something
 * else, as indicated by it not being clickable. In order to avoid false
 * positives where something is not clickable due to it being not attached or
 * something, we assert visible and in viewport first.
 */
export async function expectObscured(locator: Locator) {
  // counterintuitively, expect visible does not mean actually visible, it just
  // means attached and not having display: none
  await expect(locator).toBeVisible()
  await expect(locator).toBeInViewport()

  // Attempt click with `trial: true`, which means only the actionability checks
  // run but the click does not actually happen. Short timeout means this will
  // fail fast if not clickable.
  await expect(
    async () => await locator.click({ trial: true, timeout: 50 })
  ).rejects.toThrow(/Timeout 50ms exceeded/)
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const bigFile = Buffer.alloc(3 * MiB, 'a')
const smallFile = Buffer.alloc(0.1 * MiB, 'a')

export async function chooseFile(
  page: Page,
  inputLocator: Locator,
  size: 'large' | 'small' = 'large'
) {
  const fileChooserPromise = page.waitForEvent('filechooser')
  await inputLocator.click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles({
    name: 'my-image.iso',
    mimeType: 'application/octet-stream',
    // fill with nonzero content, otherwise we'll skip the whole thing, which
    // makes the test too fast for playwright to catch anything
    buffer: size === 'large' ? bigFile : smallFile,
  })
}
