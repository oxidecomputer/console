/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { randomBytes } from 'crypto'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import tsconfigPaths from 'vite-tsconfig-paths'
import { z } from 'zod/v4'

import vercelConfig from './vercel.json'

const KiB = 1024

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

const previewAnalyticsTag = {
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
}

const previewMetaTag = [
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
    rollupOptions: {
      // default entrypoint for vite is '<root>/index.html', so we don't have to set it
      output: {
        // React Router automatically splits any route module into its own file,
        // but some end up being like 300 bytes. It feels silly to have several
        // hundred of those, so we set a minimum size to end up with fewer.
        // https://rollupjs.org/configuration-options/#output-experimentalminchunksize
        experimentalMinChunkSize: 30 * KiB,
      },
    },
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
    tsconfigPaths(),
    createHtmlPlugin({
      inject: {
        tags: process.env.VERCEL ? [previewAnalyticsTag, ...previewMetaTag] : [],
      },
    }),
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
  preview: { headers },
  test: {
    environment: 'jsdom',
    setupFiles: ['test/unit/setup.ts'],
    includeSource: ['app/**/*.ts'],
  },
}))
