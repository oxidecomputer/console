import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
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

/*****************************************
 * TESTING LIBRARY
 ****************************************/

export * from '@testing-library/react'
import userEvent from '@testing-library/user-event'
export { userEvent }
export { customRender as render }

// export async function findByRoleAndClick(role: string, name: string) {
//   const element = await screen.findByRole(role, { name })
//   await userEvent.click(element)
// }

// export async function findByRoleAndType(
//   role: string,
//   name: string,
//   text: string
// ) {
//   const element = await screen.findByRole(role, { name })
//   await userEvent.type(element, text)
// }

export async function clickByRole(role: string, name: string) {
  const element = screen.getByRole(role, { name })
  await userEvent.click(element)
}

export async function typeByRole(role: string, name: string, text: string) {
  const element = screen.getByRole(role, { name })
  await userEvent.type(element, text)
}
