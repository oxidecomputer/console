import { DataBrowserRouter } from 'react-router-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { routes } from '../routes'
export { overrideOnce } from './server'

export const queryClientOptions = {
  defaultOptions: { queries: { retry: false } },
  // react-query calls console.error whenever a request fails.
  // this is annoying and we don't need it. leave log and warn there
  // just in case they tell us something useful
  logger: {
    log: console.log,
    warn: console.warn,
    error: () => {},
  },
}

export function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient(queryClientOptions)
  return (
    <QueryClientProvider client={queryClient}>
      <DataBrowserRouter fallbackElement={<span>loading</span>}>
        {children}
      </DataBrowserRouter>
    </QueryClientProvider>
  )
}

export function renderAppAt(url: string) {
  window.history.pushState({}, 'Test page', url)
  return render(routes, {
    wrapper: Wrapper,
  })
}

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
