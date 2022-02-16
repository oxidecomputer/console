import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { json } from '@oxide/api-mocks'
import 'whatwg-fetch'
import '@testing-library/jest-dom'

import { routes } from './routes'
import { handlers, resetDb } from '@oxide/api-mocks'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { setLogger } from 'react-query'

// react-query calls console.error whenever a request fails.
// this is annoying and we don't need it. leave log and warn there
// just in case they tell us something useful
setLogger({
  log: console.log,
  warn: console.warn,
  error: () => {},
})

/*****************************************
 * MSW
 ****************************************/
const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => {
  resetDb()
  server.resetHandlers()
})
afterAll(() => server.close())

// Override request handlers in order to test special cases
export function override(
  method: keyof typeof rest,
  path: string,
  status: number,
  body: string | Record<string, unknown>
) {
  server.use(
    rest[method](path, (_req, res, ctx) =>
      typeof body === 'string'
        ? res(ctx.status(status), ctx.text(body))
        : res(json(body, status))
    )
  )
}

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

const customRender = (ui: React.ReactElement) =>
  render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient()}>
        {children}
      </QueryClientProvider>
    ),
  })

export function renderAppAt(url: string) {
  window.history.pushState({}, 'Test page', url)
  return render(routes, {
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
import userEvent from '@testing-library/user-event'
export { customRender as render, userEvent }

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
