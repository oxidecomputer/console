function getChaos() {
  const chaos = parseFloat(process.env.CHAOS || '')
  return Number.isNaN(chaos) ? null : chaos
}

/** Return true for failure with a given likelihood */
function shouldFail(likelihoodPct: number | null): boolean {
  if (likelihoodPct == null || Number.isNaN(likelihoodPct)) return false
  return likelihoodPct > Math.random() * 100
}

/** Percentage representing likelihood of random failure */
const chaos = getChaos()

if (chaos != null && chaos > 0) {
  console.log(`
   ██████╗██╗  ██╗ █████╗  ██████╗ ███████╗    ███╗   ███╗ ██████╗ ██████╗ ███████╗
  ██╔════╝██║  ██║██╔══██╗██╔═══██╗██╔════╝    ████╗ ████║██╔═══██╗██╔══██╗██╔════╝
  ██║     ███████║███████║██║   ██║███████╗    ██╔████╔██║██║   ██║██║  ██║█████╗  
  ██║     ██╔══██║██╔══██║██║   ██║╚════██║    ██║╚██╔╝██║██║   ██║██║  ██║██╔══╝  
  ╚██████╗██║  ██║██║  ██║╚██████╔╝███████║    ██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗
   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝    ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝
  `)
  console.log(`Running MSW in CHAOS MODE with ${chaos}% likelihood of random failure`)
}

const randomStatus = () => {
  // repeats are for weighting
  const codes = [401, 403, 404, 404, 404, 404, 404, 500, 500]
  const i = Math.floor(Math.random() * codes.length)
  return codes[i]
}

export async function startMockAPI() {
  // dynamic imports to make extremely sure none of this code ends up in the prod bundle
  const { handlers } = await import('@oxide/api-mocks')
  const { setupWorker, rest, compose } = await import('msw')

  // defined in here because it depends on the dynamic import
  const chaosInterceptor = rest.all('/api/*', (_req, res, ctx) => {
    if (shouldFail(chaos)) {
      // special header lets client indicate chaos failures so we don't get confused
      // TODO: randomize status code
      return res(compose(ctx.status(randomStatus()), ctx.set('X-Chaos', '')))
    }
    // don't return anything means fall through to the real handlers
  })

  // mockServiceWorker.js needs to live at root, couldn't get app/ to work with
  // Vite. ugh don't ask
  const { default: workerUrl } = await import('../mockServiceWorker.js?url')
  // https://mswjs.io/docs/api/setup-worker/start#options
  await setupWorker(chaosInterceptor, ...handlers).start({
    quiet: true, // don't log successfully handled requests
    serviceWorker: { url: workerUrl },
    // custom handler only to make logging less noisy. unhandled requests still
    // pass through to the server
    onUnhandledRequest(req) {
      const path = req.url.pathname
      const ignore = [
        path.includes('libs/ui/assets'), // assets obviously loaded from file system
        path.startsWith('/forms/'), // lazy loaded forms
      ].some(Boolean)
      if (!ignore) {
        // message format copied from MSW source
        console.warn(`[MSW] Warning: captured an API request without a matching request handler:

  • ${req.method} ${req.url.pathname}

If you want to intercept this unhandled request, create a request handler for it.`)
      }
    },
  })
}
