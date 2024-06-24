/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { expectRowVisible } from './utils'

test('pagination', async ({ page }) => {
  await page.goto('/projects/mock-project/snapshots')

  const table = page.getByRole('table')
  const rows = page.getByRole('row')
  const nextButton = page.getByRole('button', { name: 'next' })
  const prevButton = page.getByRole('button', { name: 'prev', exact: true })

  await expect(rows).toHaveCount(26)
  await expectRowVisible(table, { name: 'snapshot-1' })
  await expectRowVisible(table, { name: 'disk-1-snapshot-24' })

  await nextButton.click()
  await expect(rows).toHaveCount(7)
  await expectRowVisible(table, { name: 'disk-1-snapshot-25' })
  await expectRowVisible(table, { name: 'disk-1-snapshot-30' })

  await prevButton.click()
  await expect(rows).toHaveCount(26)
  await expectRowVisible(table, { name: 'snapshot-1' })
  await expectRowVisible(table, { name: 'disk-1-snapshot-24' })

  await nextButton.click()
  await expect(nextButton).toBeDisabled() // no more pages
})
