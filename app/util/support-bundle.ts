/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { queryOptions } from '@tanstack/react-query'

import { api } from '@oxide/api'

/*
 * The generated API client only handles JSON responses, so the zip download
 * is a plain anchor navigation and the plain-text index is a raw fetch. The
 * browser sends the session cookie the same as any API request. These URLs
 * restate paths from the generated client; the spec next to this file guards
 * against them drifting when the API is regenerated.
 *
 * Note this means downloads do not work against the mock API: the anchor
 * click is a download navigation, which MSW's service worker does not
 * intercept, so the request falls through to the dev server.
 */

export const bundleDownloadUrl = (bundleId: string) =>
  `/v1/system/support-bundles/${bundleId}/download`

export const bundleIndexUrl = (bundleId: string) =>
  `/v1/system/support-bundles/${bundleId}/index`

export const DOWNLOAD_DISABLED_REASON =
  'Only bundles that have completed collection can be downloaded'

function triggerDownload(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}

export function downloadBundle(bundleId: string) {
  triggerDownload(bundleDownloadUrl(bundleId), `support-bundle-${bundleId}.zip`)
}

/**
 * The index is the bundle zip's entry names, one per line, where directory
 * entries have a trailing slash.
 * https://github.com/oxidecomputer/omicron/blob/99249b4/sled-agent/src/support_bundle/storage.rs#L1029-L1035
 */
export const bundleIndexQuery = (bundleId: string) =>
  queryOptions({
    queryKey: ['supportBundleIndex', bundleId],
    queryFn: async ({ signal }) => {
      const res = await fetch(bundleIndexUrl(bundleId), { signal })
      if (!res.ok) throw new Error(`Error fetching bundle index (${res.status})`)
      const text = await res.text()
      return text.split('\n').filter((line) => line.length > 0)
    },
    // bundle contents never change once collection is complete
    staleTime: Infinity,
  })

/**
 * Total bundle size from `Content-Length` on a HEAD of the download endpoint.
 * A HEAD response has no body, so the JSON-only generated client handles it.
 */
export const bundleSizeQuery = (bundleId: string) =>
  queryOptions({
    queryKey: ['supportBundleSize', bundleId],
    queryFn: async () => {
      const result = await api.supportBundleHead({ path: { bundleId } })
      if (result.type !== 'success') {
        throw new Error(`Error fetching bundle size (${result.response.status})`)
      }
      // handle missing/malformed headers, rather than showing `0 B`
      const size = Number(result.response.headers.get('content-length'))
      if (!size) throw new Error('Bundle size missing from response')
      return size
    },
    staleTime: Infinity,
  })
