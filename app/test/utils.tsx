import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { fireEvent, render as tlRender, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { routes } from '../routes'
export { override } from './server'

/*****************************************
 * RENDERING
 ****************************************/

const queryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

export const customRender = (ui: React.ReactElement) =>
  tlRender(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient()}>
        {children}
      </QueryClientProvider>
    ),
  })

export function renderAppAt(url: string) {
  window.history.pushState({}, 'Test page', url)
  return tlRender(routes, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        <QueryClientProvider client={queryClient()}>
          {children}
        </QueryClientProvider>
      </BrowserRouter>
    ),
  })
}

/*****************************************
 * TESTING LIBRARY
 ****************************************/

export * from '@testing-library/react'

// convenience functions so we can click and type in a one-liner. these were
// initially created to use the user-event library, but it was remarkably slow.
// see if those issues are improved before trying that again

export function clickByRole(role: string, name: string) {
  const element = screen.getByRole(role, { name })
  fireEvent.click(element)
}

export function typeByRole(role: string, name: string, text: string) {
  const element = screen.getByRole(role, { name })
  fireEvent.change(element, { target: { value: text } })
}
