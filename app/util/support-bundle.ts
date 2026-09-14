/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
/*
 * The generated API client only handles JSON responses, so the zip download
 * is a plain anchor navigation. The browser sends the session cookie the same
 * as any API request. The URL restates a path from the generated client; the
 * spec next to this file guards against it drifting when the API is
 * regenerated.
 *
 * Note this means downloads do not work against the mock API: the anchor
 * click is a download navigation, which MSW's service worker does not
 * intercept, so the request falls through to the dev server.
 */

export const bundleDownloadUrl = (bundleId: string) =>
  `/v1/system/support-bundles/${bundleId}/download`

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
