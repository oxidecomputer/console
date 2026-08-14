/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { queryOptions } from '@tanstack/react-query'

/*
 * The generated API client only handles JSON responses, so the binary bundle
 * download endpoint is hit directly with an anchor. The browser sends the
 * session cookie the same as any API request.
 */

export const bundleDownloadUrl = (bundleId: string) =>
  `/experimental/v1/system/support-bundles/${bundleId}/download`

const bundleIndexUrl = (bundleId: string) =>
  `/experimental/v1/system/support-bundles/${bundleId}/index`

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

/** Total bundle size from `Content-Length` on a HEAD of the download endpoint */
export const bundleSizeQuery = (bundleId: string) =>
  queryOptions({
    queryKey: ['supportBundleSize', bundleId],
    queryFn: async ({ signal }) => {
      const res = await fetch(bundleDownloadUrl(bundleId), { method: 'HEAD', signal })
      if (!res.ok) throw new Error(`Error fetching bundle size (${res.status})`)
      return Number(res.headers.get('content-length'))
    },
    staleTime: Infinity,
  })
