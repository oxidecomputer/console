/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// this is only a separate module so we can easily mock it in tests. jsdom
// doesn't support navigation

export function loginUrl(opts: { includeCurrent: boolean } = { includeCurrent: false }) {
  const { pathname, search } = window.location
  return opts.includeCurrent
    ? // TODO: include query args too?
      `/login?redirect_uri=${encodeURIComponent(pathname + search)}`
    : '/login'
}

export function navToLogin(opts: { includeCurrent: boolean }) {
  window.location.assign(loginUrl(opts))
}
