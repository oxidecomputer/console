import type { FC, ReactElement } from 'react'
import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import type { FetchMockStatic } from 'fetch-mock'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const Providers: FC = ({ children }) => (
  <Router>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </Router>
)

const customRender = (ui: ReactElement) => render(ui, { wrapper: Providers })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lastBody = (mock: FetchMockStatic): any =>
  JSON.parse(mock.lastOptions()?.body as unknown as string)

export * from '@testing-library/react'
export { customRender as render }
