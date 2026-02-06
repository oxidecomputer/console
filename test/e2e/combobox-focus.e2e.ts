/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from './utils'

test('combobox clears query when user clicks outside', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  await expect(page.getByRole('heading', { name: /Create instance/ })).toBeVisible()

  const combobox = page.getByPlaceholder('Select a silo image', { exact: true })
  await combobox.click()
  await combobox.fill('hel')

  await expect(combobox).toHaveValue('hel')
  await expect(page.getByRole('option').first()).toBeVisible()

  // Click outside the combobox to close it
  await page.getByRole('heading', { name: /Create instance/ }).click()

  // The dropdown should close
  await expect(page.getByRole('option').first()).toBeHidden()

  // The query should be cleared since this was a deliberate close
  await expect(combobox).toHaveValue('')
})

// Regression test for https://github.com/oxidecomputer/console/issues/3012
test('combobox preserves query when document loses focus', async ({ page }) => {
  await page.goto('/projects/mock-project/instances-new')

  await expect(page.getByRole('heading', { name: /Create instance/ })).toBeVisible()

  const combobox = page.getByPlaceholder('Select a silo image', { exact: true })
  await combobox.click()
  await combobox.fill('hel')

  await expect(combobox).toHaveValue('hel')
  await expect(page.getByRole('option').first()).toBeVisible()

  // Simulate the document losing focus by mocking document.hasFocus() to return false
  // during the blur, then restoring it. This simulates what happens when switching tabs.
  await page.evaluate(() => {
    const originalHasFocus = document.hasFocus.bind(document)
    document.hasFocus = () => false

    const input = document.querySelector(
      'input[placeholder="Select a silo image"]'
    ) as HTMLInputElement
    if (input) {
      input.blur()
    }

    // Restore after a tick to allow event handlers to fire
    setTimeout(() => {
      document.hasFocus = originalHasFocus
    }, 50)
  })

  await page.waitForTimeout(100)

  // The query should be preserved since the document lost focus (like switching tabs)
  await expect(combobox).toHaveValue('hel')
})
