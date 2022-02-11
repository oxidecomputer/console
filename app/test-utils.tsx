import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import type {
  SelectorMatcherOptions,
  waitForOptions,
} from '@testing-library/react'
import { waitFor } from '@testing-library/react'
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
export { customRender as render, userEvent }

// convenience functions so we can click and type in a one-liner

export async function clickByRole(role: string, name: string) {
  const element = screen.getByRole(role, { name })
  await userEvent.click(element)
}

export async function clickByText(
  text: string,
  options?: SelectorMatcherOptions
) {
  const element = screen.getByText(text, options)
  await fireEvent.click(element)
}

export function typeByRole(role: string, name: string, text: string) {
  const element = screen.getByRole(role, { name })
  fireEvent.change(element, { target: { value: text } })
}

/** If `matcher` is a string, it is matched exactly. */
export function getAllBySelectorAndText(
  selector: string,
  matcher: string | RegExp
) {
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => {
      if (!el.textContent) return false
      return typeof matcher === 'string'
        ? el.textContent === matcher
        : matcher.test(el.textContent)
    }
  )
}

function exactlyOneOrThrow(results: HTMLElement[], msg: string): HTMLElement {
  if (results.length === 0) {
    throw Error(`No element found with ${msg}`)
  }
  if (results.length > 1) {
    throw Error(`More than one element found with ${msg}`)
  }
  return results[0]
}

/** If `matcher` is a string, it is matched exactly. Throw if 0 or >1 results. */
export function getBySelectorAndText(
  selector: string,
  matcher: string | RegExp
) {
  return exactlyOneOrThrow(
    getAllBySelectorAndText(selector, matcher),
    `selector '${selector}' and matcher '${matcher}'`
  )
}

export function queryBySelectorAndText(
  selector: string,
  matcher: string | RegExp
) {
  try {
    return getBySelectorAndText(selector, matcher)
  } catch {
    return null
  }
}

export async function findBySelectorAndText(
  selector: string,
  matcher: string | RegExp,
  waitForOptions?: waitForOptions
) {
  return await waitFor(
    () => getBySelectorAndText(selector, matcher),
    waitForOptions
  )
}

export function clickBySelectorAndText(
  selector: string,
  matcher: string | RegExp
) {
  fireEvent.click(getBySelectorAndText(selector, matcher))
}

export function typeBySelectorAndText(
  selector: string,
  matcher: string | RegExp,
  value: string
) {
  fireEvent.change(getBySelectorAndText(selector, matcher), {
    target: { value },
  })
}

export function typeByLabelText(matcher: string | RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(matcher), {
    target: { value },
  })
}
export function clickByLabelText(matcher: string | RegExp) {
  fireEvent.click(screen.getByLabelText(matcher))
}
