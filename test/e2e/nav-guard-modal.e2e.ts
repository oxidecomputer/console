/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, expectObscured, test } from './utils'

test('navigating away from SideModal form triggers nav guard', async ({ page }) => {
  const floatingIpsPage = '/projects/mock-project/floating-ips'
  // CSS locator for the form modal: when the confirmModal opens on top of
  // it, base-ui aria-hides the form modal (it's outside the inner dialog's
  // portal tree), so role-based locators can't find it.
  const formModal = page.locator('[role=dialog]:has(h2:text-is("Create floating IP"))')
  const confirmModal = page.getByRole('dialog', { name: 'Leave form?' })

  await page.goto(floatingIpsPage)

  // we don't have to force click here because it's not covered by the modal overlay yet
  await expect(formModal).toBeHidden()
  // CSS locator so we can still find the heading while the dialog is open —
  // base-ui sets aria-hidden on outside content, which hides it from the
  // accessibility tree that getByRole walks.
  const somethingOnPage = page.locator('h1:has-text("Floating IPs")')
  await somethingOnPage.click({ trial: true }) // test that it's not obscured

  // now open the modal
  await page.getByRole('link', { name: 'New Floating IP' }).click()
  await expectObscured(somethingOnPage) // it's covered by overlay
  await expect(formModal).toBeVisible()
  await formModal.getByRole('textbox', { name: 'Name' }).fill('my-floating-ip')

  // form is now dirty, so clicking away should trigger the nav guard
  // force: true allows us to click in that spot even though the thing is obscured
  await expect(confirmModal).toBeHidden()
  await somethingOnPage.click({ force: true })
  await expect(formModal).toBeVisible()
  await expect(confirmModal).toBeVisible()

  // go back to the form
  await page.getByRole('button', { name: 'Keep editing' }).click()
  await expect(confirmModal).toBeHidden()
  await expect(formModal).toBeVisible()

  // now try to navigate away again; verify that clicking the Escape key also triggers it
  await page.keyboard.press('Escape')
  await expect(confirmModal).toBeVisible()
  await page.getByRole('button', { name: 'Leave form' }).click()
  await expect(confirmModal).toBeHidden()
  await expect(formModal).toBeHidden()
  await expect(page).toHaveURL(floatingIpsPage)
})
