import { resolve } from 'path'
import reactRefresh from '@vitejs/plugin-react-refresh'
import svgr from '@svgr/core'
import esbuild from 'esbuild'
import fs from 'fs'

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

export default ({ mode }) => {
  if (mode === 'production' && !process.env.API_URL) {
    throw Error(
      '\n\nAPI_URL env var must be defined for production builds. You are probably attempting to run `yarn build` without it. See Vite config.\n'
    )
  }

  return {
    root: './app',
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      sourcemap: 'inline',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'app/index.html'),
          docs: resolve(__dirname, 'app/docs/index.html'),
        },
      },
      minify: false,
    },
    define: {
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
    },
    plugins: [reactRefresh(), svgrPlugin({ titleProp: true })],
    resolve: {
      alias: {
        '@oxide/ui': resolve(__dirname, 'libs/ui'),
        '@oxide/api': resolve(__dirname, 'libs/api'),
        '@oxide/api-mocks': resolve(__dirname, 'libs/api-mocks'),
      },
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
}
