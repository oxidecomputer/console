import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import svgr from '@svgr/core'
import esbuild from 'esbuild'
import fs from 'fs'

import tsConfig from './tsconfig.json'

const mapValues = (obj, f) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, f(v)]))

// based loosely on existing plugin: https://github.com/pd4d10/vite-plugin-svgr/
// ours is shorter, supports passing svgr options, and allows `import Arrow`
// instead of `import { ReactComponent as Arrow }`
const svgrPlugin = (svgrOptions) => ({
  name: 'vite:svgr',
  async transform(_, id) {
    if (id.endsWith('.svg')) {
      const svg = fs.readFileSync(id, 'utf8')
      const component = svgr.sync(svg, svgrOptions)
      const res = esbuild.transformSync(component, { loader: 'jsx' })
      return { code: res.code, map: null /* TODO */ }
    }
  },
})

// see https://vitejs.dev/config/

export default {
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
  plugins: [react(), svgrPlugin({ titleProp: true })],
  resolve: {
    // turn relative paths from tsconfig into absolute paths
    alias: mapValues(tsConfig.compilerOptions.paths, (p) =>
      resolve(__dirname, p[0])
    ),
  },
  server: {
    fs: {
      strict: true,
    },
    port: 4000,
    proxy: {
      '/api': {
        target: 'http://localhost:12220',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
}
