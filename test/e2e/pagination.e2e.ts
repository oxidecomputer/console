/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test, type Page } from './utils'

import { PAGE_SIZE } from '~/api/client'

import { expectScrollTop, scrollTo } from './utils'

// expectRowVisible is too have for all this
const expectCell = (page: Page, name: string) =>
  expect(page.getByRole('cell', { name, exact: true })).toBeVisible()

test('pagination', async ({ page }) => {
  await page.goto('/projects/mock-project/snapshots')

  const table = page.getByRole('table')
  const rows = table.getByRole('rowgroup').last().getByRole('row')
  const nextButton = page.getByRole('button', { name: 'next' })
  const prevButton = page.getByRole('button', { name: 'prev', exact: true })
  const spinner = page.getByLabel('Pagination').getByLabel('Spinner')

  await expect(spinner).toBeHidden()
  await expect(prevButton).toBeDisabled() // we're on the first page

  await expectCell(page, 'snapshot-1')
  await expectCell(page, `disk-1-snapshot-${PAGE_SIZE}`)
  await expect(rows).toHaveCount(PAGE_SIZE)

  await scrollTo(page, 100)

  await nextButton.click()

  // spinner goes while the data is fetching...
  await expect(spinner).toBeVisible()
  await expectScrollTop(page, 100) // scroll resets to top on page change
  // ...and goes away roughly when scroll resets
  await expect(spinner).toBeHidden()
  await expectScrollTop(page, 0) // scroll resets to top on page change

  await expectCell(page, `disk-1-snapshot-${PAGE_SIZE + 1}`)
  await expectCell(page, `disk-1-snapshot-${2 * PAGE_SIZE}`)
  await expect(rows).toHaveCount(PAGE_SIZE)

  await nextButton.click()
  await expectCell(page, `disk-1-snapshot-${2 * PAGE_SIZE + 1}`)
  await expectCell(page, `disk-1-snapshot-${3 * PAGE_SIZE}`)
  await expect(rows).toHaveCount(PAGE_SIZE)

  await nextButton.click()
  await expectCell(page, `disk-1-snapshot-${3 * PAGE_SIZE + 1}`)
  await expectCell(page, 'disk-1-snapshot-167')
  await expect(rows).toHaveCount(17)
  await expect(nextButton).toBeDisabled() // no more pages

  await scrollTo(page, 250)

  await prevButton.click()
  await expect(spinner).toBeHidden({ timeout: 10 }) // no spinner, cached page
  await expect(rows).toHaveCount(PAGE_SIZE)
  await expectCell(page, `disk-1-snapshot-${2 * PAGE_SIZE + 1}`)
  await expectCell(page, `disk-1-snapshot-${3 * PAGE_SIZE}`)
  await expectScrollTop(page, 0) // scroll resets to top on prev too

  await nextButton.click()
  await expect(spinner).toBeHidden({ timeout: 10 }) // no spinner, cached page
})
