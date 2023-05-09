/**
 * This file is ran by vitest before any tests are ran. Configuration
 * in this file does _not_ impact end-to-end tests.
 */
import matchers, { type TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, expect } from 'vitest'
// our node fetch polyfill of choice
import 'whatwg-fetch'

import { resetDb } from '@oxide/api-mocks'

import { server } from './server'

// fancy asserts
expect.extend(matchers)

// make TS not be confused by the jest matchers being on the vitest expect
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface JestAssertion<T = any>
    extends jest.Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}
}

beforeAll(() => server.listen())
afterEach(() => {
  resetDb()
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
