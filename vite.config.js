import reactRefresh from '@vitejs/plugin-react-refresh'
import svgr from 'vite-plugin-svgr'

// see https://vitejs.dev/config/

export default ({ mode }) => {
  if (mode === 'production' && !process.env.API_URL) {
    throw Error(
      '\n\nAPI_URL env var must be defined for production builds. You are probably attempting to run `yarn build` without it. See Vite config.\n'
    )
  }

  return {
    build: {
      sourcemap: 'inline',
    },
    define: {
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
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
  }
}
