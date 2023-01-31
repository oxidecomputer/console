import type { Plugin } from 'vite'

/**
 * Configure a safelist of path patterns that can be redirected to `/` despite
 * having a dot in them.
 *
 * Vite does not rewrite paths with dots in them to serve `/index.html`, likely
 * because it wants to assume they are static files that should be served
 * directly. See https://github.com/vitejs/vite/issues/2415.
 *
 * We have a few non-file console paths that we expect to contain a dot. Names
 * cannot contain dots, but semver versions always will. So we safelist some
 * paths that we expect to have dots so they will work in the dev server.
 *
 * If a path needs to be added to this safelist, it will show up as a blank page
 * in local dev and the Vite `--debug` output will say:
 *
 * "Not rewriting GET /has.dot because the path includes a dot (.) character."
 */
export const dotPathFixPlugin = (safeDotPaths: RegExp[]): Plugin => ({
  name: 'dot-path-fix',
  configureServer: (server) => {
    server.middlewares.use((req, _, next) => {
      if (req.url && safeDotPaths.some((p) => req.url?.match(p))) {
        req.url = '/'
      }
      next()
    })
  },
})
