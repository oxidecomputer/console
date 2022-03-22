import 'whatwg-fetch' // our node fetch polyfill of choice
import '@testing-library/jest-dom' // fancy asserts

import { resetDb } from '@oxide/api-mocks'
import { server } from './server'

beforeAll(() => server.listen())
afterEach(() => {
  resetDb()
  server.resetHandlers()
})
afterAll(() => server.close())
