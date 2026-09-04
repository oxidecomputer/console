/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Keep the static SPA compatible with Nexus's external-script-only CSP. */
export function externalizeScripts(html: string) {
  const scripts = new Map<string, string>()
  const output = html.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/g,
    (tag, attrs: string, source: string) => {
      if (/(?:^|\s)src\s*=/.test(attrs) || !source.trim()) return tag
      const type = attrs.match(/(?:^|\s)type=["']([^"']+)["']/)?.[1]
      if (type && type !== 'module' && type !== 'text/javascript') {
        throw new Error(`Cannot externalize a SPA script with type ${type}`)
      }
      const hash = createHash('sha256').update(source).digest('hex').slice(0, 16)
      const filename = `bootstrap-${hash}.js`
      scripts.set(filename, source)
      return `<script${attrs} data-spa-script src="/assets/${filename}"></script>`
    }
  )
  return { html: output, scripts }
}

export async function externalizeSpaScripts(clientDirectory: string) {
  const index = join(clientDirectory, 'index.html')
  const { html, scripts } = externalizeScripts(await readFile(index, 'utf8'))
  await Promise.all(
    [...scripts].map(([filename, source]) =>
      writeFile(join(clientDirectory, 'assets', filename), source)
    )
  )
  await writeFile(index, html)
}
