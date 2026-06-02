/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { expectToast, getPageAsUser } from './utils'

// The jumbo-frames opt-in is fleet-wide and there's no operator UI to flip it,
// so the mock keys it off the logged-in user: the default user sees it disabled,
// 'Hans Jonas' sees it enabled. See jumboFramesOptIn in mock-api/msw/util.ts.

// The Settings tab has several cards each with their own Save button, so scope
// to the jumbo frames form via its unique checkbox.
function jumboForm(page: Page) {
  const checkbox = page.getByRole('checkbox', { name: 'Enable jumbo frames' })
  const form = page.locator('form').filter({ has: checkbox })
  return { checkbox, save: form.getByRole('button', { name: 'Save' }) }
}

test('Jumbo frames update rejected when fleet opt-in disabled', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1')
  await page.getByRole('tab', { name: 'settings' }).click()

  const { checkbox, save } = jumboForm(page)
  await expect(checkbox).not.toBeChecked()
  await expect(save).toBeDisabled()

  await checkbox.check()
  await expect(save).toBeEnabled()
  await save.click()

  await expectToast(page, 'Could not update jumbo frames setting')
})

test('Jumbo frames can be toggled when fleet opt-in enabled', async ({ browser }) => {
  const page = await getPageAsUser(browser, 'Hans Jonas')
  await page.goto('/projects/mock-project/instances/db1')
  await page.getByRole('tab', { name: 'settings' }).click()

  const { checkbox, save } = jumboForm(page)
  await expect(checkbox).not.toBeChecked()
  await expect(save).toBeDisabled()

  await checkbox.check()
  await save.click()
  await expectToast(page, 'Jumbo frames enabled for this instance')
  await expect(checkbox).toBeChecked()
  await expect(save).toBeDisabled()

  // and back off again
  await checkbox.uncheck()
  await save.click()
  await expectToast(page, 'Jumbo frames disabled for this instance')
  await expect(checkbox).not.toBeChecked()
})
