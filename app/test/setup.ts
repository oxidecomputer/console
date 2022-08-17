// our node fetch polyfill of choice
import '@testing-library/jest-dom'
import 'whatwg-fetch'

// fancy asserts
import { resetDb } from '@oxide/api-mocks'

import { cleanup } from './helpers'
import { server } from './server'

beforeAll(() => server.listen())
afterEach(async () => {
  await cleanup()
  resetDb()
  server.resetHandlers()
})
afterAll(() => server.close())
