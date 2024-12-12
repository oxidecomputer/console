/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test, type Page } from '@playwright/test'

import { expectNotVisible } from './utils'

const openActionMenu = async (page: Page) => {
  // open the action menu (use the sidenav button, as keyboard events aren't reliable in Playwright)
  await page.getByRole('button', { name: 'JUMP TO' }).click()
  // make sure the action menu modal is visible
  await expect(page.getByRole('heading', { name: 'Actions' })).toBeVisible()
}

test('Ensure that the Enter key in the ActionMenu doesn’t prematurely submit a linked form', async ({
  page,
}) => {
  await page.goto('/system/silos')
  await openActionMenu(page)
  // "New silo" is the first item in the list, so we can just hit enter to open the modal
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: 'Create silo' })).toBeVisible()
  // make sure error text is not visible
  await expectNotVisible(page, [page.getByText('Name is required')])
})
