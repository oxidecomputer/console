/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/*
 * The generated API client only handles JSON responses, so the binary bundle
 * download endpoint is hit directly with an anchor. The browser sends the
 * session cookie the same as any API request.
 */

export const bundleDownloadUrl = (bundleId: string) =>
  `/experimental/v1/system/support-bundles/${bundleId}/download`

export function triggerDownload(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}
