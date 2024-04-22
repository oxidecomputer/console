/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from './utils'

test('session expiration', async ({ page }) => {
  await page.goto('/projects-new')

  // use special project name to trigger 401
  await page.getByRole('textbox', { name: 'Name' }).fill('e401')

  const toast = page.getByText('Session expired').nth(0)
  const signIn = page.getByRole('link', { name: 'Sign in' })
  await expect(toast).toBeHidden()
  await expect(signIn).toBeHidden()

  await page.getByRole('button', { name: 'Create project' }).click()
  await expect(toast).toBeVisible()
  await expect(signIn).toBeVisible()

  // TODO: test the behavior when you click on links that won't work because of
  // a 401. or at least they shouldn't work, they work now and take you to an
  // error page

  // The following is testing the mock API's behavior as much as it is testing
  // production logic. When we click sign in, we hit /login, which in production
  // is a server-side redirect in Nexus to the full login path. And when you
  // click sign in, in production that will go to the IdP, which will itself
  // then hit /login/{silo}/saml/{idp}/redirect, which again is a Nexus-side
  // redirect to whatever was in `redirect_uri`.
  //
  // Ideally we'd be doing those as proper redirects in the vite dev server, but
  // I found the introduction of an express server with middleware a bit heavy
  // for this small feature. So instead we do both redirects client-side with
  // routes that only exist in MSW mode. See mswLoginRedirects in routes.tsx.

  // clicking takes us to sign in
  await signIn.click()
  await expect(page).toHaveURL('/login/default-silo/saml/mock-idp?redirect_uri=%2Fprojects')
  await expect(page.getByText('default-silo')).toBeVisible()
  // signing in (fake) takes us back to the URL
  await page.getByRole('link', { name: 'Sign in with mock-idp' }).click()

  // TODO: this is actually a bug, it should be /projects-new, but clicking the
  // sign in button in the toast causes the modal to close. Not sure yet how to
  // avoid that
  await expect(page).toHaveURL('/projects')
})
