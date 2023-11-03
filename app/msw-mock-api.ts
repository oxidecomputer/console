/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

function getChaos() {
  const chaos = parseFloat(process.env.CHAOS || '')
  return Number.isNaN(chaos) ? null : chaos
}

/** Percentage representing likelihood of random failure */
const chaos = getChaos()

if (process.env.NODE_ENV !== 'production' && chaos) {
  console.log(`
   ▄████████    ▄█    █▄       ▄████████  ▄██████▄     ▄████████
  ███    ███   ███    ███     ███    ███ ███    ███   ███    ███
  ███    █▀    ███    ███     ███    ███ ███    ███   ███    █▀
  ███         ▄███▄▄▄▄███▄▄   ███    ███ ███    ███   ███
  ███        ▀▀███▀▀▀▀███▀  ▀███████████ ███    ███ ▀███████████
  ███    █▄    ███    ███     ███    ███ ███    ███          ███
  ███    ███   ███    ███     ███    ███ ███    ███    ▄█    ███
  ████████▀    ███    █▀      ███    █▀   ▀██████▀   ▄████████▀

     ▄▄▄▄███▄▄▄▄    ▄██████▄  ████████▄     ▄████████
   ▄██▀▀▀███▀▀▀██▄ ███    ███ ███   ▀███   ███    ███
   ███   ███   ███ ███    ███ ███    ███   ███    █▀
   ███   ███   ███ ███    ███ ███    ███  ▄███▄▄▄
   ███   ███   ███ ███    ███ ███    ███ ▀▀███▀▀▀
   ███   ███   ███ ███    ███ ███    ███   ███    █▄
   ███   ███   ███ ███    ███ ███   ▄███   ███    ███
    ▀█   ███   █▀   ▀██████▀  ████████▀    ██████████
  `)
  console.log(`Running MSW in CHAOS MODE with ${chaos}% likelihood of random failure`)
}

/** Return true for failure with a given likelihood */
function shouldFail(likelihoodPct: number | null): boolean {
  if (likelihoodPct == null || Number.isNaN(likelihoodPct)) return false
  return likelihoodPct > Math.random() * 100
}

/** min is inclusive, max is exclusive. both assumed integers */
const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min))

const randomStatus = () => {
  // repeats are for weighting
  const codes = [401, 403, 404, 404, 404, 404, 404, 500, 500]
  return codes[randInt(0, codes.length)]
}

const sleep = async (ms: number) => new Promise((res) => setTimeout(res, ms))

export async function startMockAPI() {
  // dynamic imports to make extremely sure none of this code ends up in the prod bundle
  const { handlers } = await import('@oxide/api-mocks')
  const { http, HttpResponse } = await import('msw')
  const { setupWorker } = await import('msw/browser')

  // defined in here because it depends on the dynamic import
  const interceptAll = http.all('/v1/*', async () => {
    // random delay on all requests to simulate a real API
    await sleep(randInt(200, 400))

    if (shouldFail(chaos)) {
      // special header lets client indicate chaos failures so we don't get confused
      return new HttpResponse(null, {
        status: randomStatus(),
        headers: {
          'X-Chaos': '',
        },
      })
    }
    // don't return anything means fall through to the real handlers
  })

  // https://mswjs.io/docs/api/setup-worker/start#options
  await setupWorker(interceptAll, ...handlers).start({
    quiet: true, // don't log successfully handled requests
    // custom handler only to make logging less noisy. unhandled requests still
    // pass through to the server
    onUnhandledRequest(req) {
      const path = new URL(req.url).pathname
      // Files that get pulled in dynamic imports. It is expected that MSW will
      // not handle them and they fall through to the dev server, so warning
      // about them is just noise.
      const ignore = [
        path.includes('libs/ui/assets'),
        path.startsWith('/app'),
        path.startsWith('/node_modules'),
      ].some(Boolean)
      if (!ignore) {
        // message format copied from MSW source
        console.warn(`[MSW] Warning: captured an API request without a matching request handler:

  • ${req.method} ${path}

If you want to intercept this unhandled request, create a request handler for it.`)
      }
    },
  })
}
