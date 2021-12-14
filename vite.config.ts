/// <reference types="vitest" />

import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import tsConfig from './tsconfig.json'

const mapValues = <T, U>(obj: Record<string, T>, f: (t: T) => U) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, f(v)]))

// see https://vitejs.dev/config/

export default defineConfig({
  root: './app',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'app/index.html'),
        docs: resolve(__dirname, 'app/docs/index.html'),
      },
    },
    // minify: false, // uncomment for debugging
  },
  define: {
    'process.env.API_URL': JSON.stringify(process.env.API_URL),
  },
  plugins: [react()],
  resolve: {
    // turn relative paths from tsconfig into absolute paths
    alias: mapValues(tsConfig.compilerOptions.paths, (p) =>
      resolve(__dirname, p[0])
    ),
  },
  server: {
    port: 4000,
    proxy: {
      '/api': {
        target: 'http://localhost:12220',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    global: true,
    deps: {
      inline: [
        'compute-scroll-into-view',
        'internmap',
        'prop-types',
        'react-focus-lock',
      ],
    },
    environment: 'jsdom',
  },
})
