/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { expectVisible } from './utils'

test.describe('Project create', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects-new')
  })

  test('contains expected elements', async ({ page }) => {
    await expectVisible(page, [
      'role=heading[name*="Create project"]', // TODO: standardize capitalization
      'role=textbox[name="Name"]',
      'role=textbox[name="Description"]',
      'role=button[name="Create project"]',
    ])
  })

  test('navigates back to project instances page on success', async ({ page }) => {
    await page.fill('role=textbox[name="Name"]', 'mock-project-2')
    await page.click('role=button[name="Create project"]')
    await expect(page).toHaveURL('/projects/mock-project-2/instances')
  })

  test('shows field-level validation error and does not POST', async ({ page }) => {
    await page.fill('role=textbox[name="Name"]', 'no-ending-dash-')

    // submit to trigger validation
    await page.getByRole('button', { name: 'Create project' }).click()

    await expect(
      page.getByText('Must end with a letter or number', { exact: true }).nth(0)
    ).toBeVisible()
  })

  test('shows form-level error for known server error', async ({ page }) => {
    await page.fill('role=textbox[name="Name"]', 'mock-project') // already exists
    await page.click('role=button[name="Create project"]')
    await expectVisible(page, ['text="Project name already exists"'])
  })

  // TODO: figure these out

  // it('shows message for known error code in global code map', async () => {
  //   overrideOnce('post', projectsUrl, 403, { error_code: 'Forbidden' })
  //   renderAppAt(formUrl)
  //   await enterName('mock-project-2')
  //   clickByRole('button', 'Create project')
  //   await screen.findByText('Action not authorized')
  //   expect(window.location.pathname).toEqual(formUrl) // don't nav away
  // })

  // it('shows generic message for unknown server error', async () => {
  //   overrideOnce('post', projectsUrl, 400, { error_code: 'UnknownCode' })
  //   renderAppAt(formUrl)
  //   await enterName('mock-project-2')
  //   clickByRole('button', 'Create project')
  //   await screen.findByText('Unknown error from server')
  //   expect(window.location.pathname).toEqual(formUrl) // don't nav away
  // })
})
