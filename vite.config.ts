import react from '@vitejs/plugin-react'
import fs from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vite'

import { dotPathFixPlugin } from './libs/vite-plugin-dot-path-fix'
import tsConfig from './tsconfig.json'

// There are a few basic "modes" we run the dev server in, indicated by env
// vars:
//
// - "default" mode, local dev against real local nexus on localhost:12220 (no
//   env var)
// - MSW mode, MSW=1 (note WS server has special behavior)
// - Dogfood mode, DOGFOOD=1

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
    https: process.env.DOGFOOD
      ? {
          key: fs.readFileSync('../rackkey.pem'),
          cert: fs.readFileSync('../rackcert.pem'),
        }
      : undefined,
    // these only get hit when MSW isn't intercepting requests
    proxy: {
      '/api': {
        target: process.env.DOGFOOD
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
        target: process.env.DOGFOOD
          ? 'wss://recovery.sys.rack2.eng.oxide.computer'
          : // local mock server vs Nexus
            'ws://localhost:' + (process.env.MSW ? 6036 : 12220),
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
