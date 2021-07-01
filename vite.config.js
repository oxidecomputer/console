import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  resolve: {
    alias: {
      '@oxide/ui': 'libs/ui/src/index.ts',
      '@oxide/css-helpers': 'libs/css-helpers/index.ts',
      '@oxide/api': 'libs/api/index.ts',
      '@oxide/api-mocks': 'libs/api-mocks/index.ts',
    },
  },
})
