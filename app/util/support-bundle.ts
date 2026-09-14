/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { match } from 'ts-pattern'

import type { SupportBundleState } from '@oxide/api'

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

/**
 * Why the download is unavailable, or undefined if it is. The zip only exists
 * for an active bundle.
 */
export const downloadDisabledReason = (state: SupportBundleState) =>
  match(state)
    .with('active', () => undefined)
    .with('collecting', () => 'The bundle is still being collected')
    .with('failed', () => 'Bundle collection failed')
    .with('destroying', () => 'The bundle is being deleted')
    .exhaustive()

const SEC = 1000 // ms
/**
 * The list and detail modal both poll at this rate while any bundle is
 * `collecting` or `destroying`, and not at all otherwise. This is deliberately
 * simpler than the instance list, which caps fast polling with a timeout and
 * falls back to a slow poll. Collection takes minutes, but we don't really know
 * ahead of time how long, and there is no slow tier because nothing changes a
 * bundle's state without an operator action (unlike crashing or auto-restart
 * for instances). Bundles created elsewhere will show up on refresh. The
 * updated timestamp next to the refresh button make clear when the data is
 * really out of date.
 */
export const POLL_INTERVAL = 10 * SEC

function triggerDownload(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}

export function downloadBundle(bundleId: string) {
  triggerDownload(bundleDownloadUrl(bundleId), `support-bundle-${bundleId}.zip`)
}
