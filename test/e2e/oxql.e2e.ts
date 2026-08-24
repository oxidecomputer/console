/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test, type Page, type Locator } from '@playwright/test'

import { oxqlQueries } from './oxql-queries'
import { expectToast } from './utils'

const runQuery = async (page: Page, query?: string) => {
  if (query !== undefined) await page.getByRole('textbox').fill(query)
  await page.getByRole('button', { name: 'Run query' }).click()

  const loading = page.getByLabel('Chart loading')
  await expect(loading).toBeVisible()
  await expect(loading).toBeHidden()
  await expect(page.getByRole('alert')).toBeHidden()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/system/metrics-explorer')
  await expect(page.getByRole('heading', { name: 'Metrics Explorer' })).toBeVisible()
})

test('unaligned multi-table query renders a chart per series', async ({ page }) => {
  await runQuery(page, oxqlQueries.unalignedTables)

  // Unaligned queries get you a chart for every series in the result, splitting
  // up tables (since each list of values isn't aligned with the others!)
  await expect(page.getByRole('figure')).toHaveCount(4) // product of table count and fields-per-table
  await expect(
    page.getByRole('figure', { name: 'hardware_component:temperature' })
  ).toHaveCount(2)
  await expect(
    page.getByRole('figure', { name: 'hardware_component:sensor_error_count' })
  ).toHaveCount(2)
})

const getLegendText = async (locator: Locator): Promise<string[]> =>
  locator.getByRole('listitem').allTextContents()

test('aligned multi-table query renders a chart per table', async ({ page }) => {
  await runQuery(page, oxqlQueries.bytesSentAndReceived)

  const figures = page.getByRole('figure')
  // Aligned tab
  await expect(figures).toHaveCount(2) // number of tables in query
  const first = figures.first()

  // On aligned queries, there's one chart per table queried, and one line (and
  // legend item) per field combination. The legend item depends on mock data,
  // so we just snapshot
  const firstLegendText = await getLegendText(first)
  expect(firstLegendText).toEqual([
    // depends on whatever mock data returns
    'instance_id: 935499b3-fd96-432a-9c21-83a3dc1eece4',
    'instance_id: b5946edc-5bed-4597-88ab-9a8beb9d32a4',
  ])

  const all = await figures.all()
  for (let i = 1; i < all.length; i += 1) {
    // Every chart should have the same sequence of fields, even if the actual
    // combinations are dynamic
    expect(await getLegendText(all[i])).toEqual(firstLegendText)
  }
})

test('joined query renders a chart per instance with a legend line per metric', async ({
  page,
}) => {
  await runQuery(page, oxqlQueries.multiJoinedTables)

  const figures = page.getByRole('figure')
  // Joined queries are an inversion of aligned queries: they have one chart per
  // _field combination,_ and one line/legend item per table in the join
  await expect(figures).toHaveCount(3) // depends on mock data
  const first = figures.first()
  await expect(first.getByRole('listitem')).toHaveText([
    'sled_data_link:bytes_sent',
    'sled_data_link:errors_sent',
    'sled_data_link:bytes_received',
    'sled_data_link:errors_received',
  ])
})

test('"Drop first point" appears only for cumulative-derived charts', async ({ page }) => {
  const dropFirst = page.getByLabel('Drop first point')

  // a plain gauge is never cumulative, so there's no giant first point to drop
  await runQuery(page, oxqlQueries.basicTctl)
  await expect(dropFirst).toBeHidden()

  // joined/aligned tables may derive from cumulatives, so the option shows up
  // TODO: if you know the schemas, you can check which tables are cumulative!
  await runQuery(page, oxqlQueries.multiJoinedTables)
  await expect(dropFirst).toBeChecked()

  await dropFirst.uncheck()
  await expect(page.getByRole('figure')).toHaveCount(3)
})

test('results list is virtualized', async ({ page }) => {
  const getFirstRenderedIndex = () =>
    page
      .locator('[data-index]')
      .first()
      .evaluate((el) => Number(el.getAttribute('data-index')))

  await runQuery(page, `{${Array(100).fill('get sled_data_link:bytes_sent').join(';')}}`)

  const figures = page.getByRole('figure')
  await expect(figures.first()).toBeVisible()
  expect(await getFirstRenderedIndex()).toBe(0)
  await expect.poll(() => figures.count()).toBeLessThan(20) // arbitrary, "not everything"

  // double check we're actually virtualizing!
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect.poll(getFirstRenderedIndex).not.toBe(0)
})

test('picking an example populates the query and runs it', async ({ page }) => {
  await page.getByRole('button', { name: 'Power shelf fan speeds' }).click()
  // the editor is a contenteditable, so assert on text rather than value
  await expect(page.getByRole('textbox')).toContainText('get hardware_component:fan_speed')

  // the query runs automatically, no need to click "Run query"
  const loading = page.getByLabel('Chart loading')
  await expect(loading).toBeVisible()
  await expect(loading).toBeHidden()
  await expect(page.getByRole('figure').first()).toBeVisible()
})

test('editor autocompletes timeseries names, fields, and operations', async ({ page }) => {
  const textbox = page.getByRole('textbox')
  await textbox.click()
  await page.keyboard.type('get hardware')

  // ctrl-space explicitly re-requests completions in case the schema list
  // hadn't loaded when typing started
  const options = page.getByRole('listbox').getByRole('option')
  await expect(async () => {
    await page.keyboard.press('Control+Space')
    await expect(options.first()).toBeVisible({ timeout: 1000 })
  }).toPass()

  // accept with the keyboard rather than clicking: the info tooltip can
  // overlap the option and intercept pointer events
  await expect(options.getByText('hardware_component:fan_speed')).toBeVisible()
  await page.keyboard.type('_component:fan') // narrow until fan_speed is the top match
  await page.keyboard.press('Enter')
  await expect(textbox).toContainText('get hardware_component:fan_speed')

  // table ops complete at the start of a clause. type the word out instead of
  // accepting: a second Enter-accept can race the popup closing and insert a
  // newline, breaking the clause for the next step
  await page.keyboard.type(' | fil')
  await expect(options.getByText('filter', { exact: true })).toBeVisible()
  await page.keyboard.type('ter')

  // fields of the get-ed timeseries complete inside the filter
  await page.keyboard.type(' chass')
  await expect(options.getByText('chassis_kind')).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(textbox).toContainText(
    'get hardware_component:fan_speed | filter chassis_kind'
  )
})

test('results can be copied as JSON or CSV', async ({ page }) => {
  await runQuery(page, oxqlQueries.basicTctl)

  // result summary is visible in the query card header
  await expect(page.getByText('1 timeseries', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Results actions' }).click()
  await page.getByRole('menuitem', { name: 'Copy as JSON' }).click()
  await expectToast(page, 'Results copied as JSON')

  await page.getByRole('button', { name: 'Results actions' }).click()
  await page.getByRole('menuitem', { name: 'Copy as CSV' }).click()
  await expectToast(page, 'Results copied as CSV')
})

test('copy actions are disabled before a query has run', async ({ page }) => {
  await page.getByRole('button', { name: 'Results actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Copy as JSON' })).toBeDisabled()
  await expect(page.getByRole('menuitem', { name: 'Copy as CSV' })).toBeDisabled()
})

test('empty query is blocked by client-side validation', async ({ page }) => {
  const textbox = page.getByRole('textbox')
  await textbox.fill('')
  await page.getByRole('button', { name: 'Run query' }).click()

  await expect(textbox).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByText('Enter a query').first()).toBeVisible()
  await expect(page.getByRole('figure')).toHaveCount(0)
})

test('a query the backend rejects surfaces an error instead of a chart', async ({
  page,
}) => {
  const textbox = page.getByRole('textbox')
  await textbox.fill('junk junk junk!')
  await page.getByRole('button', { name: 'Run query' }).click()

  // the server's parse error is shown below the editor, minus the caret
  // line, which assumes a monospace terminal
  const error = page.getByRole('alert')
  await expect(error).toContainText('Error at 1:1')
  await expect(error).toContainText('Expected: error at 1:1')
  await expect(error).not.toContainText('^')
  // and the editor border turns red
  await expect(textbox).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByRole('figure')).toHaveCount(0)
})

test('parse errors underline the offending spot in the editor', async ({ page }) => {
  const textbox = page.getByRole('textbox')
  await textbox.fill('get sled_data_link:bytes_sent | oops')
  await page.getByRole('button', { name: 'Run query' }).click()

  await expect(page.getByRole('alert')).toBeVisible()

  // the error underline has no semantic representation, so target the class
  const underlined = page.locator('.oxql-error-underline')
  await expect(underlined).toHaveText('oops')
  // guard against the mark existing but the CSS not applying
  await expect(underlined).toHaveCSS('text-decoration-line', 'underline')

  // editing the query invalidates the position, clearing the underline
  await textbox.pressSequentially('x')
  await expect(underlined).toBeHidden()
})

test('pages reads the initial query from the URL', async ({ page }) => {
  await page.goto(
    `/system/metrics-explorer?query=${encodeURIComponent(oxqlQueries.basicTctl)}`
  )
  const textbox = page.getByRole('textbox')
  // the editor is a contenteditable, so assert line by line rather than on value
  await expect(textbox).toContainText('get hardware_component:amd_cpu_tctl')
  await expect(textbox).toContainText('| filter timestamp > @now() - 1m')
})

test('pages writes the query to the URL after a successful run', async ({ page }) => {
  await page.goto('/system/metrics-explorer')
  await runQuery(page, oxqlQueries.basicTctl)

  await expect
    .poll(() => new URL(page.url()).searchParams.get('query'))
    .toBe(oxqlQueries.basicTctl)
})
