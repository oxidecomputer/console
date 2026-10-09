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

import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import { z } from 'zod/v4'

import { nexusSecurityHeaders } from './app/api/__generated__/nexus-console'

const ApiMode = z.enum(['msw', 'remote', 'nexus'])

function bail(msg: string): never {
  console.error(msg)
  process.exit(1)
}

const apiModeResult = ApiMode.default('nexus').safeParse(process.env.API_MODE)
if (!apiModeResult.success) {
  const options = ApiMode.options.join(', ')
  bail(`Error: API_MODE must be one of: [${options}]. If unset, default is "nexus".`)
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

// Serve the headers Nexus serves, snapshotted at the pinned omicron commit, so
// dev catches CSP violations. The nonce is only needed for local dev to avoid
// breaking Vite's script injection.
// Rather than use unsafe-inline all the time, the nonce approach is much more
// narrowly scoped and lets us make sure everything *else* works fine without
// unsafe-inline.
const cspNonce = randomBytes(8).toString('hex')
const devHeaders = {
  ...nexusSecurityHeaders,
  'content-security-policy': `${nexusSecurityHeaders['content-security-policy']}; script-src 'nonce-${cspNonce}' 'self'`,
}

// see https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  optimizeDeps: {
    entries: [
      'app/root.tsx',
      'app/entry.client.tsx',
      'app/{pages,forms,layouts}/**/*.tsx',
      '!app/**/*.spec.{ts,tsx}',
    ],
  },
  build: {
    // Must match `target` in tsconfig.json: tsc only checks against lib types
    // and nothing polyfills missing APIs, so the browser floor and the type
    // ceiling have to move together. Vite maps this to the oldest browsers
    // with full ES2024 support. We pin it because the default
    // (baseline-widely-available) drifts across Vite versions.
    target: 'es2024',
    emptyOutDir: true,
    sourcemap: true,
    // minify: false, // uncomment for debugging
    // prevent inlining assets as `data:`, which is not permitted by our Content-Security-Policy
    assetsInlineLimit: 0,
  },
  environments: {
    ssr: {
      define: {
        'process.env.CSP_NONCE': JSON.stringify(
          mode === 'production' ? undefined : cspNonce
        ),
      },
    },
  },
  define: {
    'process.env.VERCEL': JSON.stringify(!!process.env.VERCEL),
    'process.env.VERCEL_ENV': JSON.stringify(process.env.VERCEL_ENV),
    'process.env.THEME_INIT_HASH': JSON.stringify(
      createHash('sha256')
        .update(readFileSync(resolve(__dirname, 'public/assets/theme-init.js')))
        .digest('hex')
        .slice(0, 8)
    ),
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
    !process.env.VITEST && reactRouter(),
    apiMode === 'remote' && basicSsl(),
    apiMode === 'msw' && {
      // The console downloads support bundles with an <a download> navigation.
      // MSW's service worker bypasses navigation requests (see
      // app/util/support-bundle.ts), so the request would otherwise hit the
      // /v1 proxy and fail. Serve an empty zip so the download works in the
      // mock dev server and in e2e tests. Only GET: the HEAD the detail modal
      // uses for size goes through MSW as a normal fetch.
      name: 'mock-support-bundle-download',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const isDownload =
            req.method === 'GET' &&
            /^\/v1\/system\/support-bundles\/[^/]+\/download$/.test(req.url || '')
          if (!isDownload) return next()
          res.writeHead(200, { 'Content-Type': 'application/zip' })
          // end-of-central-directory record: the smallest valid (empty) zip
          res.end(Buffer.from('504b0506' + '00'.repeat(18), 'hex'))
        })
      },
    },
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
  test: {
    name: 'unit',
    fsModuleCache: true,
    // no DOM environment: anything needing a real DOM is a browser mode test
    environment: 'node',
    includeSource: ['app/**/*.ts'],
    exclude: [...configDefaults.exclude, '**/*.browser.spec.{ts,tsx}'],
  },
}))
