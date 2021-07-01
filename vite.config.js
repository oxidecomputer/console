import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import svgr from 'vite-plugin-svgr'

const root = process.cwd()

// https://vitejs.dev/config/
export default defineConfig({
  // TODO: add titleProp: true when svgr plugin supports it
  // https://github.com/pd4d10/vite-plugin-svgr/blob/83b07cb/src/index.ts#L6
  plugins: [reactRefresh(), svgr()],
  resolve: {
    alias: {
      '@oxide/ui': `${root}/libs/ui/src`,
      '@oxide/css-helpers': `${root}/libs/css-helpers`,
      '@oxide/api': `${root}/libs/api`,
      '@oxide/api-mocks': `${root}/libs/api-mocks`,
    },
  },
})
