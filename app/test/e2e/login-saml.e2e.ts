/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from './utils'

test.describe('SAML login', () => {
  test('with valid credentials redirects', async ({ page }) => {
    await page.goto('/login/default-silo/saml/mock-idp')
    const button = page.getByRole('link', { name: 'Sign in with mock-idp' })
    await expect(button).toHaveAttribute(
      'href',
      '/login/default-silo/saml/mock-idp/redirect'
    )
  })

  test('with redirect_uri param redirects to last page', async ({ page }) => {
    await page.goto(
      '/login/default-silo/saml/mock-idp?redirect_uri=%2Fprojects%2Fmock-project%2Finstances'
    )
    const button = page.getByRole('link', { name: 'Sign in with mock-idp' })
    await expect(button).toHaveAttribute(
      'href',
      '/login/default-silo/saml/mock-idp/redirect?redirect_uri=/projects/mock-project/instances'
    )
  })
})
