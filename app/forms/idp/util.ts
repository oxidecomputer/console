/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// note: this lives in its own file for fast refresh reasons

/**
 * When given a full URL hostname for an Oxide silo, return the domain
 * (everything after `<silo>.sys.`). Placeholder logic should only apply
 * in local dev or Vercel previews.
 */
export const getDelegatedDomain = (location: { hostname: string }) =>
  location.hostname.split('.sys.')[1] || 'placeholder'
