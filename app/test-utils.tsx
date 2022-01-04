import React from 'react'
import { BrowserRouter } from 'react-router-dom'
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

export function renderAppAt(url: string) {
  window.history.pushState({}, 'Test page', url)
  return render(routes, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </BrowserRouter>
    ),
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lastPostBody = (mock: FetchMockStatic): any =>
  JSON.parse(mock.lastOptions(undefined, 'POST')?.body as unknown as string)

export * from '@testing-library/react'
export { customRender as render }
