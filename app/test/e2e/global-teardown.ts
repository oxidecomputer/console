/**
 * https://playwright.dev/docs/test-advanced#global-setup-and-teardown
 */
import { server } from './global-setup'

export default async function globalTeardown() {
  server.close()
}
