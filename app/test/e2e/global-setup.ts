/**
 * https://playwright.dev/docs/test-advanced#global-setup-and-teardown
 */
import { createServer } from '@mswjs/http-middleware'

import { handlers } from '@oxide/api-mocks'

export default async function globalSetup() {
  // For tests not relying on mocked data and not pointing to a real server, start a local mock server
  if (!process.env.API_URL) {
    createServer(...handlers).listen(12220)
  }
}
