import type { FC, ReactElement } from 'react'
import React from 'react'
import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const Providers: FC = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => render(ui, { wrapper: Providers, ...options })

export * from '@testing-library/react'
export { customRender as render }
