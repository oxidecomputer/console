import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'inline',
  },
  // TODO: add titleProp: true when svgr plugin supports it
  // https://github.com/pd4d10/vite-plugin-svgr/blob/83b07cb/src/index.ts#L6
  plugins: [reactRefresh(), svgr()],
  resolve: {
    alias: {
      '@oxide/ui': `${__dirname}/libs/ui/src`,
      '@oxide/css-helpers': `${__dirname}/libs/css-helpers`,
      '@oxide/api': `${__dirname}/libs/api`,
      '@oxide/api-mocks': `${__dirname}/libs/api-mocks`,
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
})
