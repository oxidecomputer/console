import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { defineConfig } from 'vite'

import tsConfig from './tsconfig.json'

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

    /**
     * The below configuration is required for enabling MSW to be ran on a built
     * bundle. It ensures the contents of `mockServiceWorker.js` are served from
     * the root instead of from the assets directory like other scripts.
     *
     * We disable it on vercel because it's not needed there and it that build
     * to fail.
     */
    rollupOptions: process.env.VERCEL
      ? {}
      : {
          input: {
            app: 'index.html',
            msw: 'mockServiceWorker.js',
          },
          output: {
            entryFileNames: (assetInfo) => {
              return assetInfo.name === 'msw'
                ? 'mockServiceWorker.js' // put msw service worker in root
                : 'assets/[name]-[hash].js' // others in `assets`
            },
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
  plugins: [react()],
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
