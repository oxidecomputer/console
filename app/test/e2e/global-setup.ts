/**
 * https://playwright.dev/docs/test-advanced#global-setup-and-teardown
 */
import { createServer } from '@mswjs/http-middleware'
import { expect } from '@playwright/test'

import { handlers } from '@oxide/api-mocks'

export default async function globalSetup() {
  // e2e tests should only run with a standalone server meaning MSW should _not_ be set
  expect(process.env.MSW).toBeFalsy()

  // If pointing to a real nexus API don't mock
  if (process.env.API_URL) {
    createServer(...handlers).listen(12220)
  }
}
