import '@testing-library/jest-dom'
import fetchMock from 'fetch-mock'
import { setLogger } from 'react-query'
import 'whatwg-fetch'
import { server } from '../libs/api/msw/server'

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
  server.resetHandlers()
  fetchMock.reset()
})
afterAll(() => server.close())
