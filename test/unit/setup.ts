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
import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { resetDb } from '@oxide/api-mocks'

import { server } from './server'

beforeAll(() => server.listen())
afterEach(() => {
  resetDb()
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
