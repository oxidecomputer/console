/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

type Page = keyof typeof import('./index.ts')

export const lazySystemPage = (page: Page) => () =>
  import('./index.ts').then((mod) => mod[page])

/** for the weird little redirect routes where we only want the loader */
export const lazySystemPageLoader = (page: Page) => () =>
  import('./index.ts').then((mod) => ({ loader: mod[page].loader }))
