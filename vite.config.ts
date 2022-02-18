import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import tsConfig from './tsconfig.json'

const mapObj = <V0, V>(
  obj: Record<string, V0>,
  kf: (t: string) => string,
  vf: (t: V0) => V
): Record<string, V> =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [kf(k), vf(v)]))

// see https://vitejs.dev/config/

export default defineConfig(({ mode }) => ({
  root: './app',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'app/index.html'),
      },
    },
    // minify: false, // uncomment for debugging
  },
  define: {
    'process.env.API_URL': JSON.stringify(process.env.API_URL),
    'process.env.MSW': JSON.stringify(mode !== 'production' && process.env.MSW),
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
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // We want to actually hit Nexus for this because it gives us a login redirect
      '/login': {
        target: 'http://localhost:12220',
      },
    },
  },
  test: {
    global: true,
    environment: 'jsdom',
    setupFiles: ['app/test/setup.ts'],
  },
}))
