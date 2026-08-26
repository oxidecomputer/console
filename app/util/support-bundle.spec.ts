/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { afterEach, expect, it, vi } from 'vitest'

import { api } from '@oxide/api'

import { bundleDownloadUrl, bundleIndexUrl } from './support-bundle'

afterEach(() => vi.unstubAllGlobals())

// The download URL is used in an anchor navigation and the index is plain
// text, so neither request can go through the generated client, and their
// paths are restated in support-bundle.ts. Catch drift by comparing against
// the URLs the generated client actually requests.
it('hand-built bundle URLs match the generated client', async () => {
  const urls: string[] = []
  // the generated client always calls fetch with a URL string
  vi.stubGlobal('fetch', (url: string) => {
    urls.push(url)
    return Promise.resolve(new Response(null, { status: 204 }))
  })

  await api.supportBundleDownload({ path: { bundleId: 'bundle-id' } })
  await api.supportBundleIndex({ path: { bundleId: 'bundle-id' } })

  // 'http://testhost' is the client host under NODE_ENV=test (app/api/client.ts)
  expect(urls).toEqual([
    'http://testhost' + bundleDownloadUrl('bundle-id'),
    'http://testhost' + bundleIndexUrl('bundle-id'),
  ])
})
