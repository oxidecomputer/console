/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test, type Page, type Locator } from '@playwright/test'

import { oxqlQueries } from './oxql-queries'
import { selectOption } from './utils'

const runQuery = async (page: Page, query?: string) => {
  if (query !== undefined) await page.getByRole('textbox').fill(query)
  await page.getByRole('button', { name: 'Run query' }).click()

  const loading = page.getByLabel('Chart loading')
  await expect(loading).toBeVisible()
  await expect(loading).toBeHidden()
  await expect(page.getByText('Query failed')).toBeHidden()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/system/oxql')
  await expect(page.getByRole('heading', { name: 'OxQL Explorer' })).toBeVisible()
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

test('picking an example populates the query and renders a chart', async ({ page }) => {
  await selectOption(
    page,
    page.getByRole('button', { name: 'Load an example' }),
    'Power shelf fan speeds'
  )
  await expect(page.getByRole('textbox')).toHaveValue(/get hardware_component:fan_speed/)

  await runQuery(page)
  await expect(page.getByRole('figure').first()).toBeVisible()
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
  await page.getByRole('textbox').fill('junk junk junk!')
  await page.getByRole('button', { name: 'Run query' }).click()

  await expect(page.getByText('Query failed')).toBeVisible()
  await expect(page.getByRole('figure')).toHaveCount(0)
})

test('pages reads the initial query from the URL', async ({ page }) => {
  await page.goto(`/system/oxql?query=${encodeURIComponent(oxqlQueries.basicTctl)}`)
  await expect(page.getByRole('textbox')).toHaveValue(oxqlQueries.basicTctl)
})

test('pages writes the query to the URL after a successful run', async ({ page }) => {
  await page.goto('/system/oxql')
  await runQuery(page, oxqlQueries.basicTctl)

  await expect
    .poll(() => new URL(page.url()).searchParams.get('query'))
    .toBe(oxqlQueries.basicTctl)
})
