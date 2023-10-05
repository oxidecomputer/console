/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * This file is ran by vitest before any tests are ran. Configuration
 * in this file does _not_ impact end-to-end tests.
 */
import matchers, { type TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, expect } from 'vitest'

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
