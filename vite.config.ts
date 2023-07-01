import react from '@vitejs/plugin-react'
import fs from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import { z } from 'zod'

import { dotPathFixPlugin } from './libs/vite-plugin-dot-path-fix'
import tsConfig from './tsconfig.json'

const DevApiMode = z.enum(['msw', 'nexus', 'dogfood'])

const devApiModeResult = DevApiMode.default('msw').safeParse(process.env.API_MODE)
if (!devApiModeResult.success) {
  const options = DevApiMode.options.join(', ')
  console.error(`Error: API_MODE must be one of: [${options}]. If unset, default is "msw".`)
  process.exit(1)
}
/**
 * What API are we talking to? Only relevant in development mode.
 *
 * - `msw` (default): Mock Service Workers
 * - `nexus`: Nexus with simulated sled agent running on localhost:12220
 * - `dogfood`: Dogfood rack at recovery.sys.rack2.eng.oxide.computer. Requires
 *   TLS certs.
 */
const devApiMode = devApiModeResult.data

const getTlsCerts = () => ({
  key: fs.readFileSync('../dogfood-tls-key.pem'),
  cert: fs.readFileSync('../dogfood-tls-cert.pem'),
})

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
    },
  },
  define: {
    'process.env.API_URL': JSON.stringify(mode === 'production' ? '' : '/api'),
    'process.env.MSW': JSON.stringify(mode !== 'production' && devApiMode === 'msw'),
    // used in production build to console.log the SHA at page load
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
    dotPathFixPlugin([new RegExp('^/system/update/updates/' + semverRegex)]),
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
    https: devApiMode === 'dogfood' ? getTlsCerts() : undefined,
    // these only get hit when MSW doesn't intercept the request
    proxy: {
      '/api': {
        target:
          devApiMode === 'dogfood'
            ? 'https://recovery.sys.rack2.eng.oxide.computer'
            : 'http://localhost:12220',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('error', (_, req) => {
            console.error('    to', '/api' + req.url)
          })
        },
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws-serial-console': {
        target:
          // in msw mode, serial console is served by tools/deno/mock-serial-console.ts
          devApiMode === 'dogfood'
            ? 'wss://recovery.sys.rack2.eng.oxide.computer'
            : 'ws://localhost:' + (devApiMode === 'msw' ? 6036 : 12220),
        ws: true,
        configure(proxy) {
          proxy.on('error', (_, req) => {
            console.error('    to', '/ws-serial-console' + req.url)
          })
        },
        rewrite: (path) => path.replace(/^\/ws-serial-console/, ''),
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
