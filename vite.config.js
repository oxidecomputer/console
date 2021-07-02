import { resolve } from 'path'
import reactRefresh from '@vitejs/plugin-react-refresh'
import svgr from '@svgr/core'
import esbuild from 'esbuild'
import fs from 'fs'

const svgrPlugin = () => ({
  name: 'vite:svgr',
  async transform(_, id) {
    if (id.endsWith('.svg')) {
      const svg = fs.readFileSync(id, 'utf8')
      const component = svgr.sync(svg)
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
    root: './apps/web-console',
    build: {
      outDir: resolve(__dirname, 'dist'),
      sourcemap: 'inline',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'apps/web-console/index.html'),
          docs: resolve(__dirname, 'apps/web-console/docs/index.html'),
        },
      },
    },
    define: {
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
    },
    // TODO: add titleProp: true when svgr plugin supports it
    // https://github.com/pd4d10/vite-plugin-svgr/blob/83b07cb/src/index.ts#L6
    plugins: [reactRefresh(), svgrPlugin()],
    resolve: {
      alias: {
        '@oxide/ui': resolve(__dirname, 'libs/ui/src'),
        '@oxide/api': resolve(__dirname, 'libs/api'),
        '@oxide/api-mocks': resolve(__dirname, 'libs/api-mocks'),
      },
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
  }
}
