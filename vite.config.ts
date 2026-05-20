/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createHash, randomBytes } from 'crypto'
import { readFileSync } from 'fs'
import { resolve } from 'path'

import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import MagicString from 'magic-string'
import { defineConfig, type Plugin } from 'vite'
import { z } from 'zod/v4'

import vercelConfig from './vercel.json'

const ApiMode = z.enum(['msw', 'remote', 'nexus'])

function bail(msg: string): never {
  console.error(msg)
  process.exit(1)
}

const apiModeResult = ApiMode.default('nexus').safeParse(process.env.API_MODE)
if (!apiModeResult.success) {
  const options = ApiMode.options.join(', ')
  bail(`Error: API_MODE must be one of: [${options}]. If unset, default is "msw".`)
}
/**
 * What API are we talking to? Only relevant in development mode.
 *
 * - `msw` (default): Mock Service Worker
 * - `dogfood`: Dogfood rack at oxide.sys.rack2.eng.oxide.computer. Requires VPN.
 * - `nexus`: Builds for production, assumes Nexus at localhost:12220 in dev mode only
 */
const apiMode = apiModeResult.data

if (apiMode === 'remote' && !process.env.EXT_HOST) {
  bail(`Error: EXT_HOST is required when API_MODE=remote. See package.json for examples.`)
}

const EXT_HOST = process.env.EXT_HOST

/**
 * React Refresh disables HMR for any module that exports non-component values
 * (lowercase identifiers, plain objects). Our route modules export
 * `clientLoader`, `handle`, and (rarely) `shouldRevalidate` alongside the
 * default component, which trips this check. This plugin strips those exports
 * and re-attaches them as properties of the default component, so the only
 * surviving named export is `ErrorBoundary` (PascalCase, refresh-compatible).
 * Routes consume them via `m.default.clientLoader` etc. — see `convert()` in
 * `app/routes.tsx`.
 *
 * Must run before @vitejs/plugin-react (which is where the react-refresh
 * transform happens), so this plugin uses `enforce: 'pre'`.
 */
function routeExportsPlugin(): Plugin {
  const ATTACHABLE = ['clientLoader', 'handle', 'shouldRevalidate'] as const
  return {
    name: 'route-exports',
    enforce: 'pre',
    transform(code, id) {
      if (!/\/app\/(pages|layouts|forms)\//.test(id)) return
      if (!/\.tsx?$/.test(id)) return

      const defaultMatch = code.match(/^export default function (\w+)\s*\(/m)
      if (!defaultMatch) return
      const componentName = defaultMatch[1]

      const s = new MagicString(code)
      const attached: string[] = []

      // Match both `export (async )?function NAME(...)` and
      // `export const NAME = ...` forms. SerialConsoleLayout/ProjectLayout
      // re-export their clientLoader from ProjectLayoutBase via the const form.
      const patterns: Record<(typeof ATTACHABLE)[number], RegExp> = {
        clientLoader: /^export\s+(?:(?:async\s+)?function\s+|const\s+)clientLoader\b/m,
        handle: /^export\s+const\s+handle\b/m,
        shouldRevalidate: /^export\s+const\s+shouldRevalidate\b/m,
      }

      for (const name of ATTACHABLE) {
        const m = patterns[name].exec(code)
        if (m && m.index !== undefined) {
          s.remove(m.index, m.index + 'export '.length)
          attached.push(name)
        }
      }

      if (attached.length === 0) return

      const assigns = attached.map((n) => `${componentName}.${n} = ${n}`).join('\n')
      s.append(`\n\n${assigns}\n`)

      return { code: s.toString(), map: s.generateMap({ hires: true }) }
    },
  }
}

const previewTags = [
  {
    injectTo: 'head' as const,
    tag: 'script',
    attrs: {
      'data-domain':
        process.env.VERCEL_ENV === 'production'
          ? 'oxide-console-preview.vercel.app'
          : // not a real domain. we're only using it to distinguish prod
            // from preview traffic in plausible
            'console-pr-preview.vercel.app',
      defer: true,
      src: '/viewscript.js',
    },
  },
  {
    injectTo: 'head' as const,
    tag: 'meta',
    attrs: {
      property: 'og:image',
      content: '/assets/og-preview-image.webp',
    },
  },
  {
    injectTo: 'head' as const,
    tag: 'meta',
    attrs: {
      property: 'og:description',
      content: 'Preview of the Oxide web console with in-browser mock API',
    },
  },
]

// vercel config is source of truth for headers
const vercelHeaders = vercelConfig.headers[0].headers
const headers = Object.fromEntries(vercelHeaders.map((h) => [h.key, h.value]))

// This is only needed for local dev to avoid breaking Vite's script injection.
// Rather than use unsafe-inline all the time, the nonce approach is much more
// narrowly scoped and lets us make sure everything *else* works fine without
// unsafe-inline.
const cspNonce = randomBytes(8).toString('hex')
const csp = headers['content-security-policy']
const devHeaders = {
  ...headers,
  'content-security-policy': `${csp}; script-src 'nonce-${cspNonce}' 'self'`,
}

// see https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    // minify: false, // uncomment for debugging
    // prevent inlining assets as `data:`, which is not permitted by our Content-Security-Policy
    assetsInlineLimit: 0,
  },
  define: {
    'process.env.MSW': JSON.stringify(apiMode === 'msw'),
    // we don't want to have to look at this banner all day
    'process.env.MSW_BANNER': JSON.stringify(apiMode === 'msw' && mode === 'production'),
    // used in production build to console.log the SHA at page load
    'process.env.SHA': JSON.stringify(process.env.SHA),
    // used by MSW — number for % likelihood of API request failure (decimals allowed)
    'process.env.CHAOS': JSON.stringify(mode !== 'production' && process.env.CHAOS),
  },
  plugins: [
    tailwindcss(),
    {
      name: 'inject-html-tags',
      transformIndexHtml: () => (process.env.VERCEL ? previewTags : []),
    },
    {
      // Inject theme-init.js as a classic (non-module) render-blocking script
      // so it sets data-theme before first paint. It lives in public/assets/
      // so it passes CSP default-src 'self' and is served by the /assets/*
      // route in Nexus. We inject it here rather than putting it in index.html
      // because Vite tries to bundle any <script src> it finds there. Content
      // hash query param handles cache-busting since public/ files aren't
      // fingerprinted by Vite.
      name: 'theme-init',
      transformIndexHtml() {
        const content = readFileSync(resolve(__dirname, 'public/assets/theme-init.js'))
        const hash = createHash('sha256').update(content).digest('hex').slice(0, 8)
        return [
          {
            injectTo: 'head-prepend',
            tag: 'script',
            attrs: { src: `/assets/theme-init.js?v=${hash}` },
          },
        ]
      },
    },
    routeExportsPlugin(),
    react(),
    apiMode === 'remote' && basicSsl(),
  ],
  html: {
    // don't include a placeholder nonce in production.
    // use a CSP nonce in dev to avoid needing to permit 'unsafe-inline'
    cspNonce: mode === 'production' ? undefined : cspNonce,
  },
  server: {
    port: 4000,
    headers: devHeaders,
    // these only get hit when MSW doesn't intercept the request
    proxy: {
      '/v1': {
        target: apiMode === 'remote' ? `https://${EXT_HOST}` : 'http://localhost:12220',
        changeOrigin: true,
      },
    },
  },
  resolve: { tsconfigPaths: true },
  preview: { headers },
  test: {
    environment: 'jsdom',
    setupFiles: ['test/unit/setup.ts'],
    includeSource: ['app/**/*.ts'],
  },
}))
