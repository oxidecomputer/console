import react from '@vitejs/plugin-react'
import dns from 'dns'
import { resolve } from 'path'
import { defineConfig, splitVendorChunkPlugin } from 'vite'

import tsConfig from './tsconfig.json'

// Make Vite say localhost instead of 127.0.0.1 in startup message.
// See https://vitejs.dev/config/server-options.html#server-host
dns.setDefaultResultOrder('verbatim')

const mapObj = <V0, V>(
  obj: Record<string, V0>,
  kf: (t: string) => string,
  vf: (t: V0) => V
): Record<string, V> =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [kf(k), vf(v)]))

// see https://vitejs.dev/config/

export default defineConfig(({ mode }) => ({
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    // minify: false, // uncomment for debugging
  },
  define: {
    'process.env.API_URL': JSON.stringify(process.env.API_URL ?? '/api'),
    'process.env.MSW': JSON.stringify(mode !== 'production' && process.env.MSW),
    'process.env.SHA': JSON.stringify(process.env.SHA),
  },
  plugins: [
    splitVendorChunkPlugin(),
    react({
      babel: {
        plugins:
          mode === 'development' ? ['./libs/babel-transform-react-display-name'] : [],
      },
    }),
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
    setupFiles: ['app/test/setup.ts'],
    includeSource: ['libs/util/*.ts'],
  },
}))
