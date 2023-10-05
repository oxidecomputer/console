/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { forEach } from './utils'

// This could easily be done as a testing-lib test but I want it in a real
// table. The .is-selected asserts are slightly brittle (and contrary to our
// usual testing philosophy), but they let us make sure selection is being
// passed through to the UI Table.

// skipped for now because we no longer have any live multiselect tables to test
// with. TODO: make it a testing-lib test instead?
// eslint-disable-next-line playwright/no-skipped-test
test.skip('Row multiselect works as expected', async ({ page }) => {
  // SETUP

  const headCheckbox = page.locator('thead >> role=checkbox')
  const headMixed = page.locator('thead >> role=checkbox[checked="mixed"]')

  const expectHeadMixed = async () => {
    await expect(headCheckbox).not.toBeChecked()
    await expect(headMixed).toHaveCount(1)
  }
  const expectHeadNotMixed = async () => {
    await expect(headCheckbox).not.toBeChecked()
    await expect(headMixed).toHaveCount(0)
  }

  const bodyCheckboxes = page.locator('tbody >> role=checkbox')

  const expectRowsAllChecked = () =>
    forEach(bodyCheckboxes, (ch) => expect(ch).toBeChecked())
  const expectRowsAllUnchecked = () =>
    forEach(bodyCheckboxes, (ch) => expect(ch).not.toBeChecked())

  // ACTUAL TEST

  await page.goto('/projects/mock-project/vpcs/mock-vpc?tab=firewall-rules')

  // baseline empty state
  await expect(headCheckbox).toHaveCount(1)
  await expect(headCheckbox).not.toBeChecked()
  await expectHeadNotMixed()

  await expect(bodyCheckboxes).toHaveCount(4)
  await expectRowsAllUnchecked()
  await expect(page.locator('.is-selected')).toHaveCount(0)

  // check first row, header is now mixed
  await bodyCheckboxes.first().check()
  await expect(page.locator('.is-selected')).toHaveCount(1)
  await expectHeadMixed()

  // uncheck first row, header goes back to empty
  await bodyCheckboxes.first().uncheck()
  await expectHeadNotMixed()
  await expect(page.locator('.is-selected')).toHaveCount(0)

  // can also uncheck the row by checking and unchecking the header checkbox
  await bodyCheckboxes.first().check()
  await headCheckbox.click() // first click selects all
  await expectRowsAllChecked()
  await expect(page.locator('.is-selected')).toHaveCount(4)
  await headCheckbox.click() // second click unselects all
  await expectRowsAllUnchecked()

  // check 3 checkboxes, header stays mixed
  await bodyCheckboxes.nth(0).check()
  await bodyCheckboxes.nth(1).check()
  await bodyCheckboxes.nth(2).check()
  await expect(page.locator('.is-selected')).toHaveCount(3)
  await expectHeadMixed()

  // check the 4th and it switches to checked
  await bodyCheckboxes.nth(3).check()
  await expect(headCheckbox).toBeChecked()
  await expect(page.locator('.is-selected')).toHaveCount(4)
})
