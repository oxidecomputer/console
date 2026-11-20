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
      '/login/default-silo/saml/mock-idp/redirect?redirect_uri=%2Fprojects%2Fmock-project%2Finstances'
    )
  })

  test('redirect_uri with a query string stays encoded', async ({ page }) => {
    const target = '/system/metrics?query=get vm:cpu | filter state == "run"'
    await page.goto(
      `/login/default-silo/saml/mock-idp?redirect_uri=${encodeURIComponent(target)}`
    )
    const button = page.getByRole('link', { name: 'Sign in with mock-idp' })
    const href = new URL((await button.getAttribute('href'))!, page.url()) // link always has href
    expect(href.pathname).toBe('/login/default-silo/saml/mock-idp/redirect')
    expect(href.searchParams.get('redirect_uri')).toBe(target)
    expect(href.search).not.toMatch(/[ |"]/)
  })
})
