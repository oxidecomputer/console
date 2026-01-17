/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from './utils'

import { clickRowAction, expectRowVisible } from './utils'

const token1 = '6e762538-dd89-454e-b6e7-82a199b6e51a'
const token2 = '9c858b30-bb11-4596-8c5e-c2bf1a26843e'
const token3 = '29b1d980-e0d3-4318-b714-4a1f3e7b191f'

test('Access tokens', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('User menu').click()
  await page.getByRole('menuitem', { name: 'Settings' }).click()
  await page.getByRole('link', { name: 'Access Tokens' }).click()

  await expect(page.getByRole('heading', { name: 'Access Tokens' })).toBeVisible()

  const table = page.getByRole('table')
  await expectRowVisible(table, {
    ID: token1,
    created: expect.stringContaining('May 27, 2025'),
    Expires: expect.stringContaining('Jul 3, 2025'),
  })
  await expectRowVisible(table, {
    ID: token2,
    created: expect.stringContaining('May 20, 2025'),
    Expires: expect.stringContaining('Aug 2, 2025'),
  })
  await expectRowVisible(table, {
    ID: token3,
    created: expect.stringContaining('May 31, 2025'),
    Expires: 'Never',
  })

  // Delete a token
  await clickRowAction(page, token1, 'Delete')
  await expect(page.getByRole('dialog').getByText('Cannot be undone')).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()

  // Token should be gone
  await expect(page.getByRole('cell', { name: token1 })).toBeHidden()

  // Other two tokens should still be there
  await expectRowVisible(table, { ID: token2 })
  await expectRowVisible(table, { ID: token3 })
})
