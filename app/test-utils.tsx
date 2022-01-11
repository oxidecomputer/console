import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { routes } from './routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

// this is necessary to prevent requests left in flight at the end of a test from
// coming back during another test and triggering whatever they would trigger
afterEach(() => queryClient.clear())

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

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
export { customRender as render }
