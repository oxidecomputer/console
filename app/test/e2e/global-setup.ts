/**
 * https://playwright.dev/docs/test-advanced#global-setup-and-teardown
 */
import http from 'http'
import { setupServer } from 'msw/node'

import { handlers } from '@oxide/api-mocks'

export const server = setupServer(
  // Serverside handlers _must_ have a host
  ...handlers.map((h) => {
    h.info.path = 'http://localhost' + h.info.path
    return h
  })
)

export default async function globalSetup() {
  server.listen()
  // Creates a passthrough http server at 12220 (Nexus' normal port). Requests
  // from the console will come here and the on request handler will forward the
  // request to localhost... but that forwarded request will be intercepted by MSW
  http
    .createServer()
    .listen(12220)
    .on('request', (req, res) => {
      const connector = http.request(
        {
          host: 'localhost',
          path: 'api' + req.url,
          method: req.method,
          headers: req.headers,
        },
        (resp) => {
          resp.pipe(res)
        }
      )
      req.pipe(connector)
    })
}
