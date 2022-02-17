import 'whatwg-fetch' // our node fetch polyfill of choice
import '@testing-library/jest-dom' // fancy asserts

import { setLogger } from 'react-query'
import { resetDb } from '@oxide/api-mocks'
import { server } from './server'

// react-query calls console.error whenever a request fails.
// this is annoying and we don't need it. leave log and warn there
// just in case they tell us something useful
setLogger({
  log: console.log,
  warn: console.warn,
  error: () => {},
})

beforeAll(() => server.listen())
afterEach(() => {
  resetDb()
  server.resetHandlers()
})
afterAll(() => server.close())
