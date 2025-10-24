/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { clickRowAction, expectNotVisible, expectRowVisible, expectVisible } from './utils'

test('SCIM tokens tab', async ({ page }) => {
  await page.goto('/system/silos/maze-war/scim')

  await expectVisible(page, [
    page.getByText('SCIM Bearer Tokens'),
    page.getByText('Manage authentication tokens for SCIM identity provisioning'),
  ])

  const table = page.getByRole('table', { name: 'SCIM Bearer Tokens' })

  // Check that existing tokens are visible
  await expectRowVisible(table, { ID: 'a1b2c3d4…34567890' })
  await expectRowVisible(table, { ID: 'b2c3d4e5…45678901' })
})

test('Create SCIM token', async ({ page }) => {
  await page.goto('/system/silos/maze-war/scim')

  // Open create modal
  await page.getByRole('button', { name: 'Create token' }).click()

  const createModal = page.getByRole('dialog', { name: 'Create token' })
  const modalMessage = 'This token will have access to provision users and groups via SCIM'
  const createMessage = createModal.getByText(modalMessage)
  await expect(createModal).toBeVisible()

  // Check info message is visible
  await expect(createMessage).toBeVisible()

  // Create the token
  await createModal.getByRole('button', { name: 'Create' }).click()

  // Creation modal should go away
  await expect(createMessage).toBeHidden()

  // Check that the warning message is visible
  const warning = createModal.getByText("This is the only time you'll see this token")
  await expect(warning).toBeVisible()

  // Check that the bearer token is visible and starts with scim_
  const bearerTokenDiv = createModal.getByText(/^scim_[a-f0-9]{32}$/)
  await expect(bearerTokenDiv).toBeVisible()

  // Check that copy button is visible
  const copyButton = createModal.getByRole('button', { name: 'Click to copy' })
  await expect(copyButton).toBeVisible()

  // Dismiss the modal
  await createModal.getByRole('button', { name: 'Done' }).click()
  await expect(createModal).toBeHidden()

  // The token should NOT be visible in the table (bearer token is not shown after creation)
  // But a new row should exist - check the table has 3 rows now (header + 2 original + 1 new)
  const table = page.getByRole('table', { name: 'SCIM Bearer Tokens' })
  await expect(table.getByRole('row')).toHaveCount(4) // header + 3 tokens
})

test('Delete SCIM token', async ({ page }) => {
  await page.goto('/system/silos/maze-war/scim')

  const table = page.getByRole('table', { name: 'SCIM Bearer Tokens' })

  // Verify initial state - should have 2 tokens
  await expect(table.getByRole('row')).toHaveCount(3) // header + 2 tokens

  // Delete the first token
  await clickRowAction(page, 'a1b2c3d4', 'Delete')

  // Confirm deletion modal should appear
  const confirmModal = page.getByRole('dialog', { name: 'Confirm delete' })
  await expect(confirmModal).toBeVisible()
  await expect(confirmModal.getByText('Are you sure you want to delete')).toBeVisible()

  await confirmModal.getByRole('button', { name: 'Confirm' }).click()

  // Modal should close
  await expect(confirmModal).toBeHidden()

  // Table should now only have 1 row
  await expect(table.getByRole('row')).toHaveCount(2) // header + 1 token

  // The deleted token should not be visible
  await expectNotVisible(page, [page.getByText('a1b2c3d4…34567890')])

  // The other token should still be visible
  await expectRowVisible(table, { ID: 'b2c3d4e5…45678901' })

  // Delete the second token
  await clickRowAction(page, 'b2c3d4e5', 'Delete')
  await confirmModal.getByRole('button', { name: 'Confirm' }).click()

  // Empty state should be visible
  await expectVisible(page, [
    page.getByText('No SCIM tokens'),
    page.getByText('Create a token to see it here'),
  ])
})
