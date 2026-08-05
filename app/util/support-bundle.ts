/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as R from 'remeda'

import { MiB } from './units'

/*
 * The generated API client only handles JSON responses, so the binary and
 * plain-text support bundle endpoints (download, index, per-file download) are
 * fetched directly. The browser sends the session cookie the same as any API
 * request.
 */

export const bundleDownloadUrl = (bundleId: string) =>
  `/experimental/v1/system/support-bundles/${bundleId}/download`

// file paths contain slashes, which must be encoded to fit in one path segment
export const bundleFileUrl = (bundleId: string, filePath: string) =>
  `${bundleDownloadUrl(bundleId)}/${encodeURIComponent(filePath)}`

const bundleIndexUrl = (bundleId: string) =>
  `/experimental/v1/system/support-bundles/${bundleId}/index`

/**
 * Parse the plain-text bundle index: newline-separated zip entry names, where
 * directories have a trailing slash.
 */
export const parseBundleIndex = (text: string): string[] =>
  text.split('\n').filter((line) => line.length > 0)

export type BundleDirEntry = { name: string; path: string; isDir: boolean }

/**
 * List the entries directly under `dir` (`''` for the root, otherwise a path
 * with a trailing slash). Directories sort before files. Directories are
 * derived from deeper entries too, so the listing is correct even if the index
 * omits explicit directory entries.
 */
export function lsBundleDir(entries: string[], dir: string): BundleDirEntry[] {
  const children = new Map<string, BundleDirEntry>()
  for (const entry of entries) {
    if (!entry.startsWith(dir) || entry === dir) continue
    const rest = entry.slice(dir.length)
    const slash = rest.indexOf('/')
    if (slash === -1) {
      children.set(rest, { name: rest, path: entry, isDir: false })
    } else {
      const name = rest.slice(0, slash)
      children.set(`${name}/`, { name, path: `${dir}${name}/`, isDir: true })
    }
  }
  return R.sortBy(
    [...children.values()],
    (e) => (e.isDir ? 0 : 1),
    (e) => e.name
  )
}

/** Files we render inline. Everything else (e.g., nested log zips) is download-only. */
export const isViewable = (filePath: string) => /\.(txt|json|log)$/.test(filePath)

export function triggerDownload(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}

export const MAX_INLINE_FILE_BYTES = 1 * MiB

export const bundleIndexQuery = (bundleId: string) => ({
  queryKey: ['supportBundleIndex', bundleId],
  queryFn: async ({ signal }: { signal: AbortSignal }) => {
    const res = await fetch(bundleIndexUrl(bundleId), { signal })
    if (!res.ok) throw new Error(`Error fetching bundle index (${res.status})`)
    return parseBundleIndex(await res.text())
  },
  // bundle contents never change once collection is complete
  staleTime: Infinity,
})

export type BundleFileContent = { kind: 'text'; text: string } | { kind: 'tooLarge' }

export const bundleFileQuery = (bundleId: string, filePath: string) => ({
  queryKey: ['supportBundleFile', bundleId, filePath],
  queryFn: async ({ signal }: { signal: AbortSignal }): Promise<BundleFileContent> => {
    const res = await fetch(bundleFileUrl(bundleId, filePath), { signal })
    if (!res.ok) throw new Error(`Error fetching file (${res.status})`)
    if (Number(res.headers.get('content-length')) > MAX_INLINE_FILE_BYTES) {
      await res.body?.cancel()
      return { kind: 'tooLarge' }
    }
    let text = await res.text()
    if (filePath.endsWith('.json')) {
      try {
        text = JSON.stringify(JSON.parse(text), null, 2)
      } catch {
        // not valid JSON, show it raw
      }
    }
    return { kind: 'text', text }
  },
  staleTime: Infinity,
})
