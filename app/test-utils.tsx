import React from 'react'
import {
  BrowserRouter,
  unstable_HistoryRouter as HistoryRouter,
} from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import type { FetchMockStatic } from 'fetch-mock'
import { routes } from './routes'

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
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </BrowserRouter>
    ),
  })

export function renderAppAt(location: string) {
  const history = createMemoryHistory({ initialEntries: [location] })
  const rendered = render(
    <HistoryRouter history={history}>
      <QueryClientProvider client={queryClient}>{routes}</QueryClientProvider>
    </HistoryRouter>
  )
  return { history, rendered }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lastBody = (mock: FetchMockStatic): any =>
  JSON.parse(mock.lastOptions()?.body as unknown as string)

export * from '@testing-library/react'
export { customRender as render }
