/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  clickRowAction,
  expect,
  expectNotVisible,
  expectRowVisible,
  expectVisible,
  getPageAsUser,
  test,
} from './utils'

test('SCIM tokens tab', async ({ page }) => {
  await page.goto('/system/silos/maze-war/scim')

  await expect(page.getByText('SCIM Tokens')).toBeVisible()

  const table = page.getByRole('table', { name: 'SCIM Tokens' })

  // Check that existing tokens are visible
  await expectRowVisible(table, { ID: 'a1b2c3d4…34567890' })
  await expectRowVisible(table, { ID: 'b2c3d4e5…45678901' })
})

test('Create SCIM token', async ({ page }) => {
  await page.goto('/system/silos/maze-war/scim')

  // Open create modal
  await page.getByRole('button', { name: 'Create token' }).click()

  const createModal = page.getByRole('dialog', { name: 'Create SCIM token' })
  await expect(createModal).toBeVisible()

  // Create the token
  await createModal.getByRole('button', { name: 'Create' }).click()

  // Creation modal should go away
  await expect(createModal).toBeHidden()

  // Now we have a new modal with the token in it
  const tokenCreatedModal = page.getByRole('dialog', { name: 'SCIM token created' })
  await expect(tokenCreatedModal).toBeVisible()

  // Check that the bearer token is visible and starts with oxide-scim-
  const bearerTokenDiv = tokenCreatedModal.getByText(/^oxide-scim-[a-f0-9]{40}$/)
  await expect(bearerTokenDiv).toBeVisible()
  const warning = tokenCreatedModal.getByText('You won’t see this token again')
  await expect(warning).toBeVisible()

  // Check that copy button is visible
  const copyButton = tokenCreatedModal.getByRole('button', { name: 'Click to copy' })
  await expect(copyButton).toBeVisible()

  // Dismiss the modal
  await tokenCreatedModal.getByRole('button', { name: 'Done' }).click()
  await expect(tokenCreatedModal).toBeHidden()

  // The token should NOT be visible in the table (bearer token is not shown
  // after creation), but a new row should exist. Check the table has 3 rows now
  // (header + 2 original + 1 new)
  const table = page.getByRole('table', { name: 'SCIM Tokens' })
  await expect(table.getByRole('row')).toHaveCount(4) // header + 3 tokens
})

test('Delete SCIM token', async ({ page }) => {
  await page.goto('/system/silos/maze-war/scim')

  const table = page.getByRole('table', { name: 'SCIM Tokens' })

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

test('Fleet viewer without silo admin cannot view SCIM tokens', async ({ browser }) => {
  // Jane Austen is a fleet viewer but not a silo admin on maze-war
  const page = await getPageAsUser(browser, 'Jane Austen')
  await page.goto('/system/silos/maze-war/scim')

  // Should see permission denied message
  await expectVisible(page, [
    page.getByRole('heading', { name: 'You do not have permission to view SCIM tokens' }),
    page.getByText('Only fleet admins and silo admins can view and manage SCIM tokens'),
  ])

  // Create token button should not be visible
  await expect(page.getByRole('button', { name: 'Create token' })).toBeHidden()

  // Table should not be visible
  await expect(page.getByRole('table', { name: 'SCIM Tokens' })).toBeHidden()
})
