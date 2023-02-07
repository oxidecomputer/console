import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

import { dotPathFixPlugin } from './libs/vite-plugin-dot-path-fix'
import tsConfig from './tsconfig.json'

// exclamation point required to not get minified out
const banner = `/*!
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at https://mozilla.org/MPL/2.0/.
*
* Copyright 2023 Oxide Computer Company
*/`

const mapObj = <V0, V>(
  obj: Record<string, V0>,
  kf: (t: string) => string,
  vf: (t: V0) => V
): Record<string, V> =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [kf(k), vf(v)]))

/** Match a semver string like 1.0.0-abc */
const semverRegex = '\\d+\\.\\d+\\.\\d+([\\-\\+].+)?'

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
      output: {
        banner,
      },
    },
  },
  define: {
    'process.env.API_URL': JSON.stringify(process.env.API_URL ?? '/api'),
    'process.env.MSW': JSON.stringify(mode !== 'production' && process.env.MSW),
    'process.env.SHA': JSON.stringify(process.env.SHA),
    // used by MSW — number for % likelihood of API request failure (decimals allowed)
    'process.env.CHAOS': JSON.stringify(mode !== 'production' && process.env.CHAOS),
  },
  plugins: [
    react({
      babel: {
        plugins:
          mode === 'development' ? ['./libs/babel-transform-react-display-name'] : [],
      },
    }),
    dotPathFixPlugin([new RegExp('^/sys/update/updates/' + semverRegex)]),
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
    // these only get hit when MSW isn't intercepting requests
    proxy: {
      '/api': {
        target: 'http://localhost:12220',
        configure(proxy) {
          proxy.on('error', (_, req) => {
            console.error('    to', '/api' + req.url)
          })
        },
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // We want to actually hit Nexus for this because it gives us a login redirect
      '/login': {
        target: 'http://localhost:12220',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['app/test/unit/setup.ts'],
    includeSource: ['app/**/*.ts', 'libs/**/*.ts'],
  },
}))
