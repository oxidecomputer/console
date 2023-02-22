/**
 * https://playwright.dev/docs/test-advanced#global-setup-and-teardown
 */
import { createServer } from '@mswjs/http-middleware'

import { handlers } from '@oxide/api-mocks'

export default async function globalSetup() {
  createServer(...handlers).listen(12220)
}
