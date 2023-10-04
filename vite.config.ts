/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import { z } from 'zod'

import { dotPathFixPlugin } from './libs/vite-plugin-dot-path-fix'
import tsConfig from './tsconfig.json'

const ApiMode = z.enum(['msw', 'dogfood', 'nexus'])

const apiModeResult = ApiMode.default('nexus').safeParse(process.env.API_MODE)
if (!apiModeResult.success) {
  const options = ApiMode.options.join(', ')
  console.error(`Error: API_MODE must be one of: [${options}]. If unset, default is "msw".`)
  process.exit(1)
}
/**
 * What API are we talking to? Only relevant in development mode.
 *
 * - `msw` (default): Mock Service Worker
 * - `dogfood`: Dogfood rack at oxide.sys.rack2.eng.oxide.computer. Requires VPN.
 * - `nexus`: Builds for production, assumes Nexus at localhost:12220 in dev mode only
 */
const apiMode = apiModeResult.data

const DOGFOOD_HOST = 'oxide.sys.rack2.eng.oxide.computer'

const mapObj = <V0, V>(
  obj: Record<string, V0>,
  kf: (t: string) => string,
  vf: (t: V0) => V
): Record<string, V> =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [kf(k), vf(v)]))

/** Match a semver string like 1.0.0-abc */
const semverRegex = '\\d+\\.\\d+\\.\\d+([\\-\\+].+)?'

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

// see https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    // minify: false, // uncomment for debugging
    rollupOptions: {
      input: {
        app: 'index.html',
      },
    },
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
    createHtmlPlugin({
      inject: {
        tags: process.env.VERCEL ? [previewAnalyticsTag] : [],
      },
    }),
    react(),
    dotPathFixPlugin([new RegExp('^/system/update/updates/' + semverRegex)]),
    apiMode === 'dogfood' && basicSsl(),
  ],
  resolve: {
    // turn relative paths from tsconfig into absolute paths
    // replace is there to turn
    //   "app/*" => "app/*"
    // into
    //   "app" => "app"
    alias: mapObj(
      tsConfig.compilerOptions.paths,
      (k) => k.replace('/*', ''),
      (paths) => resolve(__dirname, paths[0].replace('/*', ''))
    ),
  },
  server: {
    port: 4000,
    https: apiMode === 'dogfood',
    // these only get hit when MSW doesn't intercept the request
    proxy: {
      '/v1': {
        target:
          apiMode === 'dogfood' ? `https://${DOGFOOD_HOST}` : 'http://localhost:12220',
        changeOrigin: true,
      },
      '^/v1/instances/[^/]+/serial-console/stream': {
        target:
          // in msw mode, serial console is served by tools/deno/mock-serial-console.ts
          apiMode === 'dogfood'
            ? `wss://${DOGFOOD_HOST}`
            : 'ws://127.0.0.1:' + (apiMode === 'msw' ? 6036 : 12220),
        changeOrigin: true,
        ws: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['app/test/unit/setup.ts'],
    includeSource: ['app/**/*.ts', 'libs/**/*.ts'],
  },
}))
