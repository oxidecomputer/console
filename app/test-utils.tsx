import '@testing-library/jest-dom'

import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import type { FetchMockStatic } from 'fetch-mock'
import { setLogger } from 'react-query'

// react-query calls console.error whenever a request fails.
// this is annoying and we don't need it. leave log and warn there
// just in case they tell us something useful
setLogger({
  log: console.log,
  warn: console.warn,
  error: () => {},
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const customRender = (ui: React.ReactElement) =>
  render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

export const renderWithRouter = (ui: React.ReactElement) =>
  render(ui, {
    wrapper: ({ children }) => (
      <Router>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Router>
    ),
  })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lastBody = (mock: FetchMockStatic): any =>
  JSON.parse(mock.lastOptions()?.body as unknown as string)

export * from '@testing-library/react'
export { customRender as render }
