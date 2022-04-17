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

// See https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#configuring-your-testing-environment
// @testing-library/react is supposed to handle this, not sure why it isn't
// https://github.com/testing-library/react-testing-library/blob/ccd8a0d97dd9da0a420f2cf012a24d414d1646ed/src/act-compat.js#L77
// @ts-expect-error
globalThis.IS_REACT_ACT_ENVIRONMENT = true
