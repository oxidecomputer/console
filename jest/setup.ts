import '@testing-library/jest-dom'
import fetchMock from 'fetch-mock'
import { setLogger } from 'react-query'

// react-query calls console.error whenever a request fails.
// this is annoying and we don't need it. leave log and warn there
// just in case they tell us something useful
setLogger({
  log: console.log,
  warn: console.warn,
  error: () => {},
})

afterEach(() => fetchMock.reset())
