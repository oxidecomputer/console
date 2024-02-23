/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from './utils'

test.describe('login', () => {
  test('with valid credentials redirects', async ({ page }) => {
    await page.goto('/login/default-silo/local')
    await page.fill('input[name=username]', 'abc')
    await page.fill('input[name=password]', 'def')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/projects')
  })

  test('with redirect_uri param redirects to last page', async ({ page }) => {
    await page.goto(
      '/login/default-silo/local?redirect_uri=%2Fprojects%2Fmock-project%2Finstances'
    )
    await page.fill('input[name=username]', 'abc')
    await page.fill('input[name=password]', 'def')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/projects/mock-project/instances')
  })

  test('with valid credentials shows error', async ({ page }) => {
    await page.goto('/login/default-silo/local')
    await page.fill('input[name=username]', 'abc')
    await page.fill('input[name=password]', 'bad') // the Bad Password
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Could not sign in')).toBeVisible()
  })
})
